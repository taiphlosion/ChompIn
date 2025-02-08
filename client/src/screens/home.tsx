import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useUserContext } from "@/context/user";

export default function Home() {
    const { user } = useUserContext();
    console.log(user?.first_name);


    return (
        <View style={styles.container}>
            {/* First and last name from response */}
            <Text style={styles.title}>
                Welcome, {user?.first_name} {user?.last_name}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 174, 66, 0.89)',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    }
});