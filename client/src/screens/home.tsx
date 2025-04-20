import React, { useCallback, useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TextInput, TouchableOpacity, ScrollView, Image, Modal, Alert } from "react-native";
import { useUserContext } from "@/context/user";
import { useNavigation, NavigationProp, useFocusEffect } from "@react-navigation/native";
import { RootStackParamList } from "@/types/types";
import { SelectList } from "react-native-dropdown-select-list";
import { Ionicons } from "@expo/vector-icons";
import Topbar from "@/components/topbar";
import ChompIn from "@/components/student/chomp-in";
import Navbar from "@/components/navbar";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.API_URL || "http://localhost:5000";

// Placeholder data until API routes are implemented
const MOCK_UPCOMING_SESSIONS = [
  { id: 1, class_name: "Introduction to Computer Science", time: "10:00 AM", day: "Monday" },
  { id: 2, class_name: "Mobile App Development", time: "2:30 PM", day: "Wednesday" },
  { id: 3, class_name: "Data Structures", time: "11:15 AM", day: "Friday" },
];

const MOCK_ATTENDANCE_SUMMARY = {
  total_classes: 3,
  total_sessions: 42,
  attended_sessions: 38,
  current_streak: 7,
  week_progress: 3, // out of 5 days
};

export default function Home() {
  const { user } = useUserContext();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [classes, setClasses] = useState<
    { class_name: string; 
      id: number; 
      professor_id: number 
    }[]>([]);
  const [selectedClass, setSelectedClass] = useState<{
    class_name: string;
    id: number;
    professor_id: number;
  } | null>(null);

  const [studentClasses, setStudentClasses] = useState<{
    id: number;
    class_name: string;
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
  }[]>([]);

  const [attendanceSummary, setAttendanceSummary] = useState<{
    total_sessions: number;
    attended_sessions: number;
    attendance_rate: number;
    current_streak: number;
    longest_streak: number;
  }>({
    total_sessions: 0,
    attended_sessions: 0,
    attendance_rate: 0,
    current_streak: 0,
    longest_streak: 0,
  });
  const [weekProgress, setWeekProgress] = useState<number>(0);
  const [upcomingSessions, setUpcomingSessions] = useState<{ id: number; class_name: string; day: string; time: string; }[]>([]);
  
  // For animations and UI effects
  const [isLoading, setIsLoading] = useState(false);

  //Professor function to fetch classes
  const classList = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/user/classrooms`, {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      }
    } 
    catch (error) { console.log(error); } 
    finally { setIsLoading(false); }
  };

  const classOptions = classes.map((cls) => ({
    key: cls.id.toString(),
    value: cls.class_name,
  }));

  useFocusEffect(
    useCallback(() => {
      if (user?.role === "professor") {
        classList();
      }
      else{ 
        fetchAttendanceSummary();
        fetchMyClasses();
      }
    }, [user])
  );

  //Update the week's progress and upcoming classes for that student
  useEffect(() => {
    const updateWeekProgress = () => {
      const currentDay = new Date().getDay();
  
      // Adjust for Monday (1) to Friday (5), clamp anything else to boundaries
      const adjustedProgress =
        currentDay === 0 ? 0 : // Sunday
        currentDay > 5 ? 5 :   // Saturday
        currentDay;
  
      setWeekProgress(adjustedProgress);
    };
  
    const generateUpcomingSessions = () => {
      if (studentClasses.length) {
        const today = new Date();
  
        const sessions = studentClasses.map(cls => {
          const startDate = new Date(cls.start_date);
          const endDate = new Date(cls.end_date);
  
          // Use class start date or today, whichever is later
          const nextDate = today > startDate ? today : startDate;
  
          return {
            id: cls.id,
            class_name: cls.class_name,
            day: nextDate.toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            }),
            time: `${cls.start_time.slice(0, 5)} - ${cls.end_time.slice(0, 5)}`,
          };
        });
  
        setUpcomingSessions(sessions);
      }
    };
  
    updateWeekProgress();
    generateUpcomingSessions();
  }, [studentClasses]);

  //Post for QR code generation [professor]
  const handleQRCreation = async () => {
    if (!selectedClass?.id) { return; }

    setIsLoading(true);
    const classId = selectedClass.id;

    try {
      const response = await fetch(`${API_URL}/api/user/generate-qr`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ classroom_id: classId }),
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        navigation.navigate("scan", { qrCode: data.qrImage });
      }
    } 
    catch (error) { console.log(error); } 
    finally { setIsLoading(false); }
  };

  //Attendance summary for professors [professor]
  const fetchAttendanceSummary = async () => {
    if (user?.role !== "student") { return; }
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/analytics/personal-stats`, {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();

        const formattedData = {
          total_sessions: Number(data.total_sessions) || 0,
          attended_sessions: Number(data.attended_sessions) || 0,
          attendance_rate: Number(data.attendance_rate) || 0,
          current_streak: Number(data.current_streak) || 0,
          longest_streak: Number(data.longest_streak) || 0,
        };
        setAttendanceSummary(formattedData);
      }
    }
    catch (error) { console.log(error); } 
    finally { setIsLoading(false); }
  };

  //Fetch all classes students are enrolled in [student]
  const fetchMyClasses = async () => {
    try {
      const response = await fetch(`${API_URL}/api/user/my-classes`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            credentials: 'include',
          },
      });

      if (response.ok) {
        const data = await response.json();
        setStudentClasses(data.classes);
      } 
      else { console.error('Failed to fetch classes'); }
    } 
    catch (error) { console.error('Error fetching classes:', error); }
  };

  //Handle upcoming classes for students
  // const fetchUpcomingClasses = async () => {
  //   try {
  //     const response = await fetch(`${API_URL}/api/user/my-next-sessions`, {
  //       method: "GET",
  //       credentials: "include",
  //     });
  //     if (response.ok) {
  //       const data = await response.json();
  //       setStudentClasses(data);
  //     }
  //   } 
  //   catch (error) { console.log(error); }
  // };

  const handleChompInPress = () => {
    navigation.navigate("scan", { qrCode: "" });
  };

  const renderProfessorView = () => {
    if (classes.length === 0) {
      return (
        <View style={styles.container}>
          <Topbar />
          <View style={styles.contentContainer}>
            <View style={styles.welcomeCard}>
              <Image
                source={require("../assets/images/home/logo-with-name.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
              
              <Text style={styles.welcomeTitle}>
                Welcome, Professor {user?.first_name}! 👋
              </Text>
              
              <Text style={styles.welcomeSubtitle}>
                You don't have any classes yet. Let's create your first class to get started.
              </Text>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate("class")}
              >
                <Text style={styles.actionButtonText}>Create Your First Class</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Navbar navigation={navigation} />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <Topbar />
        <ScrollView contentContainerStyle={styles.scrollContentContainer}>
          <View style={styles.welcomeBanner}>
            <Text style={styles.welcomeBannerText}>
              Welcome, Professor {user?.first_name}! 👋
            </Text>
          </View>
          
          <View style={styles.headerCard}>
            <Text style={styles.headerTitle}>Today's Date 📅</Text>
            <Text style={styles.headerSubtitle}>
              Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
          </View>
          
          <View style={styles.qrSection}>
            <Text style={styles.sectionTitle}>Generate Attendance QR Code</Text>
            
            <View style={styles.qrFormContainer}>
              <View style={styles.selectContainer}>
                <Text style={styles.selectLabel}>Select Class:</Text>
                <SelectList
                  setSelected={(val: string) => {
                    const selectedClass = classes.find(
                      (cls) => cls.class_name === val
                    );
                    setSelectedClass(selectedClass || null);
                  }}
                  data={classOptions}
                  save="value"
                  boxStyles={styles.selectBox}
                  dropdownStyles={styles.dropdownBox}
                  placeholder="Choose a class"
                />
              </View>
              
              <TouchableOpacity
                style={[
                  styles.qrButton,
                  !selectedClass && styles.qrButtonDisabled,
                  isLoading && styles.qrButtonLoading
                ]}
                onPress={handleQRCreation}
                disabled={!selectedClass || isLoading}
              >
                <Text style={styles.qrButtonText}>
                  {isLoading ? "Generating..." : "Generate QR Code"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.quickStatsSection}>
            <Text style={styles.sectionTitle}>Your Classes</Text>
            
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.classCardsContainer}
            >
              {classes.map((cls) => (
                <TouchableOpacity
                  key={cls.id}
                  style={styles.classCard}
                  onPress={() => setSelectedClass(cls)}
                >
                  <Text style={styles.classCardName}>{cls.class_name}</Text>
                  <View style={styles.classCardFooter}>
                    <Text style={styles.classCardId}>ID: {cls.id}</Text>
                    <TouchableOpacity
                      style={styles.quickGenerateButton}
                      onPress={() => {
                        setSelectedClass(cls);
                        setTimeout(() => handleQRCreation(), 100);
                      }}
                    >
                      <Ionicons name="qr-code" size={20} color="#333" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity
                style={styles.addClassCard}
                onPress={() => navigation.navigate("class")}
              >
                <Text style={styles.addClassIcon}>+</Text>
                <Text style={styles.addClassText}>Add New Class</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
          
          <TouchableOpacity
            style={styles.analyticsCard}
            onPress={() => navigation.navigate("analytics")}
          >
            <View style={styles.analyticsIconContainer}>
              <Text style={styles.analyticsIcon}>📊</Text>
            </View>
            <View style={styles.analyticsContent}>
              <Text style={styles.analyticsTitle}>View Detailed Analytics</Text>
              <Text style={styles.analyticsSubtitle}>
                Check attendance rates, top students, and more
              </Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
        <Navbar navigation={navigation} />
      </View>
    );
  };

  const renderStudentView = () => {
    return (
      <View style={styles.container}>
        <Topbar />
        <ScrollView contentContainerStyle={styles.scrollContentContainer}>
          <View style={styles.welcomeBanner}>
            <Text style={styles.welcomeBannerText}>
              Chomping in, {user?.first_name}?👋
            </Text>
          </View>
          
          <View style={styles.studentHeaderCard}>
            <View style={styles.studentHeaderContent}>
              <Text style={styles.studentHeaderTitle}>
                Ready to check in?
              </Text>
              <Text style={styles.studentHeaderSubtitle}>
                Scan a QR code to mark your attendance
              </Text>
            </View>
            <ChompIn title="Chomp-In?" onPress={handleChompInPress} />
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Attendance Summary</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{studentClasses.length}</Text>
                <Text style={styles.summaryLabel}>Classes</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{attendanceSummary.attended_sessions}/{attendanceSummary.total_sessions}</Text>
                <Text style={styles.summaryLabel}>Sessions</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{attendanceSummary.current_streak}</Text>
                <Text style={styles.summaryLabel}>Day Streak</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>This Week's Progress</Text>
            <View style={styles.weekProgress}>
              {['M', 'T', 'W', 'Th', 'F'].map((day, index) => (
                <View 
                  key={day + index} 
                  style={[
                    styles.weekDay, 
                    index < weekProgress ? styles.weekDayCompleted : {}
                  ]}
                >
                  <Text 
                    style={[
                      styles.weekDayText,
                      index < weekProgress ? styles.weekDayTextCompleted : {}
                    ]}
                  >
                    {day}
                  </Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
            </View>
            
            {upcomingSessions.map(session => (
              <View key={session.id} style={styles.sessionCard}>
                <View style={styles.sessionTime}>
                  <Text style={styles.sessionDay}>{session.day}</Text>
                  <Text style={styles.sessionHour}>{session.time}</Text>
                </View>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionClass}>{session.class_name}</Text>
                  <View style={styles.sessionStatus}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>Upcoming</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
          
          <TouchableOpacity
            style={styles.analyticsCard}
            onPress={() => navigation.navigate("analytics")}
          >
            <View style={styles.analyticsIconContainer}>
              <Text style={styles.analyticsIcon}>🏆</Text>
            </View>
            <View style={styles.analyticsContent}>
              <Text style={styles.analyticsTitle}>Check Your Ranking</Text>
              <Text style={styles.analyticsSubtitle}>
                View your stats and see how you compare to classmates
              </Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
        <Navbar navigation={navigation} />
      </View>
    );
  };

  if (user?.role === "professor") {
    return renderProfessorView();
  }

  return renderStudentView();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingTop: Constants.statusBarHeight,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  scrollContentContainer: {
    paddingTop: 70, // To account for Topbar
    paddingBottom: 100, // To account for Navbar
    paddingHorizontal: 16,
  },
  
  // Welcome banner
  welcomeBanner: {
    padding: 12,
  },
  welcomeBannerText: {
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  
  // Welcome card for empty state
  welcomeCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoImage: {
    width: 180,
    height: 100,
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    color: "#333",
  },
  welcomeSubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    color: "#666",
    lineHeight: 22,
  },
  actionButton: {
    backgroundColor: "#4FEEAC",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  
  // Professor view styles
  headerCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
  },
  
  qrSection: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  qrFormContainer: {
    marginTop: 8,
  },
  selectContainer: {
    marginBottom: 16,
  },
  selectLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: "#555",
  },
  selectBox: {
    borderColor: "#ddd",
    borderRadius: 8,
  },
  dropdownBox: {
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff", // Optional: Add a background color for better visibility
    padding: 8, // Optional: Add padding for better spacing
  },
  
  qrButton: {
    backgroundColor: "#4FEEAC",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  qrButtonDisabled: {
    backgroundColor: "#ccc",
  },
  qrButtonLoading: {
    backgroundColor: "#b4e9d2",
  },
  qrButtonText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  
  // Class cards
  quickStatsSection: {
    marginBottom: 16,
  },
  classCardsContainer: {
    flexDirection: "row",
    marginTop: 8,
    marginBottom: 8,
  },
  classCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    justifyContent: "space-between",
  },
  classCardName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  classCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  classCardId: {
    fontSize: 14,
    color: "#888",
  },
  quickGenerateButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  quickGenerateText: {
    fontSize: 12,
    color: "#555",
  },
  
  // Add class card
  addClassCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 160,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  addClassIcon: {
    fontSize: 28,
    color: "#666",
    marginBottom: 8,
  },
  addClassText: {
    fontSize: 14,
    color: "#666",
  },
  
  // Analytics card
  analyticsCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  analyticsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  analyticsIcon: {
    fontSize: 24,
  },
  analyticsContent: {
    flex: 1,
  },
  analyticsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  analyticsSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  
  // Student view styles
  studentHeaderCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  studentHeaderContent: {
    flex: 1,
    marginRight: 16,
  },
  studentHeaderTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  studentHeaderSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  
  // Section styles
  section: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: "#4FEEAC",
  },
  
  // Summary grid
  summaryGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
    padding: 12,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4FEEAC",
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  
  // Week progress
  weekProgress: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  weekDay: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  weekDayCompleted: {
    backgroundColor: "#4FEEAC",
  },
  weekDayText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#888",
  },
  weekDayTextCompleted: {
    color: "#333",
  },
  
  // Session cards
  sessionCard: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  sessionTime: {
    marginRight: 12,
    alignItems: "center",
    minWidth: 70,
  },
  sessionDay: {
    fontSize: 14,
    color: "#888",
    marginBottom: 4,
  },
  sessionHour: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  sessionInfo: {
    flex: 1,
  },
  sessionClass: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  sessionStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ffb238",
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: "#888",
  },
  
  // Legacy styles
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  text: {
    fontSize: 16,
  },
});