import React from "react";
import { View, StyleSheet, Image, Dimensions, TouchableOpacity } from "react-native";

const { height } = Dimensions.get("window");

export default function Topbar() {
    return (
        <View style={styles.topbar}>
            <Image 
                source={require('../assets/images/home/logo-with-name.png')} 
                style={styles.logoName}
            />

            <TouchableOpacity style={styles.helpIcon}>
                <Image 
                source={require('../assets/images/home/feedback.png')} 
                style={styles.helpIcon}
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    topbar: {
        width: "100%",         
        height: height * 0.14699, //Adjust how big the topbar is           
        backgroundColor: "#87cefa", 
        flexDirection: "row",
        justifyContent: "space-between",   
        alignItems: "center",       
        position: "absolute",       
        top: 0,                    
        left: 0,                   
        elevation: 4,      
        zIndex: 1000,              
    }, 
    logoName: {
        width: "60%",
        height: "100%",
        resizeMode: "contain",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "white",
    },
    helpIcon:{
        height: "80%",
        aspectRatio: 1, 
        resizeMode: "contain",
    }
});
