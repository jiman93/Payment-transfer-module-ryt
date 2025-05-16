import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Account, Transfer, UUID } from '../types/models';
import { useAuth } from './AuthContext';
import { fetchUserAccounts } from '../services';
import { ApiError, formatErrorForDisplay, ErrorCode } from './AuthContext';
import { Alert } from 'react-native';

// Mock transaction type since we don't have it in our models
interface Transaction {
  id: string;
  date: string;
  description: string;
  amountCents: number;
  type: 'credit' | 'debit';
}

type AccountContextType = {
  accounts: Account[];
  selectedAccount: Account | null;
  transactions: Transaction[];
  selectAccount: (accountId: UUID) => void;
  refreshAccounts: () => Promise<void>;
  loading: boolean;
  error: string | null;
};

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: ReactNode }) {
  const { auth } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch accounts when userId changes
  useEffect(() => {
    if (auth.userId && auth.isAuthenticated) {
      refreshAccounts();
    }
  }, [auth.userId, auth.isAuthenticated]);

  // Set the first account as selected by default when accounts are loaded
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccount) {
      setSelectedAccount(accounts[0]);
    }
  }, [accounts, selectedAccount]);

  // Update transactions when selected account changes
  useEffect(() => {
    if (selectedAccount) {
      // In a real app, we would fetch transactions from an API
      // For now, we're generating mock transactions
      const mockTransactions: Transaction[] = [
        {
          id: `tr-${selectedAccount.id}-1`,
          date: new Date().toISOString(),
          description: 'Grocery shopping',
          amountCents: -4500,
          type: 'debit',
        },
        {
          id: `tr-${selectedAccount.id}-2`,
          date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          description: 'Salary deposit',
          amountCents: 500000,
          type: 'credit',
        },
      ];
      setTransactions(mockTransactions);
    }
  }, [selectedAccount]);

  const refreshAccounts = async () => {
    if (!auth.userId || !auth.isAuthenticated) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetchUserAccounts(auth.userId);

      if (!response.success) {
        throw new ApiError({
          code: response.error?.code || ErrorCode.UNKNOWN_ERROR,
          message: response.error?.message || 'Failed to fetch accounts',
        });
      }

      setAccounts(response.data || []);
    } catch (error) {
      const formattedError = formatErrorForDisplay(error);
      console.error('Failed to fetch accounts:', formattedError.message);
      setError(formattedError.message);

      // Show alert for errors except network errors
      if (error instanceof ApiError && error.code !== ErrorCode.NETWORK_ERROR) {
        Alert.alert(formattedError.title, formattedError.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const selectAccount = (accountId: UUID) => {
    const account = accounts.find((acc) => acc.id === accountId);
    if (account) {
      setSelectedAccount(account);
    } else {
      console.error(`Account with ID ${accountId} not found`);
      setError(`Account with ID ${accountId} not found`);
    }
  };

  return (
    <AccountContext.Provider
      value={{
        accounts,
        selectedAccount,
        transactions,
        selectAccount,
        refreshAccounts,
        loading,
        error,
      }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccounts() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccounts must be used within an AccountProvider');
  }
  return context;
}
