import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function Feedback() {
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('general');
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const resetForm = () => {
    setName('');
    setEmail('');
    setCategory('general');
    setRating(0);
    setFeedback('');
    setSubmitted(false);
  };

  const handleSubmit = () => {
    if (!feedback.trim()) {
      Alert.alert('Please enter some feedback before submitting.');
      return;
    }
    // simulate loading
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 2000);
  };

  if (submitted) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🎉 Thanks for your feedback!</Text>
        <Image source={require('../assets/images/feedback.jpg')} style={{ width: 400, height: 400, marginBottom: 20 }} />
        <Button title="Submit Another 🔁" onPress={resetForm} />
        <Button title="Go Home 🐊" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>We value your feedback!</Text>

      <Text style={styles.label}>Name (optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="Your name"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Email (optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="you@example.com"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <Text style={styles.label}>Category</Text>
      <View style={styles.buttonRow}>
        {['general','bug','idea','other'].map(cat => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryButton,
              category === cat && styles.categoryButtonSelected
            ]}
            onPress={() => setCategory(cat)}
          >
            <Text
              style={
                category === cat
                  ? styles.categoryTextSelected
                  : styles.categoryText
              }
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Your Feedback</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        placeholder="Write your feedback here…"
        value={feedback}
        onChangeText={setFeedback}
        multiline
      />

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <View style={styles.buttonRow}>
          <Button
            title="⬅️ Go Back"
            onPress={() => navigation.goBack()}
            color="#888"
          />
          <Button
            title="Submit ✅"
            onPress={handleSubmit}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    marginBottom: 16,
    fontWeight: '600',
  },
  label: {
    marginTop: 12,
    marginBottom: 4,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
  },
  textarea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  categoryButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginRight: 8,
  },
  categoryButtonSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  categoryText: { color: '#333' },
  categoryTextSelected: { color: '#fff' },
});
