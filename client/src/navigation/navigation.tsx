import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "@/screens/login";
import SignupScreen from "@/screens/signup";
import HomeScreen from "@/screens/home";

const Stack = createStackNavigator();

export default function Navigation() {
    return (
        <Stack.Navigator initialRouteName="Login" >
            <Stack.Screen 
                name="Login" 
                component={LoginScreen} 
                options={{ headerShown: false }}
            />
            <Stack.Screen 
                name="Signup" 
                component={SignupScreen} 
                options={{ headerShown: false }}
            />
            <Stack.Screen 
                name="Home" 
                component={HomeScreen} 
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}



