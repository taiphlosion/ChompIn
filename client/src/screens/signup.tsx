import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from '@react-navigation/native';
import RadioGroup from 'react-native-radio-buttons-group';
import { RootStackParamList } from '../types/types';
import { StackNavigationProp } from '@react-navigation/stack';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.API_URL || "http://localhost:5000";

type signupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'signup'>;

export default function Signup() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('');
    const [errors, setErrors] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: '',
    });
    const roles = [
        {id: '1', label: 'Student', value: 'student'},
        {id: '2', label: 'Professor', value: 'professor'},
    ];

    const validateInputs = () => {
        let valid = true;
        let newErrors = { firstName: '', lastName: '', email: '', password: '', confirmPassword: '', role: '' };
        const emailRegex = /^[a-zA-Z0-9._%+-]+@ufl\.edu$/;
        const nameRegex = /^[a-zA-Z]+$/;
        
        const fields = { firstName, lastName, email, password, confirmPassword, role };
        const missingFields = { 
            firstName: "First name is required.", 
            lastName: "Last name is required.", 
            email: "Email is required.", 
            password: "Password is required.", 
            confirmPassword: "Please reenter your password.", 
            role: "Please select a role."
        };
        // Check for missing fields
        Object.keys(missingFields).forEach((field) => {
            if (!fields[field as keyof typeof fields]) {
                newErrors[field as keyof typeof newErrors] = missingFields[field as keyof typeof missingFields];
                valid = false;
            }
        });
        

        //Regex validation
        if (fields.firstName && !nameRegex.test(fields.firstName)) {
            newErrors.firstName = "First name must contain only letters.";
            valid = false;
        }
        if (fields.lastName && !nameRegex.test(fields.lastName)) {
            newErrors.lastName = "Last name must contain only letters.";
            valid = false;
        }
        if (fields.email && !emailRegex.test(fields.email)) {
            newErrors.email = "Email must be a valid UF email.";
            valid = false;
        }
        if (fields.password && fields.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters long.";
            valid = false;
        }
        if (fields.password !== fields.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match.";
            valid = false;
        }

        setErrors(newErrors);
        return valid;        
    };

    const navigation = useNavigation<signupScreenNavigationProp>();
    
    const handleSignUp = async () => {
        if (!validateInputs()) {
            return;
        }

        //REGISTER USER
        try{
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    first_name: firstName, 
                    last_name: lastName, 
                    email, 
                    password, 
                    role 
                }),
            });
            const data = await response.json();

            if (response.ok) {
                navigation.reset({
                    index: 0, // The first screen in the stack
                    routes: [{ name: 'login' }], // The route you want to go to (Login screen)
                });
            }
            else {
                console.error('Signup error:', data.message);
            }
        }
        catch (error) {
            if (error instanceof Error) {
                console.error("Signup error:", error.message);
            } else {
                console.error("Signup error:", error);
            }
        }
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
                {/* First name error */}
                {errors.firstName ? <Text style={styles.errorText}>{String(errors.firstName)}</Text> : null} 

                {/* Last name input */}
                <TextInput
                    style={styles.input}
                    onChangeText={setLastName}
                    value={lastName}
                    placeholder="Last Name"
                    placeholderTextColor={'gray'}
                />
                {/* Last name error */}
                {errors.lastName ? <Text style={styles.errorText}>{String(errors.lastName)}</Text> : null} 

                {/* Email input */}
                <TextInput
                    style={styles.input}
                    onChangeText={setEmail}
                    value={email}
                    placeholder="Email"
                    placeholderTextColor={'gray'}
                />
                {errors.email ? <Text style={styles.errorText}>{String(errors.email)}</Text> : null}

                {/* Password input */}
                <TextInput
                    style={styles.input}
                    onChangeText={setPassword}
                    value={password}
                    placeholder="Password"
                    placeholderTextColor={'gray'}
                    secureTextEntry={true}
                />
                {errors.password ? <Text style={styles.errorText}>{String(errors.password)}</Text> : null}
                
                {/* Confirm password input */}
                <TextInput
                    style={styles.input}
                    onChangeText={setConfirmPassword}
                    value={confirmPassword}
                    placeholder="Confirm Password"
                    placeholderTextColor={'gray'}
                    secureTextEntry={true}
                />
                {errors.confirmPassword ? <Text style={styles.errorText}>{String(errors.confirmPassword)}</Text> : null}

                {/* Account type selection*/}
                <RadioGroup 
                    radioButtons={roles} 
                    onPress={(selectedId) => setRole(roles.find(r => r.id === selectedId)?.value || '')}
                    selectedId={roles.find(r => r.value === role)?.id} 
                    containerStyle={{ alignItems: 'flex-start' }} 
                />
                {errors.role ? <Text style={styles.errorText}>{String(errors.role)}</Text> : null}

                {/* Submit button */}
                <Button title="Submit" onPress={handleSignUp} />

                {/* 🚀 Back to Login Button */}
                <TouchableOpacity style={styles.backToLogin} onPress={() => navigation.reset({ index: 0, routes: [{ name: 'login' }]})}>
                    <Text style={styles.backToLoginText}>Back to Login</Text>
                </TouchableOpacity>
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
    errorText: {
        color: 'red',
        fontSize: 12,
        marginBottom: 10,
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
    backToLogin: {
        marginTop: 15,
        alignItems: 'center',
    },
    backToLoginText: {
        color: 'blue',
        textDecorationLine: 'underline',
    },
})