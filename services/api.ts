import {
  UUID,
  Account,
  Recipient,
  TransferStatus,
  Channel,
  TransferRequestDto,
  Transfer,
  FailReason,
} from '../types/models';
import {
  getMockAccounts,
  getMockRecipients,
  generateReferenceCode,
  generateId,
  getMockUserById,
  validateUserCredentials,
  DEFAULT_USER,
} from '../mocks';

// Import error handling separately to avoid circular dependencies
export enum ErrorCode {
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',

  // Authentication errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  UNAUTHORIZED = 'UNAUTHORIZED',

  // Account errors
  ACCOUNT_NOT_FOUND = 'ACCOUNT_NOT_FOUND',
  INVALID_ACCOUNT_FORMAT = 'INVALID_ACCOUNT_FORMAT',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',

  // Bank errors
  INVALID_BANK_CODE = 'INVALID_BANK_CODE',
  BANK_NOT_SUPPORTED = 'BANK_NOT_SUPPORTED',

  // Transfer errors
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  TRANSFER_LIMIT_EXCEEDED = 'TRANSFER_LIMIT_EXCEEDED',
  INVALID_RECIPIENT = 'INVALID_RECIPIENT',
  TRANSFER_NOT_FOUND = 'TRANSFER_NOT_FOUND',
  TRANSFER_NOT_CANCELLABLE = 'TRANSFER_NOT_CANCELLABLE',
  NETWORK_VALIDATION_FAILED = 'NETWORK_VALIDATION_FAILED',

