import React from "react";
import { View, Dimensions, StyleSheet, Image, TouchableOpacity } from "react-native";
import HomeScreen from "../screens/home";
import ScanScreen from "../screens/scan";
import ClassScreen from "../screens/classes";
import AnalyticsScreen from "../screens/analytics";
import SettingScreen from "../screens/settings";
import { NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "@/types/types";

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

interface NavbarProps {
    navigation: NavigationProp<RootStackParamList>;
};

export default function Navbar({ navigation }: NavbarProps) {
    
    return (
        <View style={styles.navbar}>
            {/* Home */}
            <TouchableOpacity onPress={() => navigation.navigate("home")}>
                <Image source={require("../assets/images/home/home.png")} style={styles.icon} />
            </TouchableOpacity>
            {/* Scan */}
            <TouchableOpacity onPress={() => navigation.navigate("scan", { qrCode: "" })}>
                <Image source={require("../assets/images/home/qrcode.png")} style={styles.icon} />
            </TouchableOpacity>
            {/* Classes */}
            <TouchableOpacity onPress={() => navigation.navigate("class")}>
                <Image source={require("../assets/images/home/classroom.png")} style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("analytics")}>
                <Image source={require("../assets/images/home/stat-icon.png")} style={styles.icon} />
            </TouchableOpacity>
            {/* Settings */}
            <TouchableOpacity onPress={() => navigation.navigate("setting")}>
                <Image source={require("../assets/images/home/setting.png")} style={styles.icon} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    navbar: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        position: "absolute",
        backgroundColor: "#D9D9D9",
        borderRadius: 84,
        width: "94%",
        top : screenHeight * 0.85,
        left: "50%",
        transform: [{ translateX: -screenWidth * 0.47 }, { translateY: -screenHeight * 0.035 }],
        alignItems: "center",
        height: screenHeight * 0.07,
    },
    icon: {
        height: screenHeight * .07 * 0.71,
        width: undefined,
        aspectRatio: 1, 
        resizeMode: "contain",
    },
    button: {
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 10,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#000",
    },
});
