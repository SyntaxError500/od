import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ImageBackground
} from 'react-native';
import { API_BASE_URL } from '../config';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LocationHintsScreen() {
  const { forceLogout } = useContext(AuthContext);
  const [rounds, setRounds] = useState([]);
  const [selectedRound, setSelectedRound] = useState(null);
  const [hints, setHints] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRounds();
  }, []);

  useEffect(() => {
    if (selectedRound) {
      fetchHints(selectedRound);
    }
  }, [selectedRound]);

  const fetchRounds = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`${API_BASE_URL}/rounds`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRounds(response.data.rounds || []);
      if (response.data.rounds && response.data.rounds.length > 0) {
        setSelectedRound(response.data.rounds[0]);
      }
    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.error?.includes('session')) {
        if (forceLogout) {
          await forceLogout('Your session has been invalidated.');
        }
      }
      console.error('Error fetching rounds:', error);
    }
  };

  const fetchHints = async (round) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`${API_BASE_URL}/location-hints/${round}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHints(response.data.hints || []);
    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.error?.includes('session')) {
        if (forceLogout) {
          await forceLogout('Your session has been invalidated.');
        }
      }
      console.error('Error fetching hints:', error);
      setHints([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/home.jpeg')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.roundSelector}>
          <Text style={styles.roundLabel}>Select Round</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {rounds.map((round) => (
              <TouchableOpacity
                key={round}
                style={[
                  styles.roundButton,
                  selectedRound === round && styles.roundButtonActive
                ]}
                onPress={() => setSelectedRound(round)}
              >
                <Text
                  style={[
                    styles.roundButtonText,
                    selectedRound === round && styles.roundButtonTextActive
                  ]}
                >
                  Round {round}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView
          style={styles.hintsContainer}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => selectedRound && fetchHints(selectedRound)}
            />
          }
        >
          {selectedRound ? (
            hints.length > 0 ? (
              hints.map((hint, index) => (
                <View key={index} style={styles.hintCard}>
                  <Text style={styles.hintNumber}>Location {index + 1}</Text>
                  <Text style={styles.hintText}>{hint}</Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No location hints available for this round yet.
                </Text>
              </View>
            )
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Select a round to view location hints.
              </Text>
            </View>
          )}
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
  roundSelector: {
    backgroundColor: 'rgba(26,26,26,0.55)',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  roundLabel: {
    color: '#c6cfd9',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  roundButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: 'rgba(26,26,26,0.65)',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#333333',
  },
  roundButtonActive: {
    backgroundColor: '#e9141c37',
    borderColor: '#4e6279ff',
  },
  roundButtonText: {
    color: '#667582ff',
    fontSize: 16,
    fontWeight: '600',
  },
  roundButtonTextActive: {
    color: '#fff',
  },
  hintsContainer: {
    flex: 1,
    padding: 18,
  },
  hintCard: {
    backgroundColor: 'rgba(26,26,26,0.55)',
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#333333',
    borderLeftWidth: 4,
    borderLeftColor: '#4a90e2',
  },
  hintNumber: {
    fontSize: 14,
    color: '#4a90e2',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  hintText: {
    fontSize: 16,
    color: '#dfe6ef',
    lineHeight: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#9fb0c0',
    textAlign: 'center',
  },
});


