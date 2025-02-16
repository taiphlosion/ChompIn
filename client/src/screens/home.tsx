import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { useUserContext } from "@/context/user";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "@/types/types"; 
import Topbar from '@/components/topbar';
import { ScrollView } from "react-native-gesture-handler";

export default function Home() {
    const { setUser } = useUserContext();
    const { user } = useUserContext();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const handleLogout = async () => {
        setUser(null);

        try{
            await fetch('http://localhost:5000/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });

            navigation.navigate("login");
        }
        catch(error){
            console.log(error);
        }
    };


    return (
        <View style={styles.container}>
            <Topbar />
            <ScrollView contentContainerStyle={styles.contentContainer}>
                <Text style={styles.title}>
                    Welcome, {user?.first_name} {user?.last_name}
                </Text>
                <Button title="Logout" onPress={handleLogout} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    contentContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 80,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});