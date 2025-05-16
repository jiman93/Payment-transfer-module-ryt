import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../store/exports';
import Authentication from '../components/Authentication';
import Loader from '../components/Loader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function AuthTest() {
  const router = useRouter();
  const {
    isAuthenticated,
    biometricsType,
    showAuthentication,
    requireAuthentication,
    handleAuthSuccess,
    handleAuthCancel,
  } = useAuth();

  const [status, setStatus] = useState('');

  // Track authentication status
  useEffect(() => {
    setStatus(isAuthenticated ? 'Authenticated' : 'Not authenticated');
  }, [isAuthenticated]);

  // Handle the test authentication flow
  const handleTestAuth = () => {
    requireAuthentication();
  };

  // Handle the success callback from authentication
  const onAuthSuccess = () => {
    setStatus('Authentication successful!');
    handleAuthSuccess();
    Alert.alert('Success', 'Authentication successful!');
  };

  // Handle the cancel callback from authentication
  const onAuthCancel = () => {
    setStatus('Authentication canceled');
    handleAuthCancel();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.title}>Authentication Test</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.infoText}>Biometric Type: {biometricsType}</Text>
        <Text style={styles.statusText}>Status: {status}</Text>

        <TouchableOpacity style={styles.authButton} onPress={handleTestAuth}>
          <Text style={styles.buttonText}>Test Authentication</Text>
        </TouchableOpacity>

        <Text style={styles.noteText}>
          This screen demonstrates the authentication flow using either biometrics or PIN.
          {'\n\n'}
          Test PIN: 123456
        </Text>
      </View>

      {/* Authentication component (will only show when triggered) */}
      {showAuthentication && (
        <Authentication
          onSuccess={onAuthSuccess}
          onCancel={onAuthCancel}
          promptMessage="Authenticate to test"
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  infoText: {
    fontSize: 18,
    marginBottom: 20,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#5271FF',
  },
  authButton: {
    backgroundColor: '#5271FF',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 40,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  noteText: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
