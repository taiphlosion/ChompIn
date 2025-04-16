import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  FlatList, 
  TextInput, 
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Alert
} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import Navbar from '@/components/navbar';
import Topbar from '@/components/topbar';
import { RootStackParamList } from "@/types/types"; 
import { useUserContext } from "@/context/user";
import { Ionicons } from '@expo/vector-icons';
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.API_URL || "http://localhost:5000";

// Mock data for student view
const MOCK_ENROLLED_CLASSES = [
  { id: 1, class_name: "Introduction to Computer Science", professor: "Dr. Smith", attendance_rate: 92 },
  { id: 2, class_name: "Mobile App Development", professor: "Dr. Johnson", attendance_rate: 88 },
  { id: 3, class_name: "Data Structures and Algorithms", professor: "Dr. Williams", attendance_rate: 96 },
  { id: 4, class_name: "Database Management", professor: "Dr. Brown", attendance_rate: 78 },
];

export default function ClassScreen() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { user } = useUserContext();
    const [classes, setClasses] = useState<
    { class_name: string; id: number; professor_id: number }[]
    >([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [className, setClassName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedClass, setSelectedClass] = useState<number | null>(null);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    
    // For student view
    const [enrollModalVisible, setEnrollModalVisible] = useState(false);
    const [classCode, setClassCode] = useState("");

    const classList = async () => {
        try {
            setLoading(true);
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
        finally { setLoading(false); }
    };

    const createClass = async () => {
        if (!className.trim()){
            Alert.alert("Error", "Please enter a class name.");
            return;
        }
        try{
            setIsSubmitting(true);
            const response = await fetch(`${API_URL}/api/user/create-classroom`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ 
                    className: className 
                }),
            });
            if (response.ok) {
                const data = await response.json();
                setClasses((prevClasses) => [...prevClasses, data.classroom]);
                setClassName("");
                setModalVisible(false);
                Alert.alert("Success", "Class created successfully!");
            } 
            else { Alert.alert("Error", "Failed to create class. Please try again."); }
        }
        catch (error) { console.log(error); }
        finally { setIsSubmitting(false); }
    };

    const deleteClass = async () => {
        if (!selectedClass) return;
        
        // Mock implementation for now
        setClasses(classes.filter(c => c.id !== selectedClass));
        setDeleteModalVisible(false);
        setSelectedClass(null);
        Alert.alert("Success", "Class deleted successfully!");
    };

    const enrollInClass = () => {
        // For now, just show a success message
        if (!classCode.trim()) {
            Alert.alert("Error", "Please enter a class code");
            return;
        }
        
        setEnrollModalVisible(false);
        setClassCode("");
        Alert.alert("Success", "Successfully enrolled in class!");
    };

    useEffect(() => { 
        if (user?.role === "professor") {
            classList(); 
        } 
        else {
            // For student view, we'll use the mock data
            setLoading(false);
        }
    }, [user?.role]);

    // Filter classes based on search term
    const filteredClasses = user?.role === "professor" 
        ? classes
            .filter(c => c.class_name.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(c => ({
                id: c.id,
                class_name: c.class_name,
                professor: "N/A", // Placeholder for professor
                attendance_rate: 0, // Placeholder for attendance rate
            }))
        : MOCK_ENROLLED_CLASSES.filter(c => 
            c.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.professor.toLowerCase().includes(searchTerm.toLowerCase()));

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
                        <Image 
                            source={require("../assets/images/home/logo-with-name.png")} 
                            style={styles.emptyStateImage}
                            resizeMode="contain"
                        />
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
                                                {item.class_name.charAt(0).toUpperCase()}
                                            </Text>
                                        </View>
                                        <View style={styles.classInfo}>
                                            <Text style={styles.className}>{item.class_name}</Text>
                                            <Text style={styles.classId}>ID: {item.id}</Text>
                                        </View>
                                    </View>
                                    
                                    <View style={styles.classActions}>
                                        <TouchableOpacity 
                                            style={styles.classActionButton}
                                            onPress={() => {
                                                // Navigate to QR generation
                                                navigation.navigate("home");
                                            }}
                                        >
                                            <Ionicons name="qr-code" size={20} color="#333" />
                                        </TouchableOpacity>
                                        
                                        <TouchableOpacity 
                                            style={styles.classActionButton}
                                            onPress={() => {
                                                // Navigate to analytics for this class
                                                navigation.navigate("analytics");
                                            }}
                                        >
                                            <Ionicons name="bar-chart" size={20} color="#333" />
                                        </TouchableOpacity>
                                        
                                        <TouchableOpacity 
                                            style={[styles.classActionButton, styles.deleteButton]}
                                            onPress={() => {
                                                setSelectedClass(item.id);
                                                setDeleteModalVisible(true);
                                            }}
                                        >
                                            <Ionicons name="trash" size={20} color="#ff3b30" />
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
                
                {/* Create Class Modal */}
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
                            
                            <Text style={styles.inputLabel}>Class Name</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Enter class name"
                                value={className}
                                onChangeText={setClassName}
                            />
                            
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
                <Modal
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
                </Modal>
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
                    <TouchableOpacity 
                        style={styles.enrollButton}
                        onPress={() => setEnrollModalVisible(true)}
                    >
                        <Ionicons name="add-circle" size={20} color="#333" />
                        <Text style={styles.enrollButtonText}>Enroll in Class</Text>
                    </TouchableOpacity>
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
                
                <View style={styles.classStatsContainer}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{MOCK_ENROLLED_CLASSES.length}</Text>
                        <Text style={styles.statLabel}>Classes</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>
                            {(MOCK_ENROLLED_CLASSES.reduce((sum, cls) => sum + cls.attendance_rate, 0) / 
                            MOCK_ENROLLED_CLASSES.length).toFixed(1)}%
                        </Text>
                        <Text style={styles.statLabel}>Avg. Attendance</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>
                            {MOCK_ENROLLED_CLASSES.filter(c => c.attendance_rate >= 90).length}
                        </Text>
                        <Text style={styles.statLabel}>Perfect Attendance</Text>
                    </View>
                </View>

                <Text style={styles.listHeader}>
                    {filteredClasses.length} {filteredClasses.length === 1 ? "Class" : "Classes"} {searchTerm ? "Found" : ""}
                </Text>
                
                <FlatList
                    data={filteredClasses}
                    renderItem={({ item }) => (
                        <View style={styles.studentClassCard}>
                            <View style={styles.studentClassHeader}>
                                <View style={styles.classIconContainer}>
                                    <Text style={styles.classIconText}>
                                        {item.class_name.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <View style={styles.studentClassInfo}>
                                    <Text style={styles.className}>{item.class_name}</Text>
                                    <Text style={styles.professorName}>{item.professor}</Text>
                                </View>
                            </View>
                            
                            <View style={styles.attendanceContainer}>
                                <Text style={styles.attendanceLabel}>Attendance</Text>
                                <View style={styles.attendanceBarContainer}>
                                    <View 
                                        style={[
                                            styles.attendanceBar, 
                                            { width: `${item.attendance_rate}%` },
                                            item.attendance_rate >= 90 ? styles.attendanceExcellent :
                                            item.attendance_rate >= 80 ? styles.attendanceGood :
                                            styles.attendanceNeeds
                                        ]} 
                                    />
                                    <Text style={styles.attendancePercent}>{item.attendance_rate}%</Text>
                                </View>
                            </View>
                            
                            <View style={styles.studentClassActions}>
                                <TouchableOpacity 
                                    style={styles.studentClassButton}
                                    onPress={() => navigation.navigate("scan", { qrCode: "" })}
                                >
                                    <Ionicons name="scan" size={16} color="#333" />
                                    <Text style={styles.studentClassButtonText}>Scan QR</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={styles.studentClassButton}
                                    onPress={() => navigation.navigate("analytics")}
                                >
                                    <Ionicons name="trophy" size={16} color="#333" />
                                    <Text style={styles.studentClassButtonText}>Leaderboard</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.classesList}
                    showsVerticalScrollIndicator={false}
                />
                
                {/* Enroll in Class Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={enrollModalVisible}
                    onRequestClose={() => setEnrollModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Enroll in Class</Text>
                                <TouchableOpacity 
                                    onPress={() => setEnrollModalVisible(false)}
                                    style={styles.modalCloseButton}
                                >
                                    <Ionicons name="close" size={24} color="#666" />
                                </TouchableOpacity>
                            </View>
                            
                            <Text style={styles.inputLabel}>Class Code</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Enter class code"
                                value={classCode}
                                onChangeText={setClassCode}
                            />
                            
                            <TouchableOpacity 
                                style={styles.modalButton}
                                onPress={enrollInClass}
                            >
                                <Text style={styles.modalButtonText}>Enroll</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
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
        fontSize: 24,
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
});