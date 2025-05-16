import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Alert } from 'react-native';
import PinInput from './PinInput';
import Loader from './Loader';
import authService, { AuthMethod } from '../services/authService';

interface AuthenticationProps {
  onSuccess: () => void;
  onCancel?: () => void;
  promptMessage?: string;
  fallbackEnabled?: boolean;
}

export default function Authentication({
  onSuccess,
  onCancel,
  promptMessage = 'Authenticate to proceed',
  fallbackEnabled = true,
}: AuthenticationProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [biometricType, setBiometricType] = useState<string>('None');

  // Start biometric authentication on component mount
  useEffect(() => {
    const checkBiometrics = async () => {
      try {
        // Get available biometric type
        const type = await authService.getBiometricType();
        setBiometricType(type);

        // Attempt authentication with biometrics
        const authResult = await authService.authenticate({
          promptMessage,
          fallbackToPin: fallbackEnabled,
          onPinRequired: () => {
            setShowPinModal(true);
          },
        });

        // If authentication succeeded, call the success callback
        if (authResult.success) {
          onSuccess();
        }
        // Handle biometrics_canceled case specifically
        else if (authResult.error === 'biometrics_canceled') {
          if (!fallbackEnabled || !showPinModal) {
            if (onCancel) {
              onCancel();
            }
          }
        }
        // Other biometric errors that are not cancelation and not showing PIN
        else if (authResult.method === 'biometrics' && !showPinModal) {
          if (onCancel) {
            onCancel();
          }
        }
      } catch (error) {
        console.error('Authentication error:', error);
        Alert.alert('Authentication Error', 'There was an error during authentication.');
        if (onCancel) {
          onCancel();
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkBiometrics();
  }, []);

  // Handle PIN input
  const handlePinComplete = async (pin: string) => {
    setPinError(null);
    setIsLoading(true);

    try {
      // Verify PIN
      const result = await authService.verifyPin(pin);

      if (result.success) {
        setShowPinModal(false);
        onSuccess();
      } else {
        setPinError('Invalid PIN. Please try again.');
      }
    } catch (error) {
      console.error('PIN verification error:', error);
      setPinError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setShowPinModal(false);
    if (onCancel) {
      onCancel();
    }
  };

  // If waiting for biometrics, show loader
  if (isLoading && !showPinModal) {
    return <Loader text="Authenticating..." />;
  }

  // PIN modal fallback
  return (
    <Modal
      visible={showPinModal}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleCancel}>
      <PinInput onComplete={handlePinComplete} onCancel={handleCancel} error={pinError} />
      {isLoading && <Loader text="Verifying PIN..." />}
    </Modal>
  );
}
