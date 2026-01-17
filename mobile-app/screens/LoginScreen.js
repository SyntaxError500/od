import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
  Image
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const loginUrl = `${API_BASE_URL}/login`;
      console.log('[LoginScreen] Posting to:', loginUrl);
      
      const response = await axios.post(loginUrl, {
        username,
        password,
      }, {
        timeout: 10000, // 10 second timeout
      });

      if (response.data.token) {
        await signIn(response.data.token, response.data.team);
        Alert.alert('Success', 'Logged in successfully!');
      }
    } catch (error) {
      const status = error.response?.status;
      const errorData = error.response?.data;
      const message = errorData?.error || error.message || 'Login failed. Please try again.';
      
      console.error('[LoginScreen] Login failed:', {
        url: `${API_BASE_URL}/login`,
        status,
        data: errorData,
        message: error.message,
        code: error.code
      });
      
      Alert.alert('Login Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/download.jpeg')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.content}>
              <Image
                source={require('../assets/odins-eye.png')}
                style={styles.logoImage}
              />
              <Text style={styles.title}>Odin's Eye</Text>
              <Text style={styles.subtitle}>Astronomy Club</Text>

              <View style={styles.form}>
                <View style={styles.inputRow}>
                  <Ionicons
                    name="mail-outline"
                    size={24}
                    color="#aaa"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Username"
                    placeholderTextColor="#aaa"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputRow}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={24}
                    color="#aaa"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#aaa"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>

                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>
                    {loading ? 'Logging in...' : 'Login'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => navigation.navigate('Register')}
                >
                  <Text style={styles.linkText}>
                    Don't have an account? Register
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  logoImage: {
    width: 220,
    height: 220,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#c6cfd9ff',
    fontFamily:'Nebula',
    marginBottom: 10,
    letterSpacing: 1.2
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 40,
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26,26,26,0.4)',
    borderColor: '#333333',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 15,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 2,
    paddingHorizontal: 0,
  },
  button: {
    backgroundColor: 'rgba(26,26,26,0.4)',
    borderColor: '#333333',
    borderWidth: 1,
    borderRadius: 25,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#4a90e2',
    fontSize: 16,
  },
});
