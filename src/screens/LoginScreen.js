import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useAuthStore from '../store/authStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const login = useAuthStore((s) => s.login);
  const insets = useSafeAreaInsets();

  const handleLogin = () => {
    setError('');
    const success = login(email);
    if (!success) {
      setError('Please enter a valid email');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
    >
      <View style={styles.content}>
        {/* Logo */}
        <Text style={styles.logo}>PixelReads</Text>
        <Text style={styles.tagline}>Track your reading journey</Text>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="#888"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="go"
            onSubmitEditing={handleLogin}
          />
          
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 48,
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#2a2a4e',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#fff',
  },
  error: {
    color: '#ff6b6b',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#e94560',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
