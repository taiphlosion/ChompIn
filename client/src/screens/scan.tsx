import React, { useState, useEffect } from "react";
import { View, StyleSheet, Button, TouchableOpacity, Text, Image } from "react-native";
import { useUserContext } from "@/context/user";
import { useNavigation, NavigationProp, useRoute, RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "@/types/types"; 
import { CameraType, useCameraPermissions, CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import Topbar from '@/components/topbar';
import Navbar from '@/components/navbar';
import QRCode from 'react-native-qrcode-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';

let globalQRCode = "";

export default function CameraScreen() {
    const { user } = useUserContext();
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const route = useRoute<RouteProp<RootStackParamList, 'scan'>>();

    useEffect(() => { if (route.params?.qrCode) {globalQRCode = route.params.qrCode;} }, [route.params?.qrCode]);

    const qrCodeToShow = globalQRCode || route.params?.qrCode;

    function toggleCameraFacing() { setFacing(current => current === 'back' ? 'front' : 'back'); }

    function handleSnap() {
        // This can be turned into QR code scanning logic here
        console.log("Snap taken");
    }

    // Check if the permission is null (initial state)
    if (permission === null) { return <View />; }

    // If permission is not granted, show a button to request permission
    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Button title="Request Camera Permission" onPress={requestPermission} />
            </View>
        );
    }

    const renderProfessorView = () => {
        return(
            <View style={styles.container}>
                <Topbar />
                <Text style={styles.text}>Have your students scan this</Text>
                {qrCodeToShow ? (
                    <Image 
                        source={{uri: qrCodeToShow}}
                        style={{width: 200, height: 200}}
                        resizeMode="contain"
                    />
                ):(
                    <QRCode value="Your QR Code Content Here" size={200} />
                )}
                <Navbar navigation={navigation} />
            </View>
        );
    };

    const renderStudentView = () => {
        return(
            <View style={styles.container}>
            <Topbar />
            <CameraView style={styles.camera} facing={facing} />

            <View style={styles.overlay}>
                <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
                    <Ionicons name="refresh-outline" size={40} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={handleSnap}>
                    <Ionicons name="camera" size={40} color="black" />
                </TouchableOpacity>
            </View>

            <Navbar navigation={navigation} />
        </View>
        );
    };

    if (user?.role === "professor") { return renderProfessorView(); }
    return renderStudentView();
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        justifyContent: 'center',
        alignItems: 'center',
    },
    camera: {
        width: 360,
        height: 360,
        borderRadius: 20,
        overflow: 'hidden',
        marginTop: -120,
    },
    button: {
        flex: 1,
        alignSelf: 'flex-end',
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'black',
    },
    overlay: {
        position: 'absolute',
        justifyContent: 'space-between',
        flexDirection: 'row',
        padding: 50,
        bottom: 100,
        backgroundColor: 'transparent',
        alignItems: 'center',
    },
});