  // General errors
  INVALID_REQUEST = 'INVALID_REQUEST',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// Simulating network latency
const NETWORK_DELAY = 800;
const NETWORK_FAILURE_RATE = 0.05; // 5% chance of network failure

/**
 * Mock API response structure
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Create a delayed promise to simulate network calls
 */
const createDelayedPromise = <T>(
  callback: () => ApiResponse<T>,
  delay: number = NETWORK_DELAY
): Promise<ApiResponse<T>> => {
  return new Promise((resolve, reject) => {
    // Simulate random network failures
    if (Math.random() < NETWORK_FAILURE_RATE) {
      setTimeout(() => {
        reject({
          success: false,
          error: {
            code: 'NETWORK_ERROR',
            message: 'Network connection failed. Please try again.',
          },
        });
      }, delay);
      return;
    }

    setTimeout(() => {
      try {
        const result = callback();
        resolve(result);
      } catch (err) {
        reject({
          success: false,
          error: {
            code: 'UNKNOWN_ERROR',
            message: 'An unexpected error occurred.',
          },
        });
      }
    }, delay);
  });
};

/**
 * Authenticates a user with the specified authentication method
 */
export const authenticateUser = async (
  userId: string,
  authMethod: string,
  pin?: string
): Promise<ApiResponse<{ token: string }>> => {
  return createDelayedPromise<ApiResponse<{ token: string }>>(() => {
    // Check if user exists
    const user = getMockUserById(userId);
    if (!user) {
      return {
        success: false,
        error: {
          code: ErrorCode.USER_NOT_FOUND,
          message: 'User not found',
        },
      };
    }

    // For PIN authentication, validate PIN
    if (authMethod === 'PIN') {
      if (!pin) {
        return {
          success: false,
          error: {
            code: ErrorCode.INVALID_CREDENTIALS,
            message: 'PIN is required for PIN authentication',
          },
        };
      }

      // Use the validateUserCredentials function to check the PIN
      const isValid = validateUserCredentials(userId, pin);
      if (!isValid) {
        return {
          success: false,
          error: {
            code: ErrorCode.INVALID_CREDENTIALS,
            message: 'Invalid PIN',
          },
        };
      }
    }

    // Success - generate a mock token
    const token = `token_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      success: true,
      data: { token },
    };
  });
};

/**
 * Mock account validation API call
 */
export const validateAccountNumber = async (
  accountNo: string,
  bankCode: string
): Promise<ApiResponse<{ isValid: boolean; accountHolder?: string }>> => {
  return createDelayedPromise(() => {
    // Check if account number is valid format (at least 10 digits)
    if (!accountNo || !/^\d{10,}$/.test(accountNo)) {
      return {
        success: false,
        error: {
          code: 'INVALID_ACCOUNT_FORMAT',
          message: 'Account number must be at least 10 digits.',
        },
      };
    }

    // Check if bank code is valid (simple check, just ensuring it's not empty)
    if (!bankCode) {
      return {
        success: false,
        error: {
          code: 'INVALID_BANK_CODE',
          message: 'Bank code is required.',
        },
      };
    }

    // For testing purposes, make specific account numbers invalid
    if (accountNo === '0000000000') {
      return {
        success: false,
        error: {
          code: 'ACCOUNT_NOT_FOUND',
          message: 'Account not found in banking system.',
        },
      };
    }

    // Account validation passed
    return {
      success: true,
      data: {
        isValid: true,
        accountHolder: accountNo.startsWith('1') ? 'JOHN DOE' : 'JANE SMITH',
      },
    };
  });
};

/**
 * Mock fetch accounts API call
 */
export const fetchUserAccounts = async (userId: string): Promise<ApiResponse<Account[]>> => {
  return createDelayedPromise(() => {
    if (!userId) {
      return {
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User ID is required.',
        },
      };
    }

    return {
      success: true,
      data: getMockAccounts(userId),
    };
  });
};

/**
 * Mock fetch recipients API call
 */
export const fetchUserRecipients = async (userId: string): Promise<ApiResponse<Recipient[]>> => {
  return createDelayedPromise(() => {
    if (!userId) {
      return {
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User ID is required.',
        },
      };
    }

    return {
      success: true,
      data: getMockRecipients(userId),
    };
  });
};

/**
 * Mock transfer initiation API call
 */
export const initiateTransfer = async (
  userId: string,
  transferRequest: TransferRequestDto
): Promise<ApiResponse<Transfer>> => {
  return createDelayedPromise(() => {
    // Check if user ID exists
    if (!userId) {
      return {
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User ID is required.',
        },
      };
    }

    // Check if account ID exists
    if (!transferRequest.accountId) {
      return {
        success: false,
        error: {
          code: 'ACCOUNT_NOT_FOUND',
          message: 'Source account ID is required.',
        },
      };
    }

    // Check if channel is specified
    if (!transferRequest.channel) {
      return {
        success: false,
        error: {
          code: 'INVALID_CHANNEL',
          message: 'Transfer channel is required.',
        },
      };
    }

    // Check if amount is valid
    if (!transferRequest.amountCents || transferRequest.amountCents <= 0) {
      return {
        success: false,
        error: {
          code: 'INVALID_AMOUNT',
          message: 'Transfer amount must be greater than zero.',
        },
      };
    }

    // Validate recipient details based on channel
    if (transferRequest.channel === Channel.BANK_ACCOUNT) {
      if (
        !transferRequest.recipientId &&
        (!transferRequest.accountNo || !transferRequest.bankCode)
      ) {
        return {
          success: false,
          error: {
            code: 'INVALID_RECIPIENT',
            message: 'Either recipient ID or account details must be provided.',
          },
        };
      }
    } else if (transferRequest.channel === Channel.MOBILE_NUMBER) {
      if (!transferRequest.recipientId && !transferRequest.mobileNumber) {
        return {
          success: false,
          error: {
            code: 'INVALID_RECIPIENT',
            message: 'Either recipient ID or mobile number must be provided.',
          },
        };
      }
    }

    // Create a new transfer object
    const newTransfer: Transfer = {
      id: generateId('transfer'),
      accountId: transferRequest.accountId,
      channel: transferRequest.channel,
      recipientId: transferRequest.recipientId,
      amountCents: transferRequest.amountCents,
      note: transferRequest.note,
      status: TransferStatus.PENDING,
      initiatedAt: new Date().toISOString(),
      referenceCode: generateReferenceCode(),
    };

    return {
      success: true,
      data: newTransfer,
    };
  });
};

/**
 * Mock confirm transfer API call
 */
export const confirmTransfer = async (
  transferId: UUID,
  accountId: UUID,
  accountBalance: number
): Promise<ApiResponse<Transfer>> => {
  return createDelayedPromise(() => {
    // Check if transfer ID exists
    if (!transferId) {
      return {
        success: false,
        error: {
          code: 'TRANSFER_NOT_FOUND',
          message: 'Transfer ID is required.',
        },
      };
    }

    // Simulating a transfer that doesn't exist
    if (transferId === 'transfer-invalid') {
      return {
        success: false,
        error: {
          code: 'TRANSFER_NOT_FOUND',
          message: 'Transfer not found.',
        },
      };
    }

    // Get transfer amount from transfer ID (mocked - for real app would fetch from DB)
    // For demonstration, we'll extract a fake amount from the ID
    const amountCents = parseInt(transferId.split('-').pop() || '10000', 10);

    // Check sufficient funds
    if (accountBalance < amountCents) {
      return {
        success: false,
        data: {
          id: transferId,
          accountId,
          channel: Channel.BANK_ACCOUNT,
          amountCents,
          status: TransferStatus.FAILED,
          failReason: 'INSUFFICIENT_FUNDS',
          initiatedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        },
      };
    }

    // Simulating a specific transfer ID that always fails network validation
    if (transferId.includes('network-fail')) {
      return {
        success: false,
        error: {
          code: 'NETWORK_VALIDATION_FAILED',
          message: 'Network validation failed for this transfer.',
        },
      };
    }

    // Successful confirmation
    return {
      success: true,
      data: {
        id: transferId,
        accountId,
        channel: Channel.BANK_ACCOUNT,
        amountCents,
        status: TransferStatus.SUCCESS,
        initiatedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        referenceCode: generateReferenceCode(),
      },
    };
  });
};

/**
 * Mock cancel transfer API call
 */
export const cancelTransfer = async (
  transferId: UUID
): Promise<ApiResponse<{ cancelled: boolean }>> => {
  return createDelayedPromise(() => {
    // Check if transfer ID exists
    if (!transferId) {
      return {
        success: false,
        error: {
          code: 'TRANSFER_NOT_FOUND',
          message: 'Transfer ID is required.',
        },
      };
    }

    // Simulating a transfer that can't be cancelled
    if (transferId.includes('processing')) {
      return {
        success: false,
        error: {
          code: 'TRANSFER_NOT_CANCELLABLE',
          message: 'Transfer is already processing and cannot be cancelled.',
        },
      };
    }

    // Successful cancellation
    return {
      success: true,
      data: {
        cancelled: true,
      },
    };
  });
};

/**
 * Mock get transfer status API call
 */
export const getTransferStatus = async (
  transferId: UUID
): Promise<ApiResponse<{ status: TransferStatus; failReason?: FailReason }>> => {
  return createDelayedPromise(() => {
    // Check if transfer ID exists
    if (!transferId) {
      return {
        success: false,
        error: {
          code: 'TRANSFER_NOT_FOUND',
          message: 'Transfer ID is required.',
        },
      };
    }

    // Simulating different transfer statuses based on transfer ID for testing
    if (transferId.includes('pending')) {
      return {
        success: true,
        data: {
          status: TransferStatus.PENDING,
        },
      };
    }

    if (transferId.includes('processing')) {
      return {
        success: true,
        data: {
          status: TransferStatus.PROCESSING,
        },
      };
    }

    if (transferId.includes('failed')) {
      return {
        success: true,
        data: {
          status: TransferStatus.FAILED,
          failReason: 'NETWORK_ERROR',
        },
      };
    }

    // Default to success
    return {
      success: true,
      data: {
        status: TransferStatus.SUCCESS,
      },
    };
  });
};
