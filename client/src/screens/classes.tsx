import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TextInput, TouchableOpacity,ScrollView,Image,Modal,Alert } from "react-native";
import { SelectList } from 'react-native-dropdown-select-list';
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "@/types/types"; 
import { useUserContext } from "@/context/user";
import { Ionicons } from '@expo/vector-icons';
import Constants from "expo-constants";
import Navbar from '@/components/navbar';
import Topbar from '@/components/topbar';
import DateTimePicker from '@react-native-community/datetimepicker';

const API_URL = Constants.expoConfig?.extra?.API_URL || "http://localhost:5000";

// Mock data for student view
const MOCK_ENROLLED_CLASSES = [
  { id: 1, class_name: "Introduction to Computer Science", professor: "Dr. Smith", attendance_rate: 92 },
  { id: 2, class_name: "Mobile App Development", professor: "Dr. Johnson", attendance_rate: 88 },
  { id: 3, class_name: "Data Structures and Algorithms", professor: "Dr. Williams", attendance_rate: 96 },
  { id: 4, class_name: "Database Management", professor: "Dr. Brown", attendance_rate: 78 },
];

const timeBlocks = [
    { key: '1', value: '7:25 AM - 8:15 AM' },
    { key: '2', value: '8:30 AM - 9:20 AM' },
    { key: '3', value: '9:35 AM - 10:25 AM' },
    { key: '4', value: '10:40 AM - 11:30 AM' },
    { key: '5', value: '11:45 AM - 12:35 PM' },
    { key: '6', value: '12:50 PM - 1:40 PM' },
    { key: '7', value: '1:55 PM - 2:45 PM' },
    { key: '8', value: '3:00 PM - 3:50 PM' },
    { key: '9', value: '4:05 PM - 4:55 PM' },
    { key: '10', value: '5:10 PM - 6:00 PM' },
    { key: '11', value: '6:15 PM - 7:05 PM' },
];

