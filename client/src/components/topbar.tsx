import React from "react";
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity } from "react-native";

const { height } = Dimensions.get("window");

const Topbar = () => {
    return (
        <View style={styles.topbar}>
            <Image 
                source={require('../assets/images/home/logo-with-name.png')} 
            />

            <TouchableOpacity style={styles.helpIcon}>
                <Image 
                source={require('../assets/images/home/feedback.png')} 
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    topbar: {
        width: "100%",         
        height: height * 0.14699,            
        backgroundColor: "#87cefa", 
        flexDirection: "row",
        justifyContent: "space-between",   
        alignItems: "center",       
        position: "absolute",       
        top: 0,                    
        left: 0,                   
        elevation: 4,              // Optional: adds shadow for iOS and Android
        zIndex: 1000,              
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "white",
    },
    helpIcon:{
        padding: 10,
    }
});

export default Topbar;
