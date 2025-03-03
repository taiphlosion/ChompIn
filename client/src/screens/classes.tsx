import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import Navbar from '@/components/navbar';
import Topbar from '@/components/topbar';
import { RootStackParamList } from "@/types/types"; 

export default function Class() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    return (
        <View style={styles.container}>
            <Topbar />
            <Text>Class</Text>
            <Navbar navigation={navigation} />
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