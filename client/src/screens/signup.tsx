import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { useNavigation } from '@react-navigation/native';

export default function Signup() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('');

    const navigation = useNavigation();
    
    const handleSignUp = () => {
        //API call here
        console.log('Form submitted', {firstName, lastName, email, password, confirmPassword, role});
        
        //On success, navigate to home screen
        navigation.navigate('Home');
        navigation.reset({
            index: 0, // The first screen in the stack
            routes: [{ name: 'Home' }], // The route you want to go to (Home screen)
        });
    };

    const navigateToRegister = () => {
        navigation.navigate('Signup');
    };

    return (
        <View style={styles.container}>
            <View style={styles.formBox}>
                <Text style={styles.title}>Sign Up</Text>
                {/* First name input */}
                <TextInput
                    style={styles.input}
                    onChangeText={setFirstName}
                    value={firstName}
                    placeholder="First Name"
                    placeholderTextColor={'gray'}
                />
                {/* Last name input */}
                <TextInput
                    style={styles.input}
                    onChangeText={setLastName}
                    value={lastName}
                    placeholder="Last Name"
                    placeholderTextColor={'gray'}
                />
                {/* Email input */}
                <TextInput
                    style={styles.input}
                    onChangeText={setEmail}
                    value={email}
                    placeholder="Email"
                    placeholderTextColor={'gray'}
                />
                {/* Password input */}
                <TextInput
                    style={styles.input}
                    onChangeText={setPassword}
                    value={password}
                    placeholder="Password"
                    placeholderTextColor={'gray'}
                    secureTextEntry={true}
                />
                {/* Confirm password input */}
                <TextInput
                    style={styles.input}
                    onChangeText={setConfirmPassword}
                    value={confirmPassword}
                    placeholder="Confirm Password"
                    placeholderTextColor={'gray'}
                    secureTextEntry={true}
                />
                {/* TODO: Radio Button for roles*/}
                <Button title="Submit" onPress={handleSignUp} />

                <View style={styles.signUpContainer}>
                    <Text style={styles.signUpText}>Don't have an account? </Text>
                    <Text style={styles.signUpLink} onPress={navigateToRegister}>Sign Up</Text>
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