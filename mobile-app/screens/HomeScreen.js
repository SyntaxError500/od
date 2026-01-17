import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ImageBackground,
  Image
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ navigation }) {
  const { userData, signOut, forceLogout } = useContext(AuthContext);
  const [score, setScore] = useState(userData?.score || 0);
  const [refreshing, setRefreshing] = useState(false);

  const fetchScore = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`${API_BASE_URL}/team/score`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setScore(response.data.score);
    } catch (error) {
      // Check if session was invalidated
      if (error.response?.status === 403 && error.response?.data?.error?.includes('session')) {
        if (forceLogout) {
          await forceLogout('Your session has been invalidated.');
        }
      }
      console.error('Error fetching score:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchScore();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchScore();
    const interval = setInterval(fetchScore, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <ImageBackground
      source={require('../assets/home.jpeg')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.header}>
            <Image source={require('../assets/odins-eye.png')} style={styles.logo} />
            <Text style={styles.welcomeText}>Welcome, {userData?.teamName || 'Team'}!</Text>
            <Text style={styles.leaderText}>Leader: {userData?.leaderName || ''}</Text>
          </View>

          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Scanner')}
            >
              <Text style={styles.quickActionText}>Scan QR</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('LocationHints')}
            >
              <Text style={styles.quickActionText}>Hints</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Leaderboard')}
            >
              <Text style={styles.quickActionText}>Leaderboard</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Your Score</Text>
            <Text style={styles.scoreValue}>{score}</Text>
            <Text style={styles.scoreSubtext}>Points</Text>
          </View>

          <View style={styles.instructions}>
            <Text style={styles.instructionsTitle}>How to Play</Text>
            <Text style={styles.instructionText}>
              1. Check the Location Hints tab for clues
            </Text>
            <Text style={styles.instructionText}>
              2. Find the location and scan the QR code
            </Text>
            <Text style={styles.instructionText}>
              3. Answer the question correctly to earn points
            </Text>
            <Text style={styles.instructionText}>
              4. Compete with other teams on the leaderboard
            </Text>
          </View>
        </ScrollView>
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
  content: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 12,
  },
  logo: {
    width: 96,
    height: 96,
    resizeMode: 'contain',
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#c6cfd9',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  leaderText: {
    fontSize: 16,
    color: '#9fb0c0',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: 'rgba(26,26,26,0.55)',
    borderColor: '#333333',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  quickActionText: {
    color: '#4a90e2',
    fontSize: 16,
    fontWeight: '600',
  },
  scoreCard: {
    backgroundColor: 'rgba(26,26,26,0.55)',
    borderRadius: 18,
    padding: 26,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#333333',
  },
  scoreLabel: {
    fontSize: 18,
    color: '#9fb0c0',
    marginBottom: 10,
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#4a90e2',
  },
  scoreSubtext: {
    fontSize: 16,
    color: '#9fb0c0',
    marginTop: 5,
  },
  instructions: {
    backgroundColor: 'rgba(26,26,26,0.55)',
    borderRadius: 14,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4a90e2',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 16,
    color: '#dfe6ef',
    marginBottom: 8,
    lineHeight: 24,
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});


