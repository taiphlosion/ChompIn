import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TextInput, TouchableOpacity } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { useUserContext } from "@/context/user";
import Navbar from '@/components/navbar';
import Topbar from '@/components/topbar';
import { RootStackParamList } from "@/types/types"; 
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.API_URL || "http://localhost:5000";

export default function Class() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { user } = useUserContext();

    const [classes, setClasses] = React.useState<
    { class_name: string; id: number; professor_id: number }[]
    >([]);
    const [loading, setLoading] = React.useState(true);
    const [showForm, setShowForm] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [className, setClassName] = useState("");

    //Route to get classes for teachers
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
                console.log(data);

                if (data.length === 0) { setLoading(false); }   
            }
        } 
        catch (error) { console.log(error); }
        finally { setLoading(false); }
    };

    //Route to get classes for students
    const fetchStudentClasses = async () => { };

    const renderProfessorView = () => {
        if (showForm){ return creationForm(); }
        //TODO: Get Mauricio to write a delete function/route for the classes
        return (
            <View style={styles.listWrapper}>
                <Text style={styles.title}>Your Classes</Text>

                <FlatList
                    data={classes}
                    renderItem={renderClassItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        gap: 12, // gap between items 
                    }}
                    ItemSeparatorComponent={() => <View style={{ height: 12 }} />} // for spacing if `gap` not working
                />

                <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(true)}>
                    <Text style={styles.addButtonText}>+ Add Class</Text>
                </TouchableOpacity>
            </View>
        );
    };

    //TODO: Have the database store the classes associated with the student so that they can be displayed. 
    const renderStudentView = () => {
        if (loading) {
            return (
                <View style={styles.container}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text style={styles.text}>Loading your classes...</Text>
                </View>
            );
        }

        // CHECKS FOR STUDENT CLASSES (WAIT FOR BACKEND)
        // if (studentClasses.length === 0) {
        //     return (
        //         <View style={styles.container}>
        //             <Text style={styles.title}>No Classes Found</Text>
        //             <Text style={styles.text}>
        //                 You haven't joined any classes yet. Scan a class QR code to join.
        //             </Text>
        //             <TouchableOpacity 
        //                 style={styles.scanButton}
        //                 onPress={() => navigation.navigate("scan", { qrCode: "" })}
        //             >
        //                 <Text style={styles.buttonText}>Scan QR Code</Text>
        //             </TouchableOpacity>
        //         </View>
        //     );
        // }

        return (
            <View style={styles.listWrapper}>
                <Text style={styles.title}>Your Classes</Text>

                {/* TODO: Render the classes for the student when route has been made */}
                {/* <FlatList
                    data={studentClasses}
                    renderItem={renderStudentClassItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        gap: 12, // gap between items 
                    }}
                    ItemSeparatorComponent={() => <View style={{ height: 12 }} />} // for spacing if `gap` not working
                /> */}

                <TouchableOpacity 
                    style={styles.scanButton} 
                    onPress={() => navigation.navigate("scan", { qrCode: "" })}
                >
                    <Text style={styles.addButtonText}>+ Scan QR to Join Class</Text>
                </TouchableOpacity>
            </View>
        );
    };

    // Route to create classes for professors
    const createClass = async () => {
        if (!className.trim()){
            alert("Please enter a class name.");
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
                console.log(data);
                setClasses((prevClasses) => [...prevClasses, data.classroom]);
                setClassName("");
                setShowForm(false);
            } 
            else { alert("Failed to create class. Please try again."); }
        }
        catch (error) { console.log(error); }
        finally { setIsSubmitting(false); }
    };

    useEffect(() => { classList(); }, []);

    const creationForm = () => {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Create a New Class</Text>
                <TextInput
                    style={styles.text}
                    placeholder="Enter class name"
                    value={className}
                    onChangeText={setClassName}
                />
                <TouchableOpacity 
                    style={[styles.createButton, isSubmitting && styles.disabledButton]}
                    onPress={createClass}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                        <Text style={styles.text}>Create Class</Text>
                    )}
                </TouchableOpacity>
                {classes.length > 0 && (
                    <TouchableOpacity 
                        style={styles.cancelButton}
                        onPress={() => setShowForm(false)}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const renderClassItem = ({ item }: { item: { class_name: string; id: number; professor_id: number } }) => {
        return (
            <View style={styles.classCard}>
                {/* You can display more stuff like number of students, creation date, etc. */}
                <Text style={styles.className}>{item.class_name}</Text>
                <Text style={styles.classId}>ID: {item.id}</Text>
            </View>
        );
    };


    return (
        <View style={styles.container}>
            <Topbar />
            <View style={styles.content}>
                {user?.role === "professor" ? renderProfessorView() : renderStudentView()}
            </View>
            <Navbar navigation={navigation} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 0.9,
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        flex: 1,
        width: '100%',
        padding: 16,
    },
    text: {
        fontSize: 18,
    },
    className: {
        fontSize: 18,
        fontWeight: "bold",
    },
    classId: {
        fontSize: 18,
        fontWeight: "bold",
    },
    contentContainer: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 80,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
    },
    subtitle: {
        fontSize: 18,
        fontWeight: "bold",
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
        backgroundColor: "white",
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
    },
    modalButton: {
        padding: 10,
        marginTop: 10,
        backgroundColor: "#007BFF",
        borderRadius: 5,
    },
    createButton: {
        backgroundColor: "#007BFF",
        borderRadius: 8,
        padding: 14,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    disabledButton: {
        backgroundColor: '#99c5ff',
    },
    cancelButton: {
        padding: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    cancelButtonText: {
        color: "#666",
        fontSize: 16,
    },
    createButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    listWrapper: {
        flex: 1,
        paddingTop : 120,
    },
    addButton: {
        backgroundColor: "#007BFF",
        borderRadius: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    addButtonText: {
        color: "white",
        fontSize: 14,
        fontWeight: "600",
    },
    classCard: {
        backgroundColor: '#f9f9f9',
        padding: 16,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    scanButton: {
        backgroundColor: "#4FEEAC",
        borderRadius: 6,
        paddingVertical: 10,
        paddingHorizontal: 15,
        alignSelf: 'center',
        marginTop: 15,
    },
});