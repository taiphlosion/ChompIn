import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/types';
import { StackNavigationProp } from '@react-navigation/stack';
import { useUserContext } from '@/context/user';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.API_URL || "http://localhost:5000";


// Define the navigation prop type for the Login screen
type loginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'login'>;

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation<loginScreenNavigationProp>();
    const { setUser } = useUserContext();
    
    const handleLogin = async () => {
        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }
            console.log('Success:', data);

            setUser({
                id: data.user.id,
                email: data.user.email,
                first_name: data.user.first_name,
                last_name: data.user.last_name,
                role: data.user.role,
            });
        }
        catch (error) {
            if (error instanceof Error) {
                console.error("Login error:", error.message);
            } else {
                console.error("Login error:", error);
            }
        }
    };


    return (
        <View style={styles.container}>
            <View style={styles.formBox}>
                <Text style={styles.title}>Please Sign In</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={setEmail}
                    value={email}
                    placeholder="Email"
                    placeholderTextColor={'gray'}
                />
                <TextInput
                    style={styles.input}
                    onChangeText={setPassword}
                    value={password}
                    placeholder="Password"
                    placeholderTextColor={'gray'}
                    secureTextEntry={true}
                />
                <Button title="Submit" onPress={handleLogin} />

                <View style={styles.signUpContainer}>
                    <Text style={styles.signUpText}>Don't have an account? </Text>
                    <Text style={styles.signUpLink} onPress={() => navigation.navigate('signup')}>Sign Up</Text>
                </View>

            </View>
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
    formBox:{
        width: '80%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
    },
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        fontFamily: 'Nunito Sans',
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'Nunito Sans',
    },
    button: {
        backgroundColor: 'blue',
        color: 'white',
        padding: 10,
    },
    signUpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
    },
    signUpText: {
        color: 'black',
    },
    signUpLink: {
        color: 'blue',
        textDecorationLine: 'underline',
    },
})