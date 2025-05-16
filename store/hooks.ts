import { useStore } from './index';
import { StoreState } from '../types/models';
import { useState, useCallback, useEffect } from 'react';
import { Transfer, TransactionType, NewTransferRequest } from '../types/models';
import { Alert } from 'react-native';
import authService from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Auth hooks
export const useAuth = () => {
  const store = useStore();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showAuthentication, setShowAuthentication] = useState(false);

  const authenticate = async () => {
    setIsAuthenticating(true);

    try {
      // Get biometric type first
      const biometricType = await authService.getBiometricType();

      // Update biometric type in the store
      store.updateAuthState({
        biometricsType: biometricType,
      });

      // For demo app, we'll auto-authenticate without actually checking
      // In a real app, we would trigger the Authentication component here
      // and update isAuthenticated only after successful authentication
      store.updateAuthState({
        isAuthenticated: true,
      });

      return true;
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };

  // This function could be used in a real app to show the Authentication component
  const requireAuthentication = () => {
    setShowAuthentication(true);
  };

  // Callback for when authentication is successful
  const handleAuthSuccess = () => {
    setShowAuthentication(false);
    store.updateAuthState({
      isAuthenticated: true,
    });
  };

  // Callback for when authentication is canceled
  const handleAuthCancel = () => {
    setShowAuthentication(false);
  };

  return {
    isAuthenticated: store.auth.isAuthenticated,
    biometricsType: store.auth.biometricsType,
    authenticate,
    isAuthenticating,
    showAuthentication,
    requireAuthentication,
    handleAuthSuccess,
    handleAuthCancel,
  };
};

// Account hooks
export const useAccount = () => {
  const store = useStore();
  const [isLoading, setIsLoading] = useState(false);

  const fetchAccount = async () => {
    setIsLoading(true);
    await store.fetchAccount();
    setIsLoading(false);
  };

  return {
    account: store.account,
    fetchAccount,
    isLoading,
  };
};

// Recipients hooks
export const useRecipients = () => {
  return {
    recipients: useStore().recipients,
  };
};

// Transfers hooks with loading and error states
export const useTransfers = () => {
  const store = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransfers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await store.fetchRecentTransfers(0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transfers';
      setError(errorMessage);
      Alert.alert(
        'Network Error',
        'Could not load recent transfers. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMoreTransfers = async () => {
    if (!store.transfersPagination.hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      await store.fetchRecentTransfers(
        store.transfersPagination.page + 1,
        store.transfersPagination.limit
      );
    } catch (err) {
      // Only show alert for loading more if it fails
      Alert.alert('Network Error', 'Could not load more transfers. Please try again later.', [
        { text: 'OK' },
      ]);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return {
    transfers: store.transfers,
    pagination: store.transfersPagination,
    fetchTransfers,
    fetchMoreTransfers,
    isLoading,
    isLoadingMore,
    error,
  };
};

// Type for transfer data throughout the flow
export type TransferData = {
  // Recipient details
  recipientBank?: string;
  accountNo?: string;
  recipientName?: string;
  mobileNumber?: string;

  // Transaction details
  transactionType: TransactionType;
  amount?: string;
  reference?: string;
  note?: string;
};

// Combined hook for transfer form
export const useTransferForm = () => {
  const store = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastTransfer, setLastTransfer] = useState<TransferData | null>(null);
  const [currentTransfer, setCurrentTransfer] = useState<TransferData | null>(null);

  // Load transfer data from AsyncStorage on initial mount
  useEffect(() => {
    const loadTransferData = async () => {
      try {
        const savedCurrentTransfer = await AsyncStorage.getItem('currentTransfer');
        if (savedCurrentTransfer) {
          setCurrentTransfer(JSON.parse(savedCurrentTransfer));
        }

        const savedLastTransfer = await AsyncStorage.getItem('lastTransfer');
        if (savedLastTransfer) {
          setLastTransfer(JSON.parse(savedLastTransfer));
        }
      } catch (error) {
        console.error('Error loading transfer data:', error);
      }
    };

    loadTransferData();
  }, []);

  // Save current transfer data to AsyncStorage when it changes
  useEffect(() => {
    const saveTransferData = async () => {
      try {
        if (currentTransfer) {
          await AsyncStorage.setItem('currentTransfer', JSON.stringify(currentTransfer));
        } else {
          await AsyncStorage.removeItem('currentTransfer');
        }
      } catch (error) {
        console.error('Error saving current transfer data:', error);
      }
    };

    saveTransferData();
  }, [currentTransfer]);

  // Save last transfer data to AsyncStorage when it changes
  useEffect(() => {
    const saveLastTransferData = async () => {
      try {
        if (lastTransfer) {
          await AsyncStorage.setItem('lastTransfer', JSON.stringify(lastTransfer));
        } else {
          await AsyncStorage.removeItem('lastTransfer');
        }
      } catch (error) {
        console.error('Error saving last transfer data:', error);
      }
    };

    saveLastTransferData();
  }, [lastTransfer]);

  // Start a new transfer (bank or mobile)
  const startTransfer = (transferInitData: TransferData) => {
    setCurrentTransfer(transferInitData);
  };

  // Update fields in current transfer
  const updateTransferDetails = (details: Partial<TransferData>) => {
    setCurrentTransfer((prev) => (prev ? { ...prev, ...details } : null));
  };

  // Submit a new transfer
  const submitTransfer = async (transferData: any) => {
    setIsSubmitting(true);

    try {
      // Convert amount to cents
      const amountCents = Math.round(transferData.amount * 100);

      // Create a bank recipient object
      const bankRecipient = {
        id: 'temp-id', // This will be replaced by the API
        type: 'BANK' as const,
        name: transferData.recipientName,
        accountNo: transferData.accountNo,
        bankCode: transferData.recipientBank,
      };

      // Create the transfer request
      const transferRequest: NewTransferRequest = {
        recipient: bankRecipient,
        amountCents,
        reference: transferData.reference,
        transactionType: transferData.transactionType,
      };

      await store.newTransfer(transferRequest);

      setLastTransfer(transferData);
      return true;
    } catch (error) {
      console.error('Transfer submission error:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm a transfer (final step)
  const confirmTransfer = async (transferData: any = currentTransfer) => {
    if (!transferData) return false;

    setIsSubmitting(true);

    try {
      // Convert amount to cents if it's not already
      const amountCents = Math.round(parseFloat(transferData.amount) * 100);

      // Create either a bank or mobile recipient
      const recipient = transferData.mobileNumber
        ? {
            id: 'temp-id',
            type: 'MOBILE' as const,
            name: transferData.recipientName,
            mobileNumber: transferData.mobileNumber,
          }
        : {
            id: 'temp-id',
            type: 'BANK' as const,
            name: transferData.recipientName,
            accountNo: transferData.accountNo || '',
            bankCode: transferData.recipientBank || '',
          };

      // Create the transfer request
      const transferRequest: NewTransferRequest = {
        recipient,
        amountCents,
        reference: transferData.reference,
        transactionType: transferData.transactionType,
        note: transferData.note,
      };

      await store.newTransfer(transferRequest);

      setLastTransfer(transferData);
      return true;
    } catch (error) {
      console.error('Transfer confirmation error:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset the form
  const resetForm = async () => {
    try {
      await AsyncStorage.removeItem('currentTransfer');
      await AsyncStorage.removeItem('lastTransfer');
      setLastTransfer(null);
      setCurrentTransfer(null);
    } catch (error) {
      console.error('Error resetting transfer form:', error);
    }
  };

  return {
    currentTransfer,
    startTransfer,
    updateTransferDetails,
    submitTransfer,
    confirmTransfer,
    resetForm,
    isSubmitting,
    lastTransfer,
    recipients: store.recipients,
  };
};
