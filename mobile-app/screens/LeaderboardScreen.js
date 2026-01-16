import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl
} from 'react-native';
import { API_BASE_URL } from '../config';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';

export default function LeaderboardScreen() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const { userData } = useContext(AuthContext);

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
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}.`;
  };

  const isCurrentTeam = (teamName) => {
    return userData?.teamName === teamName;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <Text style={styles.headerSubtitle}>Top Teams</Text>
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
                isCurrentTeam(team.teamName) && styles.currentTeamCard
              ]}
            >
              <View style={styles.rankContainer}>
                <Text style={styles.rankIcon}>{getRankIcon(index)}</Text>
              </View>
              <View style={styles.teamInfo}>
                <Text
                  style={[
                    styles.teamName,
                    isCurrentTeam(team.teamName) && styles.currentTeamName
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    backgroundColor: '#16213e',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#4a90e2',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4a90e2',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#999',
  },
  list: {
    flex: 1,
    padding: 15,
  },
  teamCard: {
    flexDirection: 'row',
    backgroundColor: '#16213e',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  currentTeamCard: {
    borderColor: '#4a90e2',
    borderWidth: 2,
    backgroundColor: '#1a2a3a',
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
  },
  rankIcon: {
    fontSize: 24,
  },
  teamInfo: {
    flex: 1,
    marginLeft: 15,
  },
  teamName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  currentTeamName: {
    color: '#4a90e2',
    fontWeight: 'bold',
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4a90e2',
  },
  currentTeamScore: {
    color: '#4a90e2',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
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


