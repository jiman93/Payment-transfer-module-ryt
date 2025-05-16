import { useStore } from './index';
import { StoreState } from '../types/models';
import { useState, useCallback, useEffect } from 'react';
import { Transfer, TransactionType, NewTransferRequest } from '../types/models';
import { Alert } from 'react-native';

// Auth hooks
export const useAuth = () => {
  const store = useStore();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const authenticate = async () => {
    setIsAuthenticating(true);
    await store.authenticate();
    setIsAuthenticating(false);
  };

  return {
    isAuthenticated: store.auth.isAuthenticated,
    biometricsType: store.auth.biometricsType,
    authenticate,
    isAuthenticating,
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

// Combined hook for transfer form
export const useTransferForm = () => {
  const store = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastTransfer, setLastTransfer] = useState<any>(null);

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
  const confirmTransfer = async (transferData: any) => {
    setIsSubmitting(true);

    try {
      // Convert amount to cents if it's not already
      const amountCents = Math.round(transferData.amount * 100);

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
  const resetForm = () => {
    setLastTransfer(null);
  };

  return {
    submitTransfer,
    confirmTransfer,
    resetForm,
    isSubmitting,
    lastTransfer,
    recipients: store.recipients,
  };
};
