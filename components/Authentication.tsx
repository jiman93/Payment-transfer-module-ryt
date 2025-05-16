import { View } from 'react-native';
import { useState, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import PinInput from './PinInput';
import Loader from './Loader';

type AuthenticationProps = {
  onAuthenticate: () => void;
  onCancel?: () => void;
};

export default function Authentication({ onAuthenticate, onCancel }: AuthenticationProps) {
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string>('');
  const [pinAttempts, setPinAttempts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const MAX_ATTEMPTS = 3;

  useEffect(() => {
    checkBiometrics();
  }, []);

  const checkBiometrics = async () => {
    try {
      setIsLoading(true);
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (hasHardware && isEnrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Verify your identity',
          fallbackLabel: 'Use PIN instead',
          cancelLabel: 'Cancel',
          disableDeviceFallback: true, // We'll handle the PIN fallback ourselves
        });

        if (result.success) {
          onAuthenticate();
        } else if (result.error === 'user_cancel') {
          setShowPin(true);
        } else {
          // Handle other biometric errors
          setShowPin(true);
        }
      } else {
        // No biometrics available, show PIN
        setShowPin(true);
      }
    } catch (error) {
      console.error('Biometric error:', error);
      setShowPin(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinComplete = async (pin: string) => {
    setIsLoading(true);

    // Simulate verification delay
    setTimeout(() => {
      // Using 111111 as the PIN
      if (pin === '111111') {
        setError('');
        onAuthenticate();
      } else {
        const newAttempts = pinAttempts + 1;
        setPinAttempts(newAttempts);

        if (newAttempts >= MAX_ATTEMPTS) {
          setError('Too many attempts. Please try again later.');
          // In a real app, you might want to implement a timeout here
          setTimeout(() => {
            setPinAttempts(0);
            setError('');
          }, 30000); // 30 seconds lockout
        } else {
          setError(`Wrong passcode. ${MAX_ATTEMPTS - newAttempts} attempts remaining`);
        }
      }
      setIsLoading(false);
    }, 500);
  };

  const handleCancel = () => {
    setShowPin(false);
    onCancel?.();
  };

  if (isLoading && !showPin) {
    return <Loader text="Verifying identity..." />;
  }

  if (!showPin) {
    return null; // Biometric prompt is native UI
  }

  return (
    <View className="flex-1">
      <PinInput onComplete={handlePinComplete} onCancel={handleCancel} error={error} />
      {isLoading && <Loader text="Verifying PIN..." />}
    </View>
  );
}
