import React, { useEffect } from "react";
import { View, Text, StyleSheet, Linking, ScrollView, Switch, TouchableOpacity } from "react-native";
import { Button } from 'react-native-elements';
import { useUserContext } from "@/context/user";
import Constants from 'expo-constants';
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "@/types/types"; 
import Navbar from '@/components/navbar';
import Topbar from '@/components/topbar';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Constants.expoConfig?.extra?.API_URL || "http://localhost:5000";

export default function Setting() {
    const { user, setUser } = useUserContext();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const [notifications, setNotifications] = React.useState(true);
    const [classReminders, setClassReminders] = React.useState(true);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const notificationsValue = await AsyncStorage.getItem("notifications");
                const classRemindersValue = await AsyncStorage.getItem("classReminders");

                if (notificationsValue !== null) { setNotifications(JSON.parse(notificationsValue)); }
                if (classRemindersValue !== null) { setClassReminders(JSON.parse(classRemindersValue)); }
            }
            catch (error) { console.log("Error loading settings", error); }
        }
        loadSettings();
    }, []);

    const toggleNotifications = () => {
        setNotifications(!notifications);
        AsyncStorage.setItem("notifications", JSON.stringify(!notifications));
    }

    const toggleClassReminders = () => {
        setClassReminders(!classReminders);
        AsyncStorage.setItem("classReminders", JSON.stringify(!classReminders));
    }

    const contactSupport = () => { Linking.openURL('mailto:mauriciodelcas30@gmail.com?subject=ChompIn Support Request')};

    const showAbout = () => { 
        // Show about information in a modal or navigate to an about screen

    };

    const handleLogout = async () => {
        setUser(null);
        try{
            await fetch(`${API_URL}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
            console.log("Logout successful");
            navigation.navigate("login");
        }
        catch(error){ console.log(error); }
    };


    return (
        <View style={styles.container}>
            <Topbar />
            <Text style={styles.text}>Settings</Text>
        
            <ScrollView contentContainerStyle={styles.scrollView}>

                {/* Profile information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Profile</Text>
                    <View style={styles.profileContainer}>
                        <View style={styles.avatarCircle}>
                            <Text style={styles.avatarText}>
                                {user?.first_name?.[0]}{user?.last_name?.[0]}
                            </Text>
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.userName}>{user?.first_name} {user?.last_name}</Text>
                            <Text style={styles.userEmail}>{user?.email}</Text>
                            <Text style={styles.userRole}>{user?.role === 'professor' ? 'Professor' : 'Student'}</Text>
                        </View>
                    </View>
                </View>

                {/* Reminders and notifications */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notifications</Text>
                    <View style={styles.settingItem}>
                        <Text style={styles.sectionTitle}>Enable Notifications</Text>
                        <Switch
                            value={notifications}
                            onValueChange={toggleNotifications}
                            trackColor={{ false: "#767577", true: "#4FEEAC" }}
                            thumbColor={notifications ? "#fff" : "#f4f3f4"}
                        />
                    </View>
                    <View style={styles.settingItem}>
                        <Text style={styles.sectionTitle}>Class Reminders</Text>
                        <Switch
                            value={classReminders}
                            onValueChange={toggleClassReminders}
                            trackColor={{ false: "#767577", true: "#4FEEAC" }}
                            thumbColor={classReminders ? "#fff" : "#f4f3f4"}
                        />
                    </View>
                </View>

                {/* About Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <TouchableOpacity style={styles.menuItem} onPress={showAbout}>
                        <View style={styles.menuItemContent}>
                            <Icon name="information-circle-outline" size={24} color="#333" />
                            <Text style={styles.menuItemText}>About ChompIn</Text>
                        </View>
                        <Icon name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>
                </View>
                
                {/* Contact Us */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Support</Text>
                    <TouchableOpacity style={styles.menuItem} onPress={contactSupport}>
                        <View style={styles.menuItemContent}>
                            <Icon name="mail-outline" size={24} color="#333" />
                            <Text style={styles.menuItemText}>Contact Support</Text>
                        </View>
                        <Icon name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>
                </View>
                
                {/* Logout */}
                <View style={styles.section}>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Icon name="log-out-outline" size={24} color="#fff" />
                        <Text style={styles.logoutText}>Log Out</Text>
                    </TouchableOpacity>
                </View>
                
                <View style={styles.versionContainer}>
                    <Text style={styles.versionText}>Version 23423</Text>
                </View>

            </ScrollView>

            <Navbar navigation={navigation} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    logoutButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ff3b30',
        padding: 16,
        margin: 16,
        borderRadius: 8,
    },
    logoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    versionContainer: {
        alignItems: 'center',
        padding: 16,
        marginBottom: 16,
    },
    versionText: {
        color: '#999',
        fontSize: 14,
    },
    settingLabel: {
        fontSize: 16,
        color: '#333',
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    menuItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuItemText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 12,
    },
    text: {
        fontSize: 24,
        fontWeight: "bold",
        marginTop: 120,
        marginLeft: 20,
    },
    profileInfo: {
        marginLeft: 16,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    userEmail: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    userRole: {
        fontSize: 14,
        color: '#4FEEAC',
        marginTop: 2,
        fontWeight: '500',
    },
    avatarCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#4FEEAC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    scrollView: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 20,
        paddingBottom: 100,
    },
    section: {
        marginHorizontal: 16,
        marginVertical: 8,
        backgroundColor: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
});