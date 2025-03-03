import React from "react";
import { View, Text, StyleSheet} from "react-native";
import { Button } from 'react-native-elements';
import { useUserContext } from "@/context/user";
import Constants from 'expo-constants';
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "@/types/types"; 
import Navbar from '@/components/navbar';
import Topbar from '@/components/topbar';
import Icon from 'react-native-vector-icons/Ionicons';

const API_URL = Constants.expoConfig?.extra?.API_URL || "http://localhost:5000";

export default function Setting() {
    const { setUser } = useUserContext();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const handleLogout = async () => {
        setUser(null);
        try{
            await fetch(`${API_URL}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
            console.log("Logout successful");
            navigation.navigate("login");
        }
        catch(error){ console.log(error); }
    };


    return (
        <View style={styles.container}>
            <Topbar />
            <Text>Setting</Text>
            <Button 
                icon={<Icon name="log-out-outline" size={20} color="white" />}
                buttonStyle={{backgroundColor: "black"}}
                onPress={handleLogout} 
            />
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