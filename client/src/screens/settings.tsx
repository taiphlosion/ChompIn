import React, { useEffect } from "react";
import { View, Text, StyleSheet, Linking, ScrollView, TouchableOpacity, Modal, Image } from "react-native";
import { useUserContext } from "@/context/user";
import Constants from 'expo-constants';
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "@/types/types"; 
import Navbar from '@/components/navbar';
import Topbar from '@/components/topbar';
import Icon from 'react-native-vector-icons/Ionicons';

const API_URL = Constants.expoConfig?.extra?.API_URL || "http://localhost:5000";

export default function Setting() {
    const { user, setUser } = useUserContext();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const[aboutModalVisible, setAboutModalVisible] = React.useState(false);

    const contactSupport = () => { Linking.openURL('mailto:mauriciodelcas30@gmail.com?subject=Chompin\' Support Request')};

    const showAbout = () => { setAboutModalVisible(true) };

    const handleLogout = async () => {
        setUser(null);
        try{
            await fetch(`${API_URL}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
            navigation.navigate("login");
        }
        catch(error){ console.log(error); }
    };


    return (
        <View style={styles.container}>
            <Topbar />
            <Text style={styles.text}>Settings ⚙️</Text>
        
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

                {/* About Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <TouchableOpacity style={styles.menuItem} onPress={showAbout}>
                        <View style={styles.menuItemContent}>
                            <Icon name="information-circle-outline" size={24} color="#333" />
                            <Text style={styles.menuItemText}>About Chompin'</Text>
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
                    <Text style={styles.versionText}>Version 1</Text>
                </View>

            </ScrollView>

                        {/* About Modal */}
                        <Modal
                            animationType="fade"
                            transparent={true}
                            visible={aboutModalVisible}
                            onRequestClose={() => setAboutModalVisible(false)}
                        >
                            <View style={styles.modalOverlay}>
                                <View style={styles.aboutModalContent}>
                                    <View style={styles.aboutHeader}>
                                        <Text style={styles.aboutTitle}>About Chompin'</Text>
                                        <TouchableOpacity 
                                            onPress={() => setAboutModalVisible(false)}
                                            style={styles.closeButton}
                                        >
                                            <Icon name="close" size={24} color="#666" />
                                        </TouchableOpacity>
                                    </View>
                                    
                                    <View style={styles.aboutLogoContainer}>
                                        <Image 
                                            source={require("../assets/images/home/logo-with-name.png")} 
                                            style={styles.aboutLogo}
                                            resizeMode="contain"
                                        />
                                    </View>
                                    
                                    <Text style={styles.aboutDescription}>
                                        Chompin' is a comprehensive attendance tracking app designed for University of Florida students and faculty. Our app streamlines the classroom attendance process, bringing transparency and efficiency to academic tracking.
                                    </Text>

                                    <Text style={styles.aboutDescription}>
                                        <Text style={{ fontWeight: 'bold' }}>Mauricio Del Castillo</Text> - Lead Backend Developer{"\n"}
                                        <Text style={{ fontWeight: 'bold' }}>Tai Tran</Text> - Lead Frontend Developer{"\n"}
                                        <Text style={{ fontWeight: 'bold' }}>Tech Bros for Life!!!</Text>
                                    </Text>
                                    
                                    <Text style={styles.aboutVersion}>
                                        Version 1.0.0
                                    </Text>
                                    
                                    <Text style={styles.aboutCopyright}>
                                        © 2025 Chompin' Team. All rights reserved.
                                    </Text>
                                    
                                    <TouchableOpacity 
                                        style={styles.closeModalButton}
                                        onPress={() => setAboutModalVisible(false)}
                                    >
                                        <Text style={styles.closeModalButtonText}>Close</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Modal>


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
        fontSize: 30,
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
        marginVertical: 8,
        backgroundColor: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        width: '90%',
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
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    aboutModalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        width: '85%',
        maxHeight: '70%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    aboutHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    aboutTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        padding: 4,
    },
    aboutLogoContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    aboutLogo: {
        width: 200,
        height: 100,
    },
    aboutDescription: {
        fontSize: 16,
        lineHeight: 24,
        color: '#444',
        marginBottom: 16,
        textAlign: 'center',
    },
    aboutVersion: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 8,
    },
    aboutCopyright: {
        fontSize: 12,
        color: '#888',
        textAlign: 'center',
        marginBottom: 16,
    },
    closeModalButton: {
        backgroundColor: '#4FEEAC',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    closeModalButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    }
});