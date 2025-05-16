import { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { AccountProvider } from './AccountContext';
import { TransferProvider } from './TransferContext';
import { RecipientProvider } from './RecipientContext';

type AppProviderProps = {
  children: ReactNode;
};

/**
 * AppProvider combines all context providers into a single component
 * for easier usage throughout the application.
 */
export function AppProvider({ children }: AppProviderProps) {
  return (
    <AuthProvider>
      <AccountProvider>
        <RecipientProvider>
          <TransferProvider>{children}</TransferProvider>
        </RecipientProvider>
      </AccountProvider>
    </AuthProvider>
  );
}

// Export all context hooks for convenient imports
export { useAuth } from './AuthContext';
export { useAccounts } from './AccountContext';
export { useTransfer } from './TransferContext';
export { useRecipients } from './RecipientContext';
