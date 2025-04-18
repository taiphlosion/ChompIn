import React, {useEffect, useState} from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { useUserContext } from "@/context/user";
import { RootStackParamList } from "@/types/types"; 
import Navbar from '@/components/navbar';
import Constants from "expo-constants";
import Topbar from '@/components/topbar';

const API_URL = Constants.expoConfig?.extra?.API_URL || "http://localhost:5000";

export default function Analytics() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [isLoadingAttendanceData, setIsLoadingAttendanceData] = useState(false);
    const { user } = useUserContext();
    const [classAttendanceData, setClassAttendanceData] = useState<{ id: number; class_name: string; sessions_count: number; attendance_rate: number; }[]>([]);
    const [topStudentsData, setTopStudentsData] = useState<{ id: number; student_name: string; attendance_count: number; attendance_rate: number; }[]>([]);
    const [personalStats, setPersonalStats] = useState<{ attendance_rate: number; total_sessions: number; attended_sessions: number; current_streak: number; longest_streak: number; } | null>(null);
    const [ranks, setRanks] = useState<{ class_name: string; rank: number; }[]>([]);

    // Fetch class attendance data /api/analytics/class-attendance [professor]
    const fetchClassAttendanceData = async () => {
        if (user?.role !== "professor") { return; }
        setIsLoadingAttendanceData(true);

        try{
            const response = await fetch(`${API_URL}/api/analytics/class-attendance`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    credentials: "include"
                },
            });

            if (response.ok){
                const data = await response.json()

                const formattedData = data.map((item: any) => ({
                    id: item.classroom_id,
                    class_name: item.class_name,
                    sessions_count: Number(item.sessions_count) || 0,
                    attendance_rate: Number(item.attendance_rate) || 0,
                }))
                .sort((a: { sessions_count: number, attendance_rate: number }, b: { sessions_count: number, attendance_rate: number }) => {
                    // First, sort by attendance count in descending order
                    if (a.attendance_rate !== b.attendance_rate) { return b.attendance_rate - a.attendance_rate; }
                    // If attendance count is tied, sort by attendance rate in descending order
                    return b.sessions_count - a.sessions_count;
                });
                setClassAttendanceData(formattedData);
            }
            else { console.error("Failed to fetch class attendance data:", response.statusText); }
        }
        catch(error){ console.error("Error fetching class attendance data:", error); }
        finally{ setIsLoadingAttendanceData(false); }
    };

    // Fetch top students data /api/analytics/top-students [professor]
    const fetchTopStudentsData = async () => {
        if (user?.role !== "professor") { return; }
        try {
            const response = await fetch(`${API_URL}/api/analytics/top-students`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    credentials: "include"
                },
            });

            if (response.ok){
                const data = await response.json();
                // console.log("Top students data:", data);

                const formattedData = data.map((item: any) => ({
                    id: item.id,
                    student_name: item.student_name,
                    attendance_count: Number(item.attendance_count) || 0,
                    attendance_rate: Number(item.attendance_rate) || 0,
                }))
                .sort((a: { attendance_count: number, attendance_rate: number }, b: { attendance_count: number, attendance_rate: number }) => {
                    // First, sort by attendance count in descending order
                    if (a.attendance_count !== b.attendance_count) {
                        return b.attendance_count - a.attendance_count;
                    }
                    // If attendance count is tied, sort by attendance rate in descending order
                    return b.attendance_rate - a.attendance_rate;
                });
                setTopStudentsData(formattedData);
            }
            else { console.error("Failed to fetch top students data:", response.statusText); }
        }
        catch (error) { console.error("Error fetching top students data:", error); }
    };

    // Fetch personal stats data /api/analytics/personal-stats [student]
    const fetchPersonalStatsData = async () => {
        try{
            const response = await fetch(`${API_URL}/api/analytics/personal-stats`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    credentials: "include"
                },
            });

            if (response.ok){
                const data = await response.json();
                setPersonalStats(data);
            }
            // else { console.error("Failed to fetch personal stats data:", response.statusText); }
        }
        catch(error){ console.error("Error fetching personal stats data:", error); }
        finally{ setIsLoadingAttendanceData(false); }
    };

    const fetchStudentRanks = async (classes: { id: number; class_name: string; }[]) => {
        try {
            const rankPromises = classes.map(async (classData) => {
                const response = await fetch(`${API_URL}/api/analytics/class-rank/${classData.id}`, {
                    method: "GET",
                    credentials: "include"
                });
                if (response.ok) {
                    const data = await response.json();
                    return { class_name: classData.class_name, rank: data.rank };
                } 
                else {
                    console.error(`Failed to fetch rank for class ${classData.class_name}:`, response.statusText);
                    return null;
                }
            });
            const results = await Promise.all(rankPromises);
            const filtered = results.filter((item): item is { class_name: string; rank: number } => item !== null);
            setRanks(filtered);
        }
        catch(error) { console.error("Error fetching student ranks:", error); }
    };

    const fetchStudentClasses = async () => {
        try{
            const response = await fetch(`${API_URL}/api/user/my-classes`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    credentials: "include"
                },
            });

            if (response.ok){
                const data = await response.json();
                console.log("Student classes data:", data);
                const simplifiedClasses = data.classes.map((classData: { id: number; class_name: string; }) => ({
                    id: classData.id,
                    class_name: classData.class_name,
                }));
                await(fetchStudentRanks(simplifiedClasses));
            }
            // else { console.error("Failed to fetch student classes data:", response.statusText); }
        }
        catch(error){ console.error("Error fetching student classes data:", error); }
    };

    useEffect(() => {
        if (user?.role === "professor") { 
            fetchClassAttendanceData(); 
            fetchTopStudentsData();
        }
        else if (user?.role === "student") { 
            fetchPersonalStatsData(); 
            fetchStudentClasses();
        }
    }, [user?.role]);

    const renderProfessorView = () => {
        return (
            <View style={styles.container}>
                <Topbar />
                <View style={styles.contentContainer}>
                    <Text style={styles.screenTitle}>Gator Stats 🐊📊</Text>
                    
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Class Attendance Overview</Text>
                            {isLoadingAttendanceData ? (
                                <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color="#4FEEAC" />
                                <Text style={styles.loadingText}>Loading attendance data...</Text>
                                </View>
                            ) : classAttendanceData.length === 0 ? (
                                <View style={styles.emptyStateContainer}>
                                <Text style={styles.emptyStateText}>No attendance data available yet</Text>
                                </View>
                            ) : (
                                <FlatList
                                    data={classAttendanceData}
                                    renderItem={({ item }) => (
                                        <View style={styles.statCard}>
                                            <Text style={styles.statTitle}>{item.class_name}</Text>
                                            <Text style={styles.statSubtitle}>{item.sessions_count} sessions total</Text>
                                            <View style={styles.progressBarContainer}>
                                                <View style={[
                                                    styles.progressBar, 
                                                    { width: `${item.attendance_rate}%` },
                                                    item.attendance_rate > 90 ? styles.progressExcellent :
                                                    item.attendance_rate > 80 ? styles.progressGood :
                                                    styles.progressNeeds
                                                ]} />
                                                <Text style={styles.progressText}>{item.attendance_rate.toFixed(1)}% attendance</Text>
                                            </View>
                                        </View>
                                    )}
                                    keyExtractor={(item) => item.id.toString()}
                                    scrollEnabled={false}
                                />
                            )}
                        </View>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Top Attending Students</Text>
                            <FlatList
                                data={topStudentsData}
                                renderItem={({ item, index }) => (
                                    <View style={styles.studentCard}>
                                        <Text style={styles.rank}>#{index + 1}</Text>
                                        <View style={styles.studentInfo}>
                                            <Text style={styles.studentName}>{item.student_name}</Text>
                                            <Text style={styles.attendanceText}>
                                                {item.attendance_count} check-ins | {item.attendance_rate.toFixed(2)}%
                                            </Text>
                                        </View>
                                    </View>
                                )}
                                keyExtractor={(item) => item.id.toString()}
                                scrollEnabled={false}
                            />
                        </View>
                        
                        <TouchableOpacity style={styles.exportButton}>
                            <Text style={styles.exportButtonText}>Export Analytics</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
                <Navbar navigation={navigation} />
            </View>
        );
    };

    const milestoneReached = ranks.some(r => r.rank && r.rank <= 3);

    const renderStudentView = () => {
        return (
            <View style={styles.container}>
                <Topbar />
                <View style={styles.contentContainer}>
                    <Text style={styles.screenTitle}>Baby Gator Stats 🦎📈</Text>
                    
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Your Attendance Stats</Text>
                            <View style={styles.personalStatsContainer}>
                                <View style={styles.statBox}>
                                    <Text style={styles.statValue}>
                                        {personalStats && parseFloat(String(personalStats.attendance_rate)).toFixed(1)}%
                                    </Text>
                                    <Text style={styles.statLabel}>Attendance Rate</Text>
                                </View>
                                <View style={styles.statBox}>
                                    <Text style={styles.statValue}>
                                        {personalStats ? personalStats.attended_sessions : 0}/{personalStats ? personalStats.total_sessions : 0}
                                    </Text>
                                    <Text style={styles.statLabel}>Sessions Attended</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Your Streaks</Text>
                            <View style={styles.streakContainer}>
                                <View style={styles.streakBox}>
                                    <Text style={styles.streakValue}>{personalStats ? personalStats.current_streak : 0}</Text>
                                    <Text style={styles.streakLabel}>Current Streak</Text>
                                </View>
                                <View style={styles.streakBox}>
                                    <Text style={styles.streakValue}>{personalStats ? personalStats.longest_streak : 0}</Text>
                                    <Text style={styles.streakLabel}>Longest Streak</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Class Rankings</Text>
                            {ranks.length === 0 ? (
                                <Text style={styles.rankLabel}>No ranking data available.</Text>
                            ) : (
                                ranks.map((item, index) => (
                                <View key={index} style={styles.rankContainer}>
                                    <Text style={styles.rankNumber}>#{item.rank}</Text>
                                    <Text style={styles.rankLabel}>{item.class_name}</Text>
                                </View>
                                ))
                            )}
                        </View>
                        
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Upcoming Milestones</Text>
                            {milestoneReached && (
                                <View style={styles.milestoneCard}>
                                    <View style={styles.milestoneIcon}>
                                    <Text style={styles.milestoneIconText}>🏆</Text>
                                    </View>
                                    <View style={styles.milestoneInfo}>
                                    <Text style={styles.milestoneName}>Top 3 in Attendance</Text>
                                    <Text style={styles.milestoneProgress}>You're among the top 3 in at least one class!</Text>
                                    </View>
                                </View>
                            )}
                            
                            <View style={styles.milestoneCard}>
                                <View style={styles.milestoneIcon}>
                                    <Text style={styles.milestoneIconText}>⭐</Text>
                                </View>
                                <View style={styles.milestoneInfo}>
                                    <Text style={styles.milestoneName}>Perfect Month Goal</Text>
                                    <Text style={styles.milestoneProgress}>{personalStats?.current_streak}/30 days completed</Text>
                                    <View style={styles.milestoneProgressBar}>
                                        <View style={[styles.milestoneProgressFill, { width: `${((personalStats?.current_streak ?? 0) / 30) * 100}%` }]} />
                                    </View>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </View>
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
        marginTop: 70, // Account for Topbar
    },
    scrollContent: {
        paddingBottom: 100, // Account for Navbar
        paddingHorizontal: 16,
    },
    screenTitle: {
        fontSize: 30,
        fontWeight: "bold",
        textAlign: "center",
        marginTop: -8,
        marginVertical: 8,
        color: "#333",
    },
    section: {
        backgroundColor: "white",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 16,
        color: "#333",
    },
    // Professor styles - Class stats
    statCard: {
        marginBottom: 16,
        padding: 12,
        backgroundColor: "#f9f9f9",
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: "#4FEEAC",
    },
    statTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    statSubtitle: {
        fontSize: 14,
        color: "#666",
        marginBottom: 10,
    },
    progressBarContainer: {
        height: 24,
        backgroundColor: "#e0e0e0",
        borderRadius: 12,
        overflow: "hidden",
        position: "relative",
    },
    progressBar: {
        height: "100%",
        borderRadius: 12,
    },
    progressExcellent: {
        backgroundColor: "#4FEEAC", // Green
    },
    progressGood: {
        backgroundColor: "#FFD166", // Yellow
    },
    progressNeeds: {
        backgroundColor: "#EF476F", // Red
    },
    progressText: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        textAlign: "center",
        textAlignVertical: "center",
        fontSize: 12,
        fontWeight: "bold",
        color: "#333",
    },
    // Professor styles - Student ranking
    studentCard: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        padding: 12,
        backgroundColor: "#f9f9f9",
        borderRadius: 8,
    },
    rank: {
        width: 30,
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
        color: "#333",
    },
    studentInfo: {
        flex: 1,
        marginLeft: 8,
    },
    studentName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    attendanceText: {
        fontSize: 14,
        color: "#666",
    },
    exportButton: {
        backgroundColor: "#4FEEAC",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: "center",
        marginVertical: 10,
    },
    exportButtonText: {
        color: "#333",
        fontWeight: "bold",
        fontSize: 16,
    },
    // Student styles - Personal stats
    personalStatsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    statBox: {
        flex: 1,
        alignItems: "center",
        padding: 16,
        backgroundColor: "#f9f9f9",
        borderRadius: 8,
        marginHorizontal: 4,
    },
    statValue: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#4FEEAC",
    },
    statLabel: {
        fontSize: 14,
        color: "#666",
        marginTop: 4,
        textAlign: "center",
    },
    // Student styles - Streaks
    streakContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    streakBox: {
        flex: 1,
        alignItems: "center",
        padding: 16,
        backgroundColor: "#f9f9f9",
        borderRadius: 8,
        marginHorizontal: 4,
    },
    streakValue: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#ff9500",
    },
    streakLabel: {
        fontSize: 14,
        color: "#666",
        marginTop: 4,
    },
    // Student styles - Ranking
    rankContainer: {
        alignItems: "center",
        padding: 20,
        backgroundColor: "#f9f9f9",
        borderRadius: 8,
    },
    rankNumber: {
        fontSize: 36,
        fontWeight: "bold",
        color: "#4FEEAC",
    },
    rankLabel: {
        fontSize: 14,
        color: "#666",
        marginTop: 4,
        textAlign: "center",
    },
    // Student styles - Milestones
    milestoneCard: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        padding: 12,
        backgroundColor: "#f9f9f9",
        borderRadius: 8,
    },
    milestoneIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    milestoneIconText: {
        fontSize: 20,
    },
    milestoneInfo: {
        flex: 1,
    },
    milestoneName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    milestoneProgress: {
        fontSize: 14,
        color: "#666",
        marginBottom: 6,
    },
    milestoneProgressBar: {
        height: 6,
        backgroundColor: "#e0e0e0",
        borderRadius: 3,
        overflow: "hidden",
    },
    milestoneProgressFill: {
        height: "100%",
        backgroundColor: "#4FEEAC",
        borderRadius: 3,
    },
    text: {
        fontSize: 24,
        fontWeight: "bold",
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
      },
      loadingText: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
      },
      emptyStateContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
      },
      emptyStateText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        padding: 20,
      },
});