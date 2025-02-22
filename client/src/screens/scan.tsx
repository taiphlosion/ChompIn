import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Scan() {
    return (
        <View style={styles.container}>
            <Text>Scan</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        fontSize: 24,
        fontWeight: "bold",
    },
});