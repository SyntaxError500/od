import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Image,
  TouchableOpacity,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const coordinators = [
  { name: 'Mudit Choudhary', phone: '9672467580' },
  { name: 'Sirjan Singh', phone: '6239709755' },
  { name: 'Vibhu Bhardwaj', phone: '9079660589' },
  { name: 'Sunidhi Avasthi', phone: '9829756507' }
];

const developer = {
  name: 'Sahil Vaswani',
  phone: '8619154144'
};

export default function AboutScreen() {
  const handleCall = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  return (
    <ImageBackground
      source={require('../assets/home.jpeg')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Coordinators Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Event Coordinators</Text>
            <View style={styles.cardsContainer}>
              {coordinators.map((coordinator, index) => (
                <View key={index} style={styles.coordinatorCard}>
                  <View style={styles.coordinatorHeader}>
                    <Ionicons name="person-circle" size={48} color="#4a90e2" />
                    <View style={styles.coordinatorInfo}>
                      <Text style={styles.coordinatorName}>{coordinator.name}</Text>
                      <Text style={styles.coordinatorPhone}>{coordinator.phone}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => handleCall(coordinator.phone)}
                  >
                    <Ionicons name="call" size={20} color="#fff" />
                    <Text style={styles.callButtonText}>Call</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Developer Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Developer</Text>
            <View style={styles.developerCard}>
              <Image
                source={require('../assets/image.png')}
                style={styles.developerImage}
              />
              <Text style={styles.developerName}>{developer.name}</Text>
              <Text style={styles.developerPhone}>{developer.phone}</Text>
              <TouchableOpacity
                style={styles.callButton}
                onPress={() => handleCall(developer.phone)}
              >
                <Ionicons name="call" size={20} color="#fff" />
                <Text style={styles.callButtonText}>Call</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Odin's Eye</Text>
            <Text style={styles.footerSubtext}>Treasure Hunt</Text>
            <Text style={styles.versionText}>Version 1.0.0</Text>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#c6cfd9',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  cardsContainer: {
    gap: 12,
  },
  coordinatorCard: {
    backgroundColor: 'rgba(26,26,26,0.55)',
    borderColor: '#333333',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  coordinatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  coordinatorInfo: {
    marginLeft: 12,
    flex: 1,
  },
  coordinatorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dfe6ef',
    marginBottom: 2,
  },
  coordinatorPhone: {
    fontSize: 14,
    color: '#9fb0c0',
  },
  developerCard: {
    backgroundColor: 'rgba(26,26,26,0.55)',
    borderColor: '#333333',
    borderWidth: 1,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
  },
  developerImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    borderColor: '#333333',
    borderWidth: 2,
  },
  developerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#dfe6ef',
    marginBottom: 4,
  },
  developerPhone: {
    fontSize: 16,
    color: '#9fb0c0',
    marginBottom: 14,
  },
  callButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(26,26,26,0.55)',
    borderColor: '#333333',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  callButtonText: {
    color: '#c5d6e9ff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    borderTopColor: '#333333',
    borderTopWidth: 1,
    marginTop: 20,
  },
  footerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#c6cfd9',
    letterSpacing: 0.8,
  },
  footerSubtext: {
    fontSize: 14,
    color: '#9fb0c0',
    marginTop: 4,
  },
  versionText: {
    fontSize: 12,
    color: '#9fb0c0',
    marginTop: 8,
  },
});
