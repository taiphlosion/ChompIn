import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "@/screens/login";
import SignupScreen from "@/screens/signup";
import HomeScreen from "@/screens/home";
import ScanScreen from "@/screens/scan";
import ClassScreen from "@/screens/classes";
import LeaderboardScreen from "@/screens/leaderboards";
import SettingScreen from "@/screens/settings";
import { useUserContext } from "@/context/user";   

const Stack = createStackNavigator();

export default function Navigation() {
    const { user } = useUserContext();  // Get the current user from context
    
    return (
        <Stack.Navigator initialRouteName={user ? "home" : "login"} >
            {!user ? (
                <>
                    <Stack.Screen 
                        name="login" 
                        component={LoginScreen} 
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen 
                        name="signup" 
                        component={SignupScreen} 
                        options={{ headerShown: false }}
                    />
                </>
            ) : (
                <>
                    <Stack.Screen 
                        name="home" 
                        component={HomeScreen} 
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="scan"
                        component={ScanScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="class"
                        component={ClassScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="leaderboard"
                        component={LeaderboardScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="setting"
                        component={SettingScreen}
                        options={{ headerShown: false }}
                    />
                </>
            )}
        </Stack.Navigator>
    );
}
