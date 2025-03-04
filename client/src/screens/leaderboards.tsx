import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { useUserContext } from "@/context/user";
import { RootStackParamList } from "@/types/types"; 
import Navbar from '@/components/navbar';
import Topbar from '@/components/topbar';

export default function Leaderboard() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { user } = useUserContext();

    const renderProfessorView = () => {
        console.log("Rendering professor view");
        return(
            <View style={styles.container}>
                <Topbar />
                <Text>Class Analytics</Text>
                <Navbar navigation={navigation} />
            </View>
        );
    };


    const renderStudentView = () => {
        console.log("Rendering student view");
        return(
            <View style={styles.container}>
                <Topbar />
                <Text>Leaderboard</Text>
                <Navbar navigation={navigation} />
            </View>
        );
    }; 

    if (user?.role === "professor") {
        return renderProfessorView();
    }


    return renderStudentView();
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