import {
  Account,
  Recipient,
  Transfer,
  TransferPaginationParams,
  NewTransferRequest,
} from '../types/models';
import { getMockAccount } from '../mocks/accounts';
import { mockRecipients, getPaginatedTransfers, addTransfer } from '../mocks/transfers';

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Simulate API error (about 10% of the time)
const simulateRandomError = (errorRate = 0.1) => {
  if (Math.random() < errorRate) {
    throw new Error('Network error: Failed to fetch data');
  }
};

// API Response structure
interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export const bankApi = {
  /**
   * Authentication API
   */
  auth: {
    // Authenticate user
    authenticate: async (): Promise<ApiResponse<{ success: boolean }>> => {
      try {
        // Simulate API call delay
        await delay(1000);

        // Simulate possible error
        simulateRandomError();

        // Return success response
        return {
          data: { success: true },
          error: null,
        };
      } catch (error) {
        console.error('Auth error:', error);
        return {
          data: null,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
      }
    },
  },

  /**
   * Account API
   */
  account: {
    // Get account details
    getAccount: async (): Promise<ApiResponse<Account>> => {
      try {
        // Simulate API call delay
        await delay(800);

        // Simulate possible error
        simulateRandomError();

        // Get mock account
        const account = getMockAccount();

        return {
          data: account,
          error: null,
        };
      } catch (error) {
        console.error('Account fetch error:', error);
        return {
          data: null,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
      }
    },
  },

  /**
   * Recipients API
   */
  recipients: {
    // Get all recipients
    getRecipients: async (): Promise<ApiResponse<Recipient[]>> => {
      try {
        // Simulate API call delay
        await delay(600);

        // Simulate possible error
        simulateRandomError();

        return {
          data: mockRecipients,
          error: null,
        };
      } catch (error) {
        console.error('Recipients fetch error:', error);
        return {
          data: null,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
      }
    },
  },

  /**
   * Transfers API
   */
  transfers: {
    // Get paginated transfers
    getTransfers: async (
      page: number = 0,
      limit: number = 10
    ): Promise<
      ApiResponse<{
        transfers: Transfer[];
        pagination: TransferPaginationParams;
      }>
    > => {
      try {
        // Simulate API call delay
        await delay(700);

        // Simulate possible error
        // simulateRandomError();

        const { transfers, hasMore } = getPaginatedTransfers(page, limit);

        return {
          data: {
            transfers,
            pagination: {
              page,
              limit,
              hasMore,
            },
          },
          error: null,
        };
      } catch (error) {
        console.error('Transfers fetch error:', error);
        return {
          data: null,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
      }
    },

    // Create a new transfer
    createTransfer: async (request: NewTransferRequest): Promise<ApiResponse<Transfer>> => {
      try {
        // Simulate API call delay
        await delay(1200);

        // Simulate possible error
        simulateRandomError(0.15); // Slightly higher error rate for transfers

        // Create new transfer with ID and timestamp
        const newTransfer = {
          ...request,
          id: `transfer-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };

        // Add to mock data
        addTransfer(newTransfer);

        return {
          data: newTransfer,
          error: null,
        };
      } catch (error) {
        console.error('Transfer creation error:', error);
        return {
          data: null,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
      }
    },
  },
};
