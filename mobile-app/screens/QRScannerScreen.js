import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import { API_BASE_URL } from '../config';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');

export default function QRScannerScreen({ navigation }) {
  const { forceLogout } = useContext(AuthContext);
  const isFocused = useIsFocused();

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  // Request permission on mount
  useEffect(() => {
    requestPermission();
  }, []);

  // Reset scanner when screen refocuses
  useEffect(() => {
    if (isFocused) {
      setScanned(false);
    }
  }, [isFocused]);

  const handleBarCodeScanned = async ({ data }) => {
    if (scanned || loading) return;

    setScanned(true);
    setLoading(true);

    try {
      let qrData;
      try {
        qrData = JSON.parse(data);
      } catch {
        qrData = { value: data };
      }

      const qrValue =
        qrData.value ||
        qrData.QRCodes?.[Object.keys(qrData.QRCodes || {})[0]]?.value ||
        data;

      const token = await AsyncStorage.getItem('userToken');

      const response = await axios.post(
        `${API_BASE_URL}/team/scan-qr`,
        { qrValue },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        navigation.navigate('Question', {
          question: response.data.question,
          questionLink: response.data.questionLink,
          time: response.data.time,
          points: response.data.points,
          queimagename: response.data.queimagename,
          qrValue,
          qrNumber: response.data.qrNumber,
        });
      }
    } catch (error) {
      if (
        error.response?.status === 403 &&
        error.response?.data?.error?.includes('session')
      ) {
        await forceLogout?.('Your session has been invalidated.');
      } else {
        Alert.alert(
          'Scan Failed',
          error.response?.data?.error || 'Error scanning QR code'
        );
      }
    } finally {
      setLoading(false);
      setTimeout(() => setScanned(false), 2000);
    }
  };

  // Permission loading state
  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Checking camera permission…</Text>
      </View>
    );
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          Camera permission is required to scan QR codes
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isFocused && (
        <CameraView
          style={styles.camera}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        >
          <View style={styles.overlay}>
            <View style={styles.scanArea}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>

            <Text style={styles.instructionText}>
              Point your camera at a QR code
            </Text>

            {loading && <Text style={styles.loadingText}>Processing…</Text>}
          </View>
        </CameraView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: width * 0.7,
    height: width * 0.7,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#4a90e2',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 30,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 10,
  },
  loadingText: {
    color: '#4a90e2',
    fontSize: 18,
    marginTop: 10,
    fontWeight: 'bold',
  },
  text: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    margin: 20,
  },
  button: {
    backgroundColor: '#4a90e2',
    padding: 15,
    borderRadius: 10,
    margin: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
