import React, { useEffect } from "react";
import { View, Text, StyleSheet, Button, Modal, TouchableOpacity } from "react-native";
import { useUserContext } from "@/context/user";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "@/types/types"; 
import Topbar from '@/components/topbar';
import { ScrollView } from "react-native-gesture-handler";
import ChompIn from '@/components/student/chomp-in';
import QRCreation from "@/components/professor/qr-creation";
import Navbar from '@/components/navbar';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.API_URL || "http://localhost:5000";

export default function Home() {
    const { setUser } = useUserContext();
    const { user } = useUserContext();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const [classes, setClasses] = React.useState<{ class_name: string, id: number, professor_id: number }[]>([]);
    const [students, setStudents] = React.useState([]);
    const [selectedClass, setSelectedClass] = React.useState<{ class_name: string, id: number, professor_id: number } | null>(null);
    const [isModalVisible, setIsModalVisible] = React.useState(false);

    const classList = async () => {
        try {
            const response = await fetch(`${API_URL}/api/user/classrooms`, {
                method: 'GET',
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setClasses(data);
                console.log(data);
            }
        } catch (error) { console.log(error); }
    };

    //TODO: Run a different function to get the API call for all classes involved with students. 
    useEffect(() => { if (user?.role === "professor") { classList(); } }, []);

    const handleQRCreation = async () => {
        if (!selectedClass) { 
            setIsModalVisible(true);
            return; 
        }
        try {
            const response = await fetch(`${API_URL}/api/user/generate-qr`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ class_id: selectedClass.id }),
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                console.log(data);
                navigation.navigate("scan", { qrCode: data.qrImage });
            }
        } catch (error) { console.log(error); }
    };

    const handleChompInPress = () => { navigation.navigate("scan", { qrCode: "" }); };

    const renderProfessorView = () => {
        console.log("Rendering professor view");
        return(
            <View style={styles.container}>
                <Topbar />
                <ScrollView contentContainerStyle={styles.contentContainer}>
                    <Text style={styles.title}>
                        Welcome, {user?.first_name} {user?.last_name}
                    </Text>
                    <Button title="Create QR Code" onPress={handleQRCreation} />
                    <Text style={styles.subtitle}>
                        Your classes:
                    </Text>
                    {classes.length > 0 ? (
                        classes.map((classItem, index) => (
                            <Text key={index} style={styles.subtitle}>
                                {classItem.class_name}
                            </Text>
                        ))
                    ) : (
                        <Text>No classes found</Text>
                    )}

                    <Modal visible={isModalVisible} transparent={true} animationType="slide">
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <Text>Select a class:</Text>
                                {classes.length > 0 ? (
                                    classes.map((classItem, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={styles.modalButton}
                                            onPress={() => {
                                                setSelectedClass(classItem);
                                                setIsModalVisible(false); // Hide the modal
                                            }}
                                        >
                                            <Text>{classItem.class_name}</Text>
                                        </TouchableOpacity>
                                    ))
                                ) : (
                                    <Text>No classes available</Text>
                                )}
                            </View>
                        </View>
                    </Modal>

                    <Text style={styles.subtitle}>
                        Your students:
                        {/* Have the result of the returned API call for user context returned here.  */}
                    </Text>
                </ScrollView>
                <Navbar navigation={navigation} />
            </View>
        );
    };


    const renderStudentView = () => {
        console.log("Rendering student view");
        return(
            <View style={styles.container}>
                <Topbar />
                <ScrollView contentContainerStyle={styles.contentContainer}>
                    <Text style={styles.title}>
                        Welcome, {user?.first_name} {user?.last_name}
                    </Text>
                    {/* Takes you to the scan screen */}
                    <ChompIn title="Chomp-In?" onPress={handleChompInPress} />

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
        backgroundColor: '#f8f9fa',
    },
    contentContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 80,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalButton: {
        padding: 10,
        marginTop: 10,
        backgroundColor: '#007BFF',
        borderRadius: 5,
    },
});