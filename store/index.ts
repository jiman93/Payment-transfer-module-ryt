import { create } from 'zustand';
import {
  StoreState,
  AuthState,
  Account,
  BankRecipient,
  MobileRecipient,
  TransferPaginationParams,
  NewTransferRequest,
} from '../types/models';
import { bankApi } from '../services/bankApi';

// Initial state
const initialState: Omit<
  StoreState,
  | 'authenticate'
  | 'fetchAccount'
  | 'newTransfer'
  | 'fetchRecentTransfers'
  | 'updateAuthState'
  | 'fetchBankRecipient'
  | 'fetchMobileRecipient'
> = {
  auth: {
    isAuthenticated: false,
    biometricsType: 'None',
  },
  account: null,
  recipients: [],
  transfers: [],
  transfersPagination: {
    page: 0,
    limit: 10,
    hasMore: true,
  },
};

// Create the store with Zustand
export const useStore = create<StoreState>((set: any, get: any) => ({
  ...initialState,

  // AUTH
  authenticate: async () => {
    try {
      const response = await bankApi.auth.authenticate();

      if (response.error) {
        console.error('Authentication error:', response.error);
        return;
      }

      set({ auth: { isAuthenticated: true, biometricsType: 'TouchID' } });
    } catch (error) {
      console.error('Authentication failed:', error);
    }
  },

  // Update auth state (for use with biometrics)
  updateAuthState: (authState: Partial<AuthState>) => {
    set((state: StoreState) => ({
      auth: {
        ...state.auth,
        ...authState,
      },
    }));
  },

  // ACCOUNT
  fetchAccount: async () => {
    try {
      // Get account data
      const accountResponse = await bankApi.account.getAccount();

      if (accountResponse.error) {
        console.error('Account fetch error:', accountResponse.error);
        return;
      }

      set({ account: accountResponse.data });

      // Get recipients in parallel
      const recipientsResponse = await bankApi.recipients.getRecipients();

      if (recipientsResponse.error) {
        console.error('Recipients fetch error:', recipientsResponse.error);
        return;
      }

      set({ recipients: recipientsResponse.data });
    } catch (error) {
      console.error('Account data fetch failed:', error);
    }
  },

  // RECIPIENTS
  fetchBankRecipient: async (accountNo: string): Promise<BankRecipient | null> => {
    try {
      const response = await bankApi.recipients.getByAccountNumber(accountNo);

      if (response.error) {
        console.error('Bank recipient fetch error:', response.error);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error('Bank recipient fetch failed:', error);
      return null;
    }
  },

  fetchMobileRecipient: async (mobileNumber: string): Promise<MobileRecipient | null> => {
    try {
      const response = await bankApi.recipients.getByMobileNumber(mobileNumber);

      if (response.error) {
        console.error('Mobile recipient fetch error:', response.error);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error('Mobile recipient fetch failed:', error);
      return null;
    }
  },

  // TRANSFERS
  fetchRecentTransfers: async (page = 0, limit = 10) => {
    try {
      const response = await bankApi.transfers.getTransfers(page, limit);

      if (response.error) {
        throw new Error(`Transfers fetch error: ${response.error}`);
      }

      if (!response.data) {
        throw new Error('No data received from transfers API');
      }

      const { transfers, pagination } = response.data;

      // If it's the first page, replace transfers, otherwise append
      if (page === 0) {
        set({
          transfers,
          transfersPagination: pagination,
        });
      } else {
        set((state: StoreState) => ({
          transfers: [...state.transfers, ...transfers],
          transfersPagination: pagination,
        }));
      }
    } catch (error) {
      console.error('Transfers fetch failed:', error);
      throw error; // Re-throw to be handled by the hook
    }
  },

  // CREATE NEW TRANSFER
  newTransfer: async (req: NewTransferRequest) => {
    try {
      const response = await bankApi.transfers.createTransfer(req);

      if (response.error) {
        console.error('Transfer creation error:', response.error);
        return;
      }

      if (!response.data) {
        return;
      }

      // Add new transfer to the list and update account balance
      set((state: StoreState) => ({
        transfers: [response.data, ...state.transfers],
        account: state.account
          ? {
              ...state.account,
              balanceCents: state.account.balanceCents - req.amountCents,
            }
          : null,
      }));
    } catch (error) {
      console.error('Transfer creation failed:', error);
    }
  },
}));
