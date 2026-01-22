import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from "expo-splash-screen";
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import LocationHintsScreen from './screens/LocationHintsScreen';
import QRScannerScreen from './screens/QRScannerScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import QuestionScreen from './screens/QuestionScreen';
import HomeScreen from './screens/HomeScreen';
import AboutScreen from './screens/AboutScreen';
import { AuthContext } from './context/AuthContext';
import { API_BASE_URL, API_HOST } from './config';
import { useFonts } from 'expo-font';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'LocationHints') {
            iconName = focused ? 'location' : 'location-outline';
          } else if (route.name === 'Scanner') {
            iconName = focused ? 'qr-code' : 'qr-code-outline';
          } else if (route.name === 'Leaderboard') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'About') {
            iconName = focused ? 'information-circle' : 'information-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4a90e2',
        tabBarInactiveTintColor: '#9fb0c0',
        tabBarStyle: {
          backgroundColor: 'rgba(26,26,26,0.95)',
          borderTopColor: '#333333',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 4,
        },
        headerStyle: {
          backgroundColor: '#1a1a2e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Odin\'s Eye' }}
      />
      <Tab.Screen 
        name="LocationHints" 
        component={LocationHintsScreen}
        options={{ title: 'Location Hints' }}
      />
      <Tab.Screen 
        name="Scanner" 
        component={QRScannerScreen}
        options={{ title: 'Scan QR' }}
      />
      <Tab.Screen 
        name="Leaderboard" 
        component={LeaderboardScreen}
        options={{ title: 'Leaderboard' }}
      />
      <Tab.Screen 
        name="About" 
        component={AboutScreen}
        options={{ title: 'About' }}
      />
    </Tab.Navigator>
  );
}

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [fontsLoaded] = useFonts({
    Nebula: require("./fonts/Nebula-Regular.otf"),
  });

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const data = await AsyncStorage.getItem('userData');
      if (token && data) {
        setUserToken(token);
        setUserData(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    checkAuth();
  }, []);

  // Debug: check backend connectivity on app start
  useEffect(() => {
    const ping = async () => {
      try {
        const res = await fetch(`${API_HOST}/health`);
        if (!res.ok) {
          console.warn('Health check failed:', res.status);
        }
      } catch (e) {
        console.warn('Cannot reach API host:', API_HOST, e?.message);
      }
    };
    ping();
  }, []);

  const authContext = {
    signIn: async (token, data) => {
      try {
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userData', JSON.stringify(data));
        setUserToken(token);
        setUserData(data);
      } catch (error) {
        console.error('Error signing in:', error);
      }
    },
    signOut: async () => {
      try {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
        setUserToken(null);
        setUserData(null);
      } catch (error) {
        console.error('Error signing out:', error);
      }
    },
    forceLogout: async (message) => {
      // Called when admin forces logout or session is invalidated
      try {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
        setUserToken(null);
        setUserData(null);
        // Show alert to user about forced logout
        if (message) {
          Alert.alert('Session Invalidated', message || 'Your session has been invalidated. Please login again.');
        }
      } catch (error) {
        console.error('Error in force logout:', error);
      }
    },
    updateScore: (newScore) => {
      if (userData) {
        const updatedData = { ...userData, score: newScore };
        AsyncStorage.setItem('userData', JSON.stringify(updatedData));
        setUserData(updatedData);
      }
    },
    userData: userData,
    userToken: userToken
  };

  // Conditional returns must come after all hooks
  if (!fontsLoaded) {
    return null; // keep splash screen visible
  }

  if (isLoading) {
    return null; // You can add a loading screen here
  }

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: '#1a1a2e',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          {userToken == null ? (
            <>
              <Stack.Screen 
                name="Login" 
                component={LoginScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="Register" 
                component={RegisterScreen}
                options={{ title: 'Register Team' }}
              />
            </>
          ) : (
            <>
              <Stack.Screen 
                name="MainTabs" 
                component={MainTabs}
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="Question" 
                component={QuestionScreen}
                options={{ title: 'Answer Question' }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}