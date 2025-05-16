import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { AuthMethod, UUID } from '../types/models';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_USER } from '../mocks';
import { authenticateUser, ErrorCode as ServiceErrorCode, ApiResponse } from '../services';
import { Alert } from 'react-native';

// Re-export ErrorCode
export { ErrorCode } from '../services';

// Custom API error class
export class ApiError extends Error {
  code: ServiceErrorCode | string;
  details?: any;

  constructor(errorResponse: { code: string; message: string; details?: any }) {
    super(errorResponse.message);
    this.name = 'ApiError';
    this.code = errorResponse.code;
    this.details = errorResponse.details;
  }
}

// Format error for displaying to user
export const formatErrorForDisplay = (error: any): { title: string; message: string } => {
  let code = ServiceErrorCode.UNKNOWN_ERROR;
  let message = 'An unexpected error occurred. Please try again later.';

  if (error instanceof ApiError) {
    code = error.code as ServiceErrorCode;
    message = error.message;
  } else if (error && error.code && error.message) {
    code = error.code;
    message = error.message;
  }

  let title = 'Error';

  // Customize title based on error category
  if (code.includes('NETWORK')) {
    title = 'Network Error';
  } else if (code.includes('AUTH') || code.includes('CREDENTIAL') || code.includes('SESSION')) {
    title = 'Authentication Error';
  } else if (code.includes('ACCOUNT')) {
    title = 'Account Error';
  } else if (code.includes('TRANSFER')) {
    title = 'Transfer Error';
  } else if (code.includes('BANK')) {
    title = 'Bank Error';
  }

  return {
    title,
    message,
  };
};

type AuthState = {
  isAuthenticated: boolean;
  userId: UUID | null;
  preferredAuthMethod: AuthMethod | null;
  token?: string;
};

type AuthContextType = {
  auth: AuthState;
  login: (userId: UUID) => Promise<boolean>;
  logout: () => void;
  authenticate: (method: AuthMethod, pin?: string) => Promise<boolean>;
  setPreferredAuthMethod: (method: AuthMethod) => void;
  loading: boolean;
  error: string | null;
};

const initialState: AuthState = {
  isAuthenticated: false,
  userId: null,
  preferredAuthMethod: null,
};

// Storage keys
const USER_ID_KEY = '@rytbank:userId';
const AUTH_METHOD_KEY = '@rytbank:authMethod';
const TOKEN_KEY = '@rytbank:token';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    // Check AsyncStorage for existing session
    const checkExistingSession = async () => {
      try {
        setLoading(true);
        const [savedUserId, savedMethod, savedToken] = await Promise.all([
          AsyncStorage.getItem(USER_ID_KEY),
          AsyncStorage.getItem(AUTH_METHOD_KEY),
          AsyncStorage.getItem(TOKEN_KEY),
        ]);

        if (savedUserId && savedToken) {
          setAuth({
            isAuthenticated: true,
            userId: savedUserId,
            preferredAuthMethod: savedMethod as AuthMethod | null,
            token: savedToken,
          });
        }
      } catch (error) {
        console.error('Failed to restore authentication state:', error);
        setError('Failed to restore session. Please login again.');
      } finally {
        setLoading(false);
      }
    };

    checkExistingSession();
  }, []);

  const login = async (userId: UUID): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // Ensure we're using a valid user ID by defaulting to DEFAULT_USER.id
      const validUserId = userId || DEFAULT_USER.id;

      // Use the mock authentication API with PIN as default method
      const response = await authenticateUser(validUserId, 'PIN', DEFAULT_USER.pin);

      if (!response.success) {
        throw new ApiError({
          code: response.error?.code || ServiceErrorCode.UNKNOWN_ERROR,
          message: response.error?.message || 'Failed to login',
        });
      }

      const { token } = response.data!;

      // Update state with token
      setAuth({
        isAuthenticated: true,
        userId: validUserId,
        preferredAuthMethod: auth.preferredAuthMethod || 'PIN',
        token,
      });

      // Save to AsyncStorage
      await Promise.all([
        AsyncStorage.setItem(USER_ID_KEY, validUserId),
        AsyncStorage.setItem(TOKEN_KEY, token),
      ]);

      return true;
    } catch (error) {
      const formattedError = formatErrorForDisplay(error);
      console.error('Login failed:', formattedError.message);
      setError(formattedError.message);

      // Show alert for certain errors
      if (error instanceof ApiError && error.code !== ServiceErrorCode.NETWORK_ERROR) {
        Alert.alert(formattedError.title, formattedError.message);
      }

      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setAuth(initialState);

      // Clear from AsyncStorage
      await Promise.all([
        AsyncStorage.removeItem(USER_ID_KEY),
        AsyncStorage.removeItem(AUTH_METHOD_KEY),
        AsyncStorage.removeItem(TOKEN_KEY),
      ]);
    } catch (error) {
      console.error('Logout failed:', error);
      const formattedError = formatErrorForDisplay(error);
      Alert.alert(formattedError.title, formattedError.message);
    } finally {
      setLoading(false);
    }
  };

  const authenticate = async (method: AuthMethod, pin?: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // Use DEFAULT_USER.id for authentication in our mock environment
      const userId = auth.userId || DEFAULT_USER.id;

      // Use the mock authentication API
      const response = await authenticateUser(userId, method, pin);

      if (!response.success) {
        throw new ApiError({
          code: response.error?.code || ServiceErrorCode.UNKNOWN_ERROR,
          message: response.error?.message || 'Authentication failed',
        });
      }

      // Update the token
      const { token } = response.data!;

      // Update auth state, including userId if it wasn't set
      setAuth((prev) => ({
        ...prev,
        isAuthenticated: true,
        userId,
        token,
      }));

      // Save to AsyncStorage
      await Promise.all([
        AsyncStorage.setItem(USER_ID_KEY, userId),
        AsyncStorage.setItem(TOKEN_KEY, token),
      ]);

      // If authentication is successful, update preferred method
      await setPreferredAuthMethod(method);

      return true;
    } catch (error) {
      const formattedError = formatErrorForDisplay(error);
      console.error(`${method} authentication failed:`, formattedError.message);
      setError(formattedError.message);

      // Show alert for authentication errors except network errors
      if (error instanceof ApiError && error.code !== ServiceErrorCode.NETWORK_ERROR) {
        Alert.alert(formattedError.title, formattedError.message);
      }

      return false;
    } finally {
      setLoading(false);
    }
  };

  const setPreferredAuthMethod = async (method: AuthMethod) => {
    try {
      setAuth((prev) => ({
        ...prev,
        preferredAuthMethod: method,
      }));

      // Save to AsyncStorage
      await AsyncStorage.setItem(AUTH_METHOD_KEY, method);
    } catch (error) {
      console.error('Failed to set preferred auth method:', error);
      const formattedError = formatErrorForDisplay(error);
      Alert.alert(formattedError.title, formattedError.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        auth,
        login,
        logout,
        authenticate,
        setPreferredAuthMethod,
        loading,
        error,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
