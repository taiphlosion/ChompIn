import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { useUserContext } from "@/context/user";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "@/types/types"; 
import Topbar from '@/components/topbar';
import { ScrollView } from "react-native-gesture-handler";
import ChompIn from '@/components/chomp-in';
import Navbar from '@/components/navbar';

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

    const handleChompInPress = () => {
        navigation.navigate("scan");
    };


    return (
        <View style={styles.container}>
            <Topbar />
            <ScrollView contentContainerStyle={styles.contentContainer}>
                <Text style={styles.title}>
                    Welcome, {user?.first_name} {user?.last_name}
                </Text>
                {/* Takes you to the scan screen */}
                <ChompIn title="Chomp-In?" onPress={handleChompInPress} />

                <Button title="Logout" onPress={handleLogout} />

            </ScrollView>
            <Navbar navigation={navigation} />
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