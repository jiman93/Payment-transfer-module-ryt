import * as LocalAuthentication from 'expo-local-authentication';
import { Alert, Platform } from 'react-native';
import { BiometricsType } from '../types/models';

// Available authentication types
export type AuthMethod = 'biometrics' | 'pin';

// Authentication result
export interface AuthResult {
  success: boolean;
  method?: AuthMethod;
  error?: string;
}

// Authentication options
export interface AuthOptions {
  promptMessage?: string;
  cancelLabel?: string;
  fallbackToPin?: boolean;
  onPinRequired?: () => void;
}

/**
 * Authentication Service - Handles device authentication with biometrics and PIN fallback
 */
class AuthService {
  // Checks what biometric authentication types are available
  async getBiometricType(): Promise<BiometricsType> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) return 'None';

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) return 'None';

      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        return 'FaceID';
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        return 'TouchID';
      } else {
        return 'None';
      }
    } catch (error) {
      console.error('Error checking biometric type:', error);
      return 'None';
    }
  }

  // Authenticate with biometrics, with optional fallback to PIN
  async authenticate(options: AuthOptions = {}): Promise<AuthResult> {
    const {
      promptMessage = 'Authenticate to proceed',
      cancelLabel = 'Cancel',
      fallbackToPin = true,
      onPinRequired,
    } = options;

    try {
      // Check if biometrics are available
      const biometricType = await this.getBiometricType();

      if (biometricType !== 'None') {
        // Try biometric authentication
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage,
          cancelLabel,
          disableDeviceFallback: true, // We'll handle the fallback ourselves
        });

        if (result.success) {
          return { success: true, method: 'biometrics' };
        }

        // If user canceled and we should fallback to PIN
        if (result.error === 'user_cancel' && fallbackToPin) {
          // Notify caller that PIN input is required
          if (onPinRequired) {
            onPinRequired();
          }
          return { success: false, method: 'biometrics', error: 'biometrics_canceled' };
        }

        // Other biometric errors
        return {
          success: false,
          method: 'biometrics',
          error: result.error || 'biometrics_failed',
        };
      }

      // No biometrics available
      if (fallbackToPin) {
        // Notify caller that PIN input is required
        if (onPinRequired) {
          onPinRequired();
        }
        return { success: false, method: 'pin', error: 'biometrics_unavailable' };
      }

      return { success: false, error: 'authentication_unavailable' };
    } catch (error) {
      console.error('Authentication error:', error);
      return { success: false, error: 'authentication_error' };
    }
  }

  // Verify PIN (this would typically check against a stored PIN)
  // For this implementation, let's use a fixed PIN - in a real app,
  // you'd want to securely store and verify the PIN
  async verifyPin(pin: string): Promise<AuthResult> {
    // Demo PIN is 123456
    // In a real app, you would verify against a securely stored PIN
    const isValid = pin === '123456';

    return {
      success: isValid,
      method: 'pin',
      error: isValid ? undefined : 'invalid_pin',
    };
  }
}

export default new AuthService();
