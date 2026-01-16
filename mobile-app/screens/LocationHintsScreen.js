import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { API_BASE_URL } from '../config';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LocationHintsScreen() {
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
      console.error('Error fetching hints:', error);
      setHints([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.roundSelector}>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  roundSelector: {
    backgroundColor: '#16213e',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#0f1419',
  },
  roundButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#0f1419',
    marginRight: 10,
  },
  roundButtonActive: {
    backgroundColor: '#4a90e2',
  },
  roundButtonText: {
    color: '#999',
    fontSize: 16,
    fontWeight: '600',
  },
  roundButtonTextActive: {
    color: '#fff',
  },
  hintsContainer: {
    flex: 1,
    padding: 15,
  },
  hintCard: {
    backgroundColor: '#16213e',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#4a90e2',
  },
  hintNumber: {
    fontSize: 14,
    color: '#4a90e2',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  hintText: {
    fontSize: 16,
    color: '#fff',
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
    color: '#999',
    textAlign: 'center',
  },
});


