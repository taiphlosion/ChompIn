import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface ButtonProps {
    title: string;
    onPress: () => void;
}

export default function ChompIn({ title, onPress }: ButtonProps) {
    return (
        //Make on press take to camera screen
        <TouchableOpacity style={styles.button} onPress={onPress}>
            <Text style={styles.text}>{title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#4FEEAC',
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 5,
        borderColor: '#000',
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    text: {
        fontFamily: 'Nunito Sans',
        fontSize: 36,
        fontWeight: 'bold',
    }
});