import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Button, TouchableOpacity, Text, Image, ActivityIndicator } from "react-native";
import { useUserContext } from "@/context/user";
import { useNavigation, NavigationProp, useRoute, RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "@/types/types"; 
import { CameraType, useCameraPermissions, CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import Topbar from '@/components/topbar';
import Navbar from '@/components/navbar';
import QRCode from 'react-native-qrcode-svg';
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.API_URL || "http://localhost:5000";
let globalQRCode = "";

export default function CameraScreen() {
    const { user } = useUserContext();
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [scanState, setScanState] = useState({
        isScanning: true,         // Whether the scanner is actively looking for QR codes
        isProcessing: false,      // Whether we're currently processing a scan
        message: "",              // Message to display to the user
        messageType: "info",      // Type of message: "success", "error", "info"
    });
    
    // Prevents multiple scans from being processed simultaneously
    const isProcessingRef = useRef(false);
    
    // Store the last processed QR code to prevent duplicates
    const lastScannedCode = useRef("");

    // navigation purposes
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const route = useRoute<RouteProp<RootStackParamList, 'scan'>>();

    //loads in current or default QR code
    useEffect(() => { 
        if (route.params?.qrCode) { globalQRCode = route.params.qrCode; } 
    }, [route.params?.qrCode]);
    
    const qrCodeToShow = globalQRCode || route.params?.qrCode;

    function toggleCameraFacing() { setFacing(current => current === 'back' ? 'front' : 'back'); }

    const handleSnap = async ({ type, data }: { type: string; data: string }) => {
        // Check if we're already processing or the camera is not scanning
        if (isProcessingRef.current || !scanState.isScanning) { return; }
        
        // Check if this is the same code we just scanned
        if (data === lastScannedCode.current) { return; }
        
        // Set processing flags immediately
        isProcessingRef.current = true;
        lastScannedCode.current = data;
        
        // Update UI state
        setScanState(prev => ({ 
            ...prev, 
            isProcessing: true,
            isScanning: false,
            message: "Processing QR code...", 
            messageType: "info" 
        }));

        // API Call: /api/user/mark-attendance to mark attendance for student
        try {
            const url = new URL(data);
            const sessionId = url.searchParams.get('session');

            if (!sessionId) { 
                setScanState(prev => ({ 
                    ...prev, 
                    isProcessing: false,
                    message: "Invalid QR code. Please try again.", 
                    messageType: "error" 
                }));
                return; 
            }

            const response = await fetch(`${API_URL}/api/user/mark-attendance`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ sessionId }),
            });

            const json = await response.json();

            if (response.ok) {
                setScanState(prev => ({ 
                    ...prev, 
                    isProcessing: false,
                    message: "Attendance marked successfully!", 
                    messageType: "success" 
                }));
            } 
            else {  
                setScanState(prev => ({ 
                    ...prev, 
                    isProcessing: false,
                    message: json.error, 
                    messageType: "error" 
                }));
            }
        } 
        catch (error: any) {
            console.error(error);
            setScanState(prev => ({ 
                ...prev, 
                isProcessing: false,
                message: error.message || "An error occurred. Please try again.", 
                messageType: "error" 
            }));
        }
    };

    // initial state with no permission
    if (permission === null) { return <View />; }

    // request permission
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
                    // Default QR Code here when no class is selected
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
                <View style={styles.cameraContainer}>
                    {/* Only show camera when scanning is enabled otherwise default camera screen*/}
                    {scanState.isScanning ? (
                        <CameraView 
                            style={styles.camera} 
                            facing={facing} 
                            onBarcodeScanned={handleSnap}
                            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                        />
                    ) : (
                        <View style={[styles.camera, styles.disabledCamera]} />
                    )}
                    
                    {/* Status Overlay */}
                    {(scanState.isProcessing || scanState.message) && (
                        <View style={styles.statusOverlay}>
                            {scanState.isProcessing && (
                                <ActivityIndicator size="large" color="#0000ff" />
                            )}
                            
                            {scanState.message && (
                                <Text style={[
                                    styles.statusMessage,
                                    scanState.messageType === "success" && styles.successMessage,
                                    scanState.messageType === "error" && styles.errorMessage,
                                ]}>
                                    {scanState.message}
                                </Text>
                            )}
                        </View>
                    )}
                </View>

                    
                {/* Controls and messages for the camera */}
                <View style={styles.controlsContainer}>
                    <Image 
                        source={require('@/assets/images/scan/gator-camera.png')} 
                        style={{ width: 100, height: 100, marginLeft: 20, marginRight: 50 }} 
                        resizeMode="contain" 
                    />

                    <TouchableOpacity 
                        style={styles.button} 
                        onPress={toggleCameraFacing}
                        disabled={scanState.isProcessing}
                    >
                        <Ionicons name="refresh-outline" size={30} color={scanState.isProcessing ? "#999" : "#000"} />
                        <Text>Flip Camera</Text>
                    </TouchableOpacity>
                </View>
                
                {/* Success or failure screen of scan. Resets evertyhing after scan again button pressed */}
                {!scanState.isScanning && !scanState.isProcessing && (
                    <TouchableOpacity 
                        style={styles.scanAgainButton}
                        onPress={() => {
                            // Reset both state and refs
                            setScanState(prev => ({ 
                                ...prev, 
                                isScanning: true, 
                                message: "",
                                isProcessing: false 
                            }));
                            isProcessingRef.current = false;
                            // Keep the last scanned code for a few seconds
                            setTimeout(() => { lastScannedCode.current = "";}, 3000);
                        }}
                    >
                        <Text style={styles.scanAgainText}>Scan Again</Text>
                    </TouchableOpacity>
                )}
                <Navbar navigation={navigation} />
            </View>
        );
    };

    // Have two different views based on the user there
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
    cameraContainer: {
        width: 360,
        height: 360,
        borderRadius: 20,
        overflow: 'hidden',
        marginTop: -60,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e0e0e0',
    },
    camera: {
        width: '100%',
        height: '100%',
    },
    disabledCamera: {
        backgroundColor: '#e0e0e0',
    },
    statusOverlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        padding: 20,
    },
    statusMessage: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 20,
        color: 'white',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 12,
        borderRadius: 8,
        overflow: 'hidden',
    },
    successMessage: {
        backgroundColor: 'rgba(0, 128, 0, 0.8)',
    },
    errorMessage: {
        backgroundColor: 'rgba(220, 0, 0, 0.8)',
    },
    controlsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        width: '100%',
    },
    button: {
        alignItems: 'center',
        padding: 10,
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'black',
    },
    scanAgainButton: {
        backgroundColor: '#007bff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginLeft: 20,
    },
    scanAgainText: {
        color: 'white',
        fontWeight: 'bold',
    },
});