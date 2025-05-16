import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Recipient, UUID } from '../types/models';
import { useAuth } from './AuthContext';
import { fetchUserRecipients, validateAccountNumber } from '../services';
import { ApiError, formatErrorForDisplay, ErrorCode } from './AuthContext';
import { Alert } from 'react-native';

type RecipientContextType = {
  recipients: Recipient[];
  selectedRecipient: Recipient | null;
  selectRecipient: (recipientId: UUID) => void;
  refreshRecipients: () => Promise<void>;
  validateAccount: (
    accountNo: string,
    bankCode: string
  ) => Promise<{ isValid: boolean; accountHolder?: string }>;
  loading: boolean;
  error: string | null;
};

const RecipientContext = createContext<RecipientContextType | undefined>(undefined);

export function RecipientProvider({ children }: { children: ReactNode }) {
  const { auth } = useAuth();
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch recipients when user is authenticated
  useEffect(() => {
    if (auth.userId && auth.isAuthenticated) {
      refreshRecipients();
    }
  }, [auth.userId, auth.isAuthenticated]);

  const refreshRecipients = async () => {
    if (!auth.userId || !auth.isAuthenticated) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetchUserRecipients(auth.userId);

      if (!response.success) {
        throw new ApiError({
          code: response.error?.code || ErrorCode.UNKNOWN_ERROR,
          message: response.error?.message || 'Failed to fetch recipients',
        });
      }

      setRecipients(response.data || []);
    } catch (error) {
      const formattedError = formatErrorForDisplay(error);
      console.error('Failed to fetch recipients:', formattedError.message);
      setError(formattedError.message);

      // Show alert for errors except network errors
      if (error instanceof ApiError && error.code !== ErrorCode.NETWORK_ERROR) {
        Alert.alert(formattedError.title, formattedError.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const selectRecipient = (recipientId: UUID) => {
    const recipient = recipients.find((r) => r.id === recipientId);
    if (recipient) {
      setSelectedRecipient(recipient);
    } else {
      console.error(`Recipient with ID ${recipientId} not found`);
      setError(`Recipient with ID ${recipientId} not found`);
    }
  };

  const validateAccount = async (accountNo: string, bankCode: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await validateAccountNumber(accountNo, bankCode);

      if (!response.success) {
        throw new ApiError({
          code: response.error?.code || ErrorCode.UNKNOWN_ERROR,
          message: response.error?.message || 'Failed to validate account',
        });
      }

      return {
        isValid: response.data?.isValid || false,
        accountHolder: response.data?.accountHolder,
      };
    } catch (error) {
      const formattedError = formatErrorForDisplay(error);
      console.error('Account validation failed:', formattedError.message);
      setError(formattedError.message);

      // Show alert for errors except network errors
      if (error instanceof ApiError && error.code !== ErrorCode.NETWORK_ERROR) {
        Alert.alert(formattedError.title, formattedError.message);
      }

      return { isValid: false };
    } finally {
      setLoading(false);
    }
  };

  return (
    <RecipientContext.Provider
      value={{
        recipients,
        selectedRecipient,
        selectRecipient,
        refreshRecipients,
        validateAccount,
        loading,
        error,
      }}>
      {children}
    </RecipientContext.Provider>
  );
}

export function useRecipients() {
  const context = useContext(RecipientContext);
  if (context === undefined) {
    throw new Error('useRecipients must be used within a RecipientProvider');
  }
  return context;
}
