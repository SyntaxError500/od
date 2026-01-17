import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ImageBackground
} from 'react-native';
import { API_BASE_URL } from '../config';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';

export default function LeaderboardScreen() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const { userData, forceLogout } = useContext(AuthContext);

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`${API_BASE_URL}/leaderboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeams(response.data.teams || []);
    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.error?.includes('session')) {
        if (forceLogout) {
          await forceLogout('Your session has been invalidated.');
        }
      }
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index) => {
    if (index === 0) return '🏆';
    if (index === 1) return '🌙';
    if (index === 2) return '☄️';
    return `${index + 1}.`;
  };

  const isCurrentTeam = (teamName) => {
    return userData?.teamName === teamName;
  };

  return (
    <ImageBackground
      source={require('../assets/home.jpeg')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Event Leaderboard</Text>
          <Text style={styles.headerSubtitle}>Odin's Eye: Treasure Hunt</Text>
        </View>

      <ScrollView
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchLeaderboard} />
        }
      >
        {teams.length > 0 ? (
          teams.map((team, index) => (
            <View
              key={index}
              style={[
                styles.teamCard,
                index === 0 && styles.goldCard,
                index === 1 && styles.silverCard,
                index === 2 && styles.bronzeCard,
              ]}
            >
              <View style={styles.rankContainer}>
                <Text style={styles.positionNumber}>{index + 1}.</Text>
              </View>
                <Text style={styles.rankIcon}>{getRankIcon(index)}</Text>
              <View style={styles.teamInfo}>
                <Text
                  style={[
                    styles.teamName,
                    isCurrentTeam(team.teamName) && styles.highlightTeamName
                  ]}
                >
                  {team.teamName}
                  {isCurrentTeam(team.teamName) && ' (You)'}
                </Text>
              </View>
              <View style={styles.scoreContainer}>
                <Text
                  style={[
                    styles.score,
                    isCurrentTeam(team.teamName) && styles.currentTeamScore
                  ]}
                >
                  {team.score}
                </Text>
                <Text style={styles.scoreLabel}>pts</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No teams on leaderboard yet</Text>
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
  header: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#c6cfd9',
    marginBottom: 8,
    letterSpacing: 0.8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#9fb0c0',
    fontWeight: '500',
  },
  list: {
    flex: 1,
    padding: 16,
  },
  teamCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(26,26,26,0.55)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
    elevation: 2,
  },
  goldCard: {
    borderColor: '#ffd90084',
    borderWidth: 2,
    elevation: 6,
  },
  silverCard: {
    borderColor: '#c0c0c070',
    borderWidth: 2,

    elevation: 5,
  },
  bronzeCard: {
    borderColor: '#cd80326c',
    borderWidth: 2,
    elevation: 4,
  },
  rankContainer: {
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#c6cfd9',
    letterSpacing: 0.5,
  },
  rankIcon: {
    fontSize: 24,
    marginTop: 2,
  },
  teamInfo: {
    flex: 1,
    marginLeft: 12,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dfe6ef',
    letterSpacing: 0.3,
  },
  highlightTeamName: {
    color: '#4a90e2',
    fontWeight: 'bold',
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  score: {
    fontSize: 26,
    fontWeight: '700',
    color: '#4a90e2',
  },
  currentTeamScore: {
    color: '#4a90e2',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#9fb0c0',
    marginTop: 2,
    fontWeight: '500',
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


