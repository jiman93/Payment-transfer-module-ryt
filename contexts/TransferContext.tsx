import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import {
  UUID,
  Transfer,
  TransferStatus,
  TransferRequestDto,
  Channel,
  FailReason,
  RecentTransfer,
} from '../types/models';
import { useAuth } from './AuthContext';
import { useAccounts } from './AccountContext';
import { initiateTransfer, confirmTransfer, cancelTransfer, getTransferStatus } from '../services';
import { ApiError, formatErrorForDisplay, ErrorCode } from './AuthContext';
import { getRecentTransfers, addRecentTransfer, createRecentTransfer } from '../mocks';
import { Alert } from 'react-native';

type TransferState = {
  currentTransfer: Transfer | null;
  status: TransferStatus | null;
};

type TransferContextType = {
  transfer: TransferState;
  recentTransfers: RecentTransfer[];
  initiateNewTransfer: (transferRequest: TransferRequestDto) => Promise<Transfer | null>;
  confirmCurrentTransfer: () => Promise<Transfer | null>;
  cancelCurrentTransfer: () => Promise<boolean>;
  pollTransferStatus: () => Promise<TransferStatus | null>;
  clearCurrentTransfer: () => void;
  loading: boolean;
  error: string | null;
};

const initialState: TransferState = {
  currentTransfer: null,
  status: null,
};

const TransferContext = createContext<TransferContextType | undefined>(undefined);

export function TransferProvider({ children }: { children: ReactNode }) {
  const { auth } = useAuth();
  const { selectedAccount, refreshAccounts } = useAccounts();
  const [transfer, setTransfer] = useState<TransferState>(initialState);
  const [recentTransfers, setRecentTransfers] = useState<RecentTransfer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load recent transfers
  useEffect(() => {
    setRecentTransfers(getRecentTransfers());
  }, []);

  const initiateNewTransfer = async (
    transferRequest: TransferRequestDto
  ): Promise<Transfer | null> => {
    if (!auth.userId || !auth.isAuthenticated) {
      setError('User not authenticated');
      return null;
    }

    if (!selectedAccount) {
      setError('No account selected');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await initiateTransfer(auth.userId, transferRequest);

      if (!response.success) {
        throw new ApiError({
          code: response.error?.code || ErrorCode.UNKNOWN_ERROR,
          message: response.error?.message || 'Failed to initiate transfer',
        });
      }

      const newTransfer = response.data;
      setTransfer({
        currentTransfer: newTransfer,
        status: newTransfer.status,
      });

      return newTransfer;
    } catch (error) {
      const formattedError = formatErrorForDisplay(error);
      console.error('Transfer initiation failed:', formattedError.message);
      setError(formattedError.message);

      // Show alert for errors except network errors
      if (error instanceof ApiError && error.code !== ErrorCode.NETWORK_ERROR) {
        Alert.alert(formattedError.title, formattedError.message);
      }

      return null;
    } finally {
      setLoading(false);
    }
  };

  const confirmCurrentTransfer = async (): Promise<Transfer | null> => {
    if (!transfer.currentTransfer) {
      setError('No active transfer to confirm');
      return null;
    }

    if (!selectedAccount) {
      setError('No account selected');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await confirmTransfer(
        transfer.currentTransfer.id,
        selectedAccount.id,
        selectedAccount.balanceCents
      );

      if (!response.success) {
        throw new ApiError({
          code: response.error?.code || ErrorCode.UNKNOWN_ERROR,
          message: response.error?.message || 'Failed to confirm transfer',
        });
      }

      const confirmedTransfer = response.data;
      setTransfer({
        currentTransfer: confirmedTransfer,
        status: confirmedTransfer.status,
      });

      // Refresh accounts to get updated balances
      await refreshAccounts();

      // Add to recent transfers if it was successful
      const newRecentTransfer = createRecentTransfer(
        confirmedTransfer,
        'JOHN DOE', // Placeholder recipient name
        confirmedTransfer.recipientId || 'Unknown',
        'BANK',
        'Maybank' // Placeholder bank name
      );

      const updatedTransfers = addRecentTransfer(newRecentTransfer);
      setRecentTransfers(updatedTransfers);

      return confirmedTransfer;
    } catch (error) {
      const formattedError = formatErrorForDisplay(error);
      console.error('Transfer confirmation failed:', formattedError.message);
      setError(formattedError.message);

      // Show alert for errors except network errors
      if (error instanceof ApiError && error.code !== ErrorCode.NETWORK_ERROR) {
        Alert.alert(formattedError.title, formattedError.message);
      }

      return null;
    } finally {
      setLoading(false);
    }
  };

  const cancelCurrentTransfer = async (): Promise<boolean> => {
    if (!transfer.currentTransfer) {
      setError('No active transfer to cancel');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await cancelTransfer(transfer.currentTransfer.id);

      if (!response.success) {
        throw new ApiError({
          code: response.error?.code || ErrorCode.UNKNOWN_ERROR,
          message: response.error?.message || 'Failed to cancel transfer',
        });
      }

      if (response.data.cancelled) {
        setTransfer(initialState);
        return true;
      } else {
        throw new ApiError({
          code: 'TRANSFER_NOT_CANCELLED',
          message: 'Transfer could not be cancelled',
        });
      }
    } catch (error) {
      const formattedError = formatErrorForDisplay(error);
      console.error('Transfer cancellation failed:', formattedError.message);
      setError(formattedError.message);

      // Show alert for errors except network errors
      if (error instanceof ApiError && error.code !== ErrorCode.NETWORK_ERROR) {
        Alert.alert(formattedError.title, formattedError.message);
      }

      return false;
    } finally {
      setLoading(false);
    }
  };

  const pollTransferStatus = async (): Promise<TransferStatus | null> => {
    if (!transfer.currentTransfer) {
      setError('No active transfer to poll status');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getTransferStatus(transfer.currentTransfer.id);

      if (!response.success) {
        throw new ApiError({
          code: response.error?.code || ErrorCode.UNKNOWN_ERROR,
          message: response.error?.message || 'Failed to get transfer status',
        });
      }

      const status = response.data.status;
      setTransfer((prev) => ({
        ...prev,
        status,
      }));

      return status;
    } catch (error) {
      const formattedError = formatErrorForDisplay(error);
      console.error('Transfer status polling failed:', formattedError.message);
      setError(formattedError.message);

      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearCurrentTransfer = () => {
    setTransfer(initialState);
  };

  return (
    <TransferContext.Provider
      value={{
        transfer,
        recentTransfers,
        initiateNewTransfer,
        confirmCurrentTransfer,
        cancelCurrentTransfer,
        pollTransferStatus,
        clearCurrentTransfer,
        loading,
        error,
      }}>
      {children}
    </TransferContext.Provider>
  );
}

export function useTransfer() {
  const context = useContext(TransferContext);
  if (context === undefined) {
    throw new Error('useTransfer must be used within a TransferProvider');
  }
  return context;
}