export default function ClassScreen() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { user } = useUserContext();
    interface Class {
        id: number;
        professor_id: number;
        class_name: string;
        days_of_week: string[]; // matches the backend format
        start_date: string; // ISO string from the backend
        end_date: string;   // ISO string from the backend
        time_block_id: number;
    }
    const [classes, setClasses] = useState<Class[]>([]);
      
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [className, setClassName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedClass, setSelectedClass] = useState<number | null>(null);
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [selectedTimeBlock, setSelectedTimeBlock] = useState<number | null>(null);
    const [startDatePickerVisible, setStartDatePickerVisible] = useState(false);
    const [endDatePickerVisible, setEndDatePickerVisible] = useState(false);
    interface StudentClass {
        classroom_id: number;
        class_name: string;
        professor_name: string;
        total_sessions: number;
        present_count: number;
        late_count: number;
        attendance_rate: number;
    }
    const [studentClasses, setStudentClasses] = useState<StudentClass[]>([]);
    
    // For student view
    const [enrollModalVisible, setEnrollModalVisible] = useState(false);
    const [classCode, setClassCode] = useState("");

    // API route to fetch classroom of professor
    const classList = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/user/classrooms`, {
                method: "GET",
                credentials: "include",
            });
            if (response.ok) {
                const data = await response.json();
                // console.log("API response:", data);
                setClasses(data);
            }
        } 
        catch (error) { console.log(error); }
        finally { setLoading(false); }
    };

    // POST API to create a new class
    const createClass = async () => {
        if (!className.trim()){
            Alert.alert("Error", "Please enter a class name.");
            return;
        }
        if (selectedDays.length === 0) {
            Alert.alert("Error", "Please select at least one day.");
            return;
        }
        if (!selectedTimeBlock) {
            Alert.alert("Error", "Please select a time block.");
            return;
        }
        if (!startDate || !endDate) {
            Alert.alert("Error", "Please select both start and end dates.");
            return;
        }
        if (endDate < startDate) {
            Alert.alert("Error", "End date cannot be before start date.");
            return;
        }

        try{
            
            setIsSubmitting(true);
            const response = await fetch(`${API_URL}/api/user/create-classroom`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ 
                    className: className, 
                    daysOfWeek: selectedDays,
                    timeBlockId: selectedTimeBlock,
                    startDate: startDate,
                    endDate: endDate
                }),
            });

            if (response.ok) {
                const data = await response.json();
                // console.log("Class created:", data);
                setClasses((prevClasses) => [...prevClasses, data.classroom]);
                setClassName("");
                setSelectedDays([]);
                setSelectedTimeBlock(null);
                setStartDate(null);
                setEndDate(null);
                setModalVisible(false);
                Alert.alert("Success", "Class created successfully!");
            } 
            else { Alert.alert("Error", "Failed to create class. Please try again."); }
        }
        catch (error) { console.log(error); }
        finally { setIsSubmitting(false); }
    };

    const handleQRCreation = async (classId: number) => {
        setLoading(true);
    
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
        finally { setLoading(false); }
    };

    const getTimeBlockLabel = (timeBlockId: number | null | undefined) => {
        // console.log("Time Block ID:", timeBlockId);
        
        // Handle null, undefined, 0, NaN, etc.
        if (!timeBlockId && timeBlockId !== 0) return 'Not set';
        
        const timeBlock = timeBlocks.find(block => parseInt(block.key) === timeBlockId);
        if (timeBlock) { return timeBlock.value; } 
        else {
            // console.log("No timeBlock found for ID:", timeBlockId);
            return `Block ${timeBlockId}`;
        }
    };

    //   MAYBE HAVE SOMETHING TO DELETE CLASS

    // const enrollInClass = () => {
    //     // For now, just show a success message
    //     if (!classCode.trim()) {
    //         Alert.alert("Error", "Please enter a class code");
    //         return;
    //     }
        
    //     setEnrollModalVisible(false);
    //     setClassCode("");
    //     Alert.alert("Success", "Successfully enrolled in class!");
    // };

    useEffect(() => { 
        if (user?.role === "professor") { classList(); } 
        else if (user?.role === "student") {
            const fetchStudentClassStats = async () => {
                try {
                    const response = await fetch(`${API_URL}/api/analytics/student-class-info`, {
                        method: "GET",
                        credentials: "include",
                    });
                    if (response.ok) {
                        const data = await response.json();
                        console.log(data);
                        setStudentClasses(data.classes);
                    }
                } 
                catch (error) { console.log(error); }
                finally { setLoading(false); }
            };
            fetchStudentClassStats();
        }
    }, [user?.role]);

    //Helper function to toggle selected days
    const toggleDaySelection = (day: string) => {
        if (selectedDays.includes(day)) {setSelectedDays(selectedDays.filter(d => d !== day)); } 
        else { setSelectedDays([...selectedDays, day]); }
    };

    // Filter classes based on search term
    const filteredClasses = classes
    .filter((c) => {
      const nameMatch = c.class_name.toLowerCase().includes(searchTerm.toLowerCase());
      const profMatch = false; // or use actual logic if you reintroduce `professor`
      return user?.role === "professor" ? nameMatch : nameMatch || profMatch;
    })
    .map((c) => ({
      id: c.id,
      classData: {
        professor_id: c.professor_id,
        class_name: c.class_name,
        daysOfWeek: c.days_of_week || [],
        timeBlock: c.time_block_id,
        startDate: c.start_date || null,
        endDate: c.end_date || null,
      },
    }));
  
    const renderProfessorView = () => {
        if (loading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4FEEAC" />
                    <Text style={styles.loadingText}>Loading classes...</Text>
                </View>
            );
        }

        return (
            <View style={styles.professorContentContainer}>
                <View style={styles.headerSection}>
                    <Text style={styles.headerTitle}>Manage Your Classes 💼</Text>
                </View>

                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search classes..."
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                    />
                    {searchTerm.length > 0 && (
                        <TouchableOpacity 
                            style={styles.clearSearch}
                            onPress={() => setSearchTerm("")}
                        >
                            <Ionicons name="close-circle" size={20} color="#666" />
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity 
                            style={styles.createButton}
                            onPress={() => setModalVisible(true)}
                        >
                            <Ionicons name="add-circle" size={20} color="#333" />
                            <Text style={styles.createButtonText}>Create Class</Text>
                        </TouchableOpacity>

                {classes.length === 0 ? (
                    <View style={styles.emptyStateContainer}>
                        <Text style={styles.emptyStateTitle}>No Classes Found</Text>
                        <Text style={styles.emptyStateText}>
                            You don't have any classes yet. Create your first class to get started.
                        </Text>
                        <TouchableOpacity 
                            style={styles.emptyStateButton}
                            onPress={() => setModalVisible(true)}
                        >
                            <Text style={styles.emptyStateButtonText}>Create Your First Class</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <Text style={styles.listHeader}>
                            {filteredClasses.length} {filteredClasses.length === 1 ? "Class" : "Classes"} {searchTerm ? "Found" : ""}
                        </Text>
                        
                        <FlatList
                            data={filteredClasses}
                            renderItem={({ item }) => (
                                <View style={styles.classCard}>
                                    <View style={styles.classCardContent}>
                                        <View style={styles.classIconContainer}>
                                            <Text style={styles.classIconText}>
                                                {item.classData.class_name.charAt(0).toUpperCase()}
                                            </Text>
                                        </View>
                                        <View style={styles.classInfo}>
                                            <Text style={styles.className}>{item.classData.class_name}</Text>
                                            <View style={styles.scheduleInfoRow}>
                                                <Text style={styles.scheduleLabel}>ID</Text>
                                                <Text style={styles.scheduleValue}>{item.id}</Text>
                                            </View>
                                            <View style={styles.scheduleInfoRow}>
                                                <Text style={styles.scheduleLabel}>Day</Text>
                                                <Text style={styles.scheduleValue}>
                                                    {item.classData.daysOfWeek?.length
                                                    ? item.classData.daysOfWeek.join(', ')
                                                    : 'Not scheduled'}
                                                </Text>
                                            </View>
                                            <View style={styles.scheduleInfoRow}>
                                                <Text style={styles.scheduleLabel}>Time</Text>
                                                <Text style={styles.scheduleValue}>
                                                    {getTimeBlockLabel(item.classData.timeBlock)}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                    
                                    <View style={styles.classActions}>
                                        <TouchableOpacity 
                                            style={styles.classActionButton}
                                            onPress={() => { handleQRCreation(item.id);}}
                                        >
                                            <Ionicons name="qr-code" size={20} color="#333" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                            keyExtractor={(item) => item.id.toString()}
                            contentContainerStyle={styles.classesList}
                            showsVerticalScrollIndicator={false}
                        />
                    </>
                )}
                
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Create New Class</Text>
                                <TouchableOpacity 
                                    onPress={() => setModalVisible(false)}
                                    style={styles.modalCloseButton}
                                >
                                    <Ionicons name="close" size={24} color="#666" />
                                </TouchableOpacity>
                            </View>
                            
                            {/* Class Name Input */}
                            <Text style={styles.inputLabel}>Class Name</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Enter class name"
                                value={className}
                                onChangeText={setClassName}
                            />

                            {/* Days of week class happens */}
                            <Text style={styles.inputLabel}>Days of Week</Text>
                            <View style={styles.dayPickerContainer}>
                                {['M', 'T', 'W', 'Th', 'F'].map((day) => (
                                    <TouchableOpacity 
                                        key={day}
                                        style={[
                                            styles.dayButton,
                                            selectedDays.includes(day) && styles.dayButtonSelected
                                        ]}
                                        onPress={() => toggleDaySelection(day)}
                                    >
                                        <Text 
                                            style={[
                                                styles.dayButtonText,
                                                selectedDays.includes(day) && styles.dayButtonTextSelected
                                            ]}
                                        >
                                            {day}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.inputLabel}>Time Block</Text>
                            <SelectList
                                setSelected={(val: string) => setSelectedTimeBlock(parseInt(val))}
                                data={timeBlocks}
                                save="key"
                                boxStyles={styles.selectBox}
                                dropdownStyles={styles.dropdownBox}
                                placeholder="Select class time"
                            />

                            <View style={styles.dateRow}>
                                <View style={styles.dateColumn}>
                                    <Text style={styles.inputLabel}>Start Date</Text>
                                    <TouchableOpacity 
                                        style={styles.dateButton}
                                        onPress={() => setStartDatePickerVisible(true)}
                                    >
                                        <Text style={styles.dateButtonText}>
                                            {startDate ? startDate.toLocaleDateString() : "Select start date"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                
                                <View style={styles.dateColumn}>
                                    <Text style={styles.inputLabel}>End Date</Text>
                                    <TouchableOpacity 
                                        style={styles.dateButton}
                                        onPress={() => setEndDatePickerVisible(true)}
                                    >
                                        <Text style={styles.dateButtonText}>
                                            {endDate ? endDate.toLocaleDateString() : "Select end date"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Start Date Picker Modal */}
                            <Modal
                                transparent={true}
                                visible={startDatePickerVisible}
                                animationType="slide"
                                onRequestClose={() => setStartDatePickerVisible(false)}
                            >
                                <View style={styles.datePickerModalOverlay}>
                                    <View style={styles.datePickerContainer}>
                                        <View style={styles.datePickerHeader}>
                                            <Text style={styles.datePickerTitle}>Select Start Date</Text>
                                            <TouchableOpacity onPress={() => setStartDatePickerVisible(false)}>
                                                <Ionicons name="close" size={24} color="#666" />
                                            </TouchableOpacity>
                                        </View>
                                        <DateTimePicker
                                            value={startDate || new Date()}
                                            mode="date"
                                            display="spinner"
                                            onChange={(event, date) => {
                                                if (date) setStartDate(date);
                                            }}
                                            style={styles.datePicker}
                                        />
                                        <TouchableOpacity 
                                            style={styles.datePickerConfirmButton}
                                            onPress={() => setStartDatePickerVisible(false)}
                                        >
                                            <Text style={styles.datePickerConfirmText}>Confirm</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </Modal>

                            {/* End Date Picker Modal */}
                            <Modal
                                transparent={true}
                                visible={endDatePickerVisible}
                                animationType="slide"
                                onRequestClose={() => setEndDatePickerVisible(false)}
                            >
                                <View style={styles.datePickerModalOverlay}>
                                    <View style={styles.datePickerContainer}>
                                        <View style={styles.datePickerHeader}>
                                            <Text style={styles.datePickerTitle}>Select End Date</Text>
                                            <TouchableOpacity onPress={() => setEndDatePickerVisible(false)}>
                                                <Ionicons name="close" size={24} color="#666" />
                                            </TouchableOpacity>
                                        </View>
                                        <DateTimePicker
                                            value={endDate || new Date()}
                                            mode="date"
                                            display="spinner"
                                            onChange={(event, date) => {
                                                if (date) setEndDate(date);
                                            }}
                                            style={styles.datePicker}
                                        />
                                        <TouchableOpacity 
                                            style={styles.datePickerConfirmButton}
                                            onPress={() => setEndDatePickerVisible(false)}
                                        >
                                            <Text style={styles.datePickerConfirmText}>Confirm</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </Modal>


                            
                            <TouchableOpacity 
                                style={[
                                    styles.modalButton,
                                    isSubmitting && styles.disabledButton
                                ]}
                                onPress={createClass}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.modalButtonText}>Create Class</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                
                {/* Delete Confirmation Modal */}
                {/* <Modal
                    animationType="fade"
                    transparent={true}
                    visible={deleteModalVisible}
                    onRequestClose={() => setDeleteModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.confirmModalContent}>
                            <Text style={styles.confirmModalTitle}>Delete Class</Text>
                            <Text style={styles.confirmModalText}>
                                Are you sure you want to delete this class? This action cannot be undone.
                            </Text>
                            
                            <View style={styles.confirmModalButtons}>
                                <TouchableOpacity 
                                    style={styles.cancelButton}
                                    onPress={() => setDeleteModalVisible(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={styles.deleteConfirmButton}
                                    onPress={deleteClass}
                                >
                                    <Text style={styles.deleteConfirmButtonText}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal> */}
            </View>
        );
    };

    const renderStudentView = () => {
        if (loading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4FEEAC" />
                    <Text style={styles.loadingText}>Loading classes...</Text>
                </View>
            );
        }
        return (
            <View style={styles.studentContentContainer}>
                <View style={styles.studentHeader}>
                    <Text style={styles.headerTitle}>My Classes</Text>
                    {/* Maybe have it, depends on how we decide between automatic QR code enrollement or just manual */}
                    {/* <TouchableOpacity 
                        style={styles.enrollButton}
                        onPress={() => setEnrollModalVisible(true)}
                    >
                        <Ionicons name="add-circle" size={20} color="#333" />
                        <Text style={styles.enrollButtonText}>Enroll in Class</Text>
                    </TouchableOpacity> */}
                </View>

                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search classes or professors..."
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                    />
                    {searchTerm.length > 0 && (
                        <TouchableOpacity 
                            style={styles.clearSearch}
                            onPress={() => setSearchTerm("")}
                        >
                            <Ionicons name="close-circle" size={20} color="#666" />
                        </TouchableOpacity>
                    )}
                </View>

                <Text style={styles.listHeader}>
                    {studentClasses.length} {studentClasses.length === 1 ? "Class" : "Classes"} {searchTerm ? "Found" : ""}
                </Text>
                
                <FlatList
                    data={studentClasses.filter(cls =>
                        cls.class_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (cls.professor_name || "").toLowerCase().includes(searchTerm.toLowerCase())
                    )}
                    renderItem={({ item }) => (
                        <View style={styles.studentClassCard}>
                            <View style={styles.studentClassHeader}>
                                <View style={styles.classIconContainer}>
                                    <Text style={styles.classIconText}>
                                        {item.class_name.substring(0, 3).toUpperCase()}
                                    </Text>
                                </View>
                                <View style={styles.studentClassInfo}>
                                    <Text style={styles.className}>{item.class_name}</Text>
                                    <Text style={styles.professorName}>{item.professor_name}</Text>
                                </View>
                            </View>

                            <View style={styles.classDetailsContainer}>
                                <Text style={styles.classDetailsText}>
                                    <Text style={styles.detailsLabel}>Total Sessions:</Text> {item.total_sessions}
                                </Text>
                                <Text style={styles.classDetailsText}>
                                    <Text style={styles.detailsLabel}>Present + Late:</Text> {item.present_count + item.late_count}
                                </Text>
                                <Text style={styles.classDetailsText}>
                                    <Text style={styles.detailsLabel}>Attendance Rate:</Text> {item.attendance_rate}%
                                </Text>
                            </View>
                        </View>
                    )}
                    keyExtractor={(item) => item.classroom_id.toString()}
                    contentContainerStyle={styles.classesList}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Topbar />
            {user?.role === "professor" ? renderProfessorView() : renderStudentView()}
            <Navbar navigation={navigation} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        fontSize: 16,
        color: "#666",
        marginTop: 12,
    },
    
    // Common content styles
    professorContentContainer: {
        flex: 1,
        paddingTop: Constants.statusBarHeight * 2,
        paddingBottom: 70, // Space for Navbar
        paddingHorizontal: 16,
    },
    studentContentContainer: {
        flex: 1,
        paddingTop: Constants.statusBarHeight,
        paddingBottom: 70, // Space for Navbar
        paddingHorizontal: 16,
    },
    
    // Header section
    headerSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 1,
        marginTop: 16,
    },
    headerTitle: {
        fontSize: 30,
        fontWeight: "bold",
        color: "#333",
    },
    createButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#4FEEAC",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 16,
    },
    createButtonText: {
        marginLeft: 6,
        fontWeight: "600",
        color: "#333",
    },
    
    // Search container
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: "#333",
    },
    clearSearch: {
        padding: 4,
    },
    
    // Empty state
    emptyStateContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
    },
    emptyStateImage: {
        width: 150,
        height: 80,
        marginBottom: 24,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 8,
        textAlign: "center",
    },
    emptyStateText: {
        fontSize: 16,
        color: "#666",
        marginBottom: 24,
        textAlign: "center",
        lineHeight: 22,
    },
    emptyStateButton: {
        backgroundColor: "#4FEEAC",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    emptyStateButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    
    // List header
    listHeader: {
        fontSize: 16,
        fontWeight: "600",
        color: "#666",
        marginBottom: 12,
    },
    
    // Class cards for professor view
    classesList: {
        paddingBottom: 24,
    },
    classCard: {
        backgroundColor: "white",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    classCardContent: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    classIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#4FEEAC",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    classIconText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
    },
    classInfo: {
        flex: 1,
    },
    className: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 4,
    },
    classId: {
        fontSize: 14,
        color: "#888",
    },
    classActions: {
        flexDirection: "row",
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0",
        paddingTop: 12,
        justifyContent: "flex-end",
    },
    classActionButton: {
        padding: 8,
        marginLeft: 12,
        borderRadius: 6,
        backgroundColor: "#f6f6f6",
    },
    deleteButton: {
        backgroundColor: "#ffeeee",
    },
    
    // Modal styles
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        backgroundColor: "white",
        borderRadius: 16,
        padding: 24,
        width: "85%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
    },
    modalCloseButton: {
        padding: 4,
    },
    inputLabel: {
        fontSize: 16,
        color: "#555",
        marginBottom: 8,
    },
    modalInput: {
        backgroundColor: "#f9f9f9",
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#eee",
    },
    modalButton: {
        backgroundColor: "#4FEEAC",
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
    },
    disabledButton: {
        backgroundColor: "#b4e9d2",
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    
    // Confirmation modal
    confirmModalContent: {
        backgroundColor: "white",
        borderRadius: 16,
        padding: 24,
        width: "85%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    confirmModalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 12,
    },
    confirmModalText: {
        fontSize: 16,
        color: "#666",
        marginBottom: 24,
        lineHeight: 22,
    },
    confirmModalButtons: {
        flexDirection: "row",
        justifyContent: "flex-end",
    },
    cancelButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginRight: 12,
    },
    cancelButtonText: {
        fontSize: 16,
        color: "#666",
    },
    deleteConfirmButton: {
        backgroundColor: "#ff3b30",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    deleteConfirmButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "white",
    },
    // Student view styles
    studentHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
        marginTop: 16,
        paddingTop: Constants.statusBarHeight,
    },
    enrollButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#4FEEAC",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    enrollButtonText: {
        marginLeft: 6,
        fontWeight: "600",
        color: "#333",
    },
    
    // Class stats for student view
    classStatsContainer: {
        flexDirection: "row",
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        backgroundColor: "white",
        borderRadius: 12,
        padding: 12,
        marginHorizontal: 4,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    statValue: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#4FEEAC",
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: "#666",
        textAlign: "center",
    },
    
    // Student class cards
    studentClassCard: {
        backgroundColor: "white",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    studentClassHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    studentClassInfo: {
        flex: 1,
    },
    professorName: {
        fontSize: 14,
        color: "#666",
    },
    
    // Attendance display
    attendanceContainer: {
        marginVertical: 12,
    },
    attendanceLabel: {
        fontSize: 14,
        color: "#666",
        marginBottom: 6,
    },
    attendanceBarContainer: {
        height: 16,
        backgroundColor: "#f0f0f0",
        borderRadius: 8,
        overflow: "hidden",
        position: "relative",
    },
    attendanceBar: {
        height: "100%",
        borderRadius: 8,
    },
    attendanceExcellent: {
        backgroundColor: "#4FEEAC", // Green
    },
    attendanceGood: {
        backgroundColor: "#FFD166", // Yellow
    },
    attendanceNeeds: {
        backgroundColor: "#EF476F", // Red
    },
    attendancePercent: {
        position: "absolute",
        right: 8,
        top: 0,
        bottom: 0,
        textAlignVertical: "center",
        fontSize: 12,
        fontWeight: "bold",
        color: "#333",
    },
    
    // Student class actions
    studentClassActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0",
    },
    studentClassButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f6f6f6",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        marginLeft: 8,
    },
    studentClassButtonText: {
        fontSize: 14,
        color: "#333",
        marginLeft: 4,
    },
    dateButton: {
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginTop: 4,
    },
    dateButtonText: {
        fontSize: 14,
        color: '#333',
    },
    dayPickerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        marginTop: 4,
    },
    dayButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    dayButtonSelected: {
        backgroundColor: '#4FEEAC',
        borderColor: '#4FEEAC',
    },
    dayButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#666',
    },
    dayButtonTextSelected: {
        color: '#333',
    },
    selectBox: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 16,
        marginTop: 4,
    },
    dropdownBox: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
    },
    dateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    dateColumn: {
        width: '48%',
    },
    datePickerModalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    datePickerContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        width: '80%',
        alignItems: 'center',
    },
    datePickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
    },
    datePickerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    datePicker: {
        width: '100%',
    },
    datePickerConfirmButton: {
        backgroundColor: '#4FEEAC',
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 8,
        marginTop: 20,
    },
    datePickerConfirmText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    scheduleInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    scheduleLabel: {
        fontSize: 14,
        fontWeight: "bold",
        marginRight: 4,
    },
    scheduleValue: {
        fontSize: 14,
    },
    classDetailsContainer: {
        marginTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 10,
    },
    classDetailsText: {
        fontSize: 14,
        color: '#333',
        marginBottom: 8,
    },
    detailsLabel: {
        fontWeight: 'bold',
    },
});