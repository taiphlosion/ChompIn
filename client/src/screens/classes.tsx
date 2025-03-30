import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TextInput, TouchableOpacity } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import Navbar from '@/components/navbar';
import Topbar from '@/components/topbar';
import { RootStackParamList } from "@/types/types"; 
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.API_URL || "http://localhost:5000";

export default function Class() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [classes, setClasses] = React.useState<
    { class_name: string; id: number; professor_id: number }[]
    >([]);
    const [loading, setLoading] = React.useState(true);
    const [showForm, setShowForm] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [className, setClassName] = useState("");

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
                setClasses((prevClasses) => [...prevClasses, data]);
                setClassName("");
                setShowForm(false);
            } else { alert("Failed to create class. Please try again."); }
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
            <View>
                <Text style={styles.className}>{item.class_name}</Text>
                <Text style={styles.classId}>ID: {item.id}</Text>
            </View>
        );
    };

    const renderContent = () => {
        if (loading) {
            return (
                <View style={styles.container}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text style={styles.text}>Loading classes...</Text>
                </View>
            );
        }

        if (showForm) { return creationForm(); }

        if (classes.length === 0) {
            return (
                <View style={styles.container}>
                    <Text style={styles.title}>No Classes Found</Text>
                    <Text style={styles.text}>
                        You don't have any classes yet. Create your first class to get started.
                    </Text>
                    <TouchableOpacity 
                        style={styles.createButton}
                        onPress={() => setShowForm(true)}
                    >
                        <Text style={styles.createButtonText}>Create New Class</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View style={styles.listWrapper}>
                <View style={styles.container}>
                    <Text style={styles.title}>Your Classes</Text>
                    <TouchableOpacity 
                        style={styles.addButton}
                        onPress={() => setShowForm(true)}
                    >
                        <Text style={styles.addButtonText}>+ Add Class</Text>
                    </TouchableOpacity>
                </View>
                
                <FlatList
                    data={classes}
                    renderItem={renderClassItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.container}
                />
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Topbar />
            <View style={styles.content}>
                {renderContent()}
            </View>
            <Navbar navigation={navigation} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        flex: 1,
        width: '100%',
        padding: 16,
    },
    text: {
        fontSize: 24,
        fontWeight: "bold",
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
});