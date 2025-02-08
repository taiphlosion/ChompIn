import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "@/screens/login";
import SignupScreen from "@/screens/signup";
import HomeScreen from "@/screens/home";
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
                <Stack.Screen 
                    name="home" 
                    component={HomeScreen} 
                    options={{ headerShown: false }}
                />
            )}
        </Stack.Navigator>
    );
}
