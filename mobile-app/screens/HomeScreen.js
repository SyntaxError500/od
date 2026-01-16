import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ navigation }) {
  const { userData, signOut } = useContext(AuthContext);
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome, {userData?.teamName || 'Team'}!</Text>
        <Text style={styles.leaderText}>Leader: {userData?.leaderName || ''}</Text>
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

      <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  leaderText: {
    fontSize: 16,
    color: '#999',
  },
  scoreCard: {
    backgroundColor: '#16213e',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#4a90e2',
  },
  scoreLabel: {
    fontSize: 18,
    color: '#999',
    marginBottom: 10,
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#4a90e2',
  },
  scoreSubtext: {
    fontSize: 16,
    color: '#999',
    marginTop: 5,
  },
  instructions: {
    backgroundColor: '#16213e',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4a90e2',
    marginBottom: 15,
  },
  instructionText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
    lineHeight: 24,
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});


