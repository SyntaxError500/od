import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image
} from 'react-native';
import { API_BASE_URL } from '../config';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';

export default function QuestionScreen({ route, navigation }) {
  const { question, time, points, queimagename, qrValue, qrNumber } = route.params;
  const [answer, setAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(parseInt(time) * 60); // Convert minutes to seconds
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { updateScore, forceLogout } = useContext(AuthContext);

  useEffect(() => {
    if (timeLeft > 0 && !submitted) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !submitted) {
      handleSubmit(true); // Auto-submit when time runs out
    }
  }, [timeLeft, submitted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (isTimeout = false) => {
    if (submitted) return;

    if (!isTimeout && !answer.trim()) {
      Alert.alert('Error', 'Please enter an answer');
      return;
    }

    setSubmitted(true);
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.post(
        `${API_BASE_URL}/submit-answer`,
        { qrValue, answer: answer.trim() || '' },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.isCorrect) {
        // Fetch updated score from backend
        try {
          const token = await AsyncStorage.getItem('userToken');
          const scoreResponse = await axios.get(`${API_BASE_URL}/team/score`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (updateScore) {
            updateScore(scoreResponse.data.score);
          }
        } catch (e) {
          if (e.response?.status === 403 && e.response?.data?.error?.includes('session')) {
            if (forceLogout) {
              await forceLogout('Your session has been invalidated.');
            }
          }
          console.error('Error fetching updated score:', e);
        }
        
        Alert.alert(
          'Correct!',
          `You earned ${response.data.points} points!`,
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.goBack();
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Incorrect',
          isTimeout
            ? 'Time ran out!'
            : `Wrong answer. The correct answer was: ${response.data.correctAnswer}`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      }
    } catch (error) {
      // Check if session was invalidated
      if (error.response?.status === 403 && error.response?.data?.error?.includes('session')) {
        if (forceLogout) {
          await forceLogout('Your session has been invalidated.');
        }
      } else {
        const message = error.response?.data?.error || 'Error submitting answer';
        Alert.alert('Error', message);
        setSubmitted(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.qrNumber}>QR Code: {qrNumber}</Text>
          <View style={styles.timeContainer}>
            <Text style={styles.timeLabel}>Time Remaining:</Text>
            <Text style={[styles.timeValue, timeLeft < 60 && styles.timeWarning]}>
              {formatTime(timeLeft)}
            </Text>
          </View>
          <View style={styles.pointsContainer}>
            <Text style={styles.pointsText}>{points} Points</Text>
          </View>
        </View>

        <View style={styles.questionCard}>
          <Text style={styles.questionLabel}>Question:</Text>
          <Text style={styles.questionText}>{question}</Text>
        </View>

        {queimagename && (
          <View style={styles.imageContainer}>
            <Text style={styles.imageNote}>Question Image: {queimagename}</Text>
            <Text style={styles.imageNoteSmall}>
              (Image should be displayed here if available)
            </Text>
          </View>
        )}

        <View style={styles.answerContainer}>
          <Text style={styles.answerLabel}>Your Answer:</Text>
          <TextInput
            style={styles.answerInput}
            placeholder="Enter your answer"
            placeholderTextColor="#999"
            value={answer}
            onChangeText={setAnswer}
            editable={!submitted && timeLeft > 0}
            multiline
          />
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            (submitted || loading || timeLeft === 0) && styles.submitButtonDisabled
          ]}
          onPress={() => handleSubmit(false)}
          disabled={submitted || loading || timeLeft === 0}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Submitting...' : submitted ? 'Submitted' : 'Submit Answer'}
          </Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 20,
  },
  qrNumber: {
    fontSize: 16,
    color: '#4a90e2',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#16213e',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  timeLabel: {
    fontSize: 16,
    color: '#999',
  },
  timeValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4a90e2',
  },
  timeWarning: {
    color: '#e74c3c',
  },
  pointsContainer: {
    backgroundColor: '#4a90e2',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  questionCard: {
    backgroundColor: '#16213e',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4a90e2',
  },
  questionLabel: {
    fontSize: 14,
    color: '#4a90e2',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  questionText: {
    fontSize: 18,
    color: '#fff',
    lineHeight: 26,
  },
  imageContainer: {
    backgroundColor: '#16213e',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  imageNote: {
    fontSize: 14,
    color: '#999',
    marginBottom: 5,
  },
  imageNoteSmall: {
    fontSize: 12,
    color: '#666',
  },
  answerContainer: {
    marginBottom: 20,
  },
  answerLabel: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  answerInput: {
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#666',
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

