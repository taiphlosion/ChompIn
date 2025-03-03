import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useUserContext } from "@/context/user";  
import LoginScreen from "@/screens/login";
import SignupScreen from "@/screens/signup";
import HomeScreen from "@/screens/home";
import ScanScreen from "@/screens/scan";
import ClassScreen from "@/screens/classes";
import LeaderboardScreen from "@/screens/leaderboards";
import SettingScreen from "@/screens/settings";
import Navbar from "@/components/navbar";
 

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function Tabs() {
    return (
        <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: { display: "none" } }}>
            <Tab.Screen name="home" component={HomeScreen} />
            <Tab.Screen name="scan" component={ScanScreen} />
            <Tab.Screen name="class" component={ClassScreen} />
            <Tab.Screen name="leaderboard" component={LeaderboardScreen} />
            <Tab.Screen name="setting" component={SettingScreen} />
        </Tab.Navigator>
    );
}

export default function Navigation() {
    const { user } = useUserContext();  // Get the current user from context
    
    return (
        <>
            <Stack.Navigator initialRouteName={user ? "Tabs" : "login"} >
                {!user ? (
                    <>
                        <Stack.Screen name="login" component={LoginScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="signup" component={SignupScreen} options={{ headerShown: false }} />
                    </>
                ) : (
                    <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
                )}
            </Stack.Navigator>
        </>
    );
}
