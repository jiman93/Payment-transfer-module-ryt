// import {
//   UUID,
//   Account,
//   Recipient,
//   TransferStatus,
//   Channel,
//   TransferRequestDto,
//   Transfer,
//   FailReason,
//   TransferPaginationParams,
//   NewTransferRequest,
// } from '../types/models';
// import {
//   getMockAccounts,
//   getMockRecipients,
//   generateReferenceCode,
//   generateId,
//   getMockUserById,
//   validateUserCredentials,
//   getMockAccount,
// } from '../mocks';
// import { mockRecipients, getPaginatedTransfers, addTransfer } from '../mocks/transfers';

// // Import error handling separately to avoid circular dependencies
// export enum ErrorCode {
//   // Network errors
//   NETWORK_ERROR = 'NETWORK_ERROR',
//   TIMEOUT_ERROR = 'TIMEOUT_ERROR',

//   // Authentication errors
//   INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
//   USER_NOT_FOUND = 'USER_NOT_FOUND',
//   SESSION_EXPIRED = 'SESSION_EXPIRED',
//   UNAUTHORIZED = 'UNAUTHORIZED',

//   // Account errors
//   ACCOUNT_NOT_FOUND = 'ACCOUNT_NOT_FOUND',
//   INVALID_ACCOUNT_FORMAT = 'INVALID_ACCOUNT_FORMAT',
//   ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',

//   // Bank errors
//   INVALID_BANK_CODE = 'INVALID_BANK_CODE',
//   BANK_NOT_SUPPORTED = 'BANK_NOT_SUPPORTED',

//   // Transfer errors
//   INVALID_AMOUNT = 'INVALID_AMOUNT',
//   INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
//   TRANSFER_LIMIT_EXCEEDED = 'TRANSFER_LIMIT_EXCEEDED',
//   INVALID_RECIPIENT = 'INVALID_RECIPIENT',
//   TRANSFER_NOT_FOUND = 'TRANSFER_NOT_FOUND',
//   TRANSFER_NOT_CANCELLABLE = 'TRANSFER_NOT_CANCELLABLE',
//   NETWORK_VALIDATION_FAILED = 'NETWORK_VALIDATION_FAILED',

//   // General errors
//   INVALID_REQUEST = 'INVALID_REQUEST',
//   UNKNOWN_ERROR = 'UNKNOWN_ERROR',
// }

// // Simulating network latency
// const NETWORK_DELAY = 800;
// const NETWORK_FAILURE_RATE = 0.05; // 5% chance of network failure

// // Simulate network delay
// const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// // Simulate API error (about 10% of the time)
// const simulateRandomError = (errorRate = 0.1) => {
//   if (Math.random() < errorRate) {
//     throw new Error('Network error: Failed to fetch data');
//   }
// };

// /**
//  * Mock API response structure
//  */
// export interface ApiResponse<T> {
//   data: T | null;
//   error: string | null;
// }

// /**
//  * Create a delayed promise to simulate network calls
//  */
// const createDelayedPromise = <T>(
//   callback: () => ApiResponse<T>,
//   delay: number = NETWORK_DELAY
// ): Promise<ApiResponse<T>> => {
//   return new Promise((resolve, reject) => {
//     // Simulate random network failures
//     if (Math.random() < NETWORK_FAILURE_RATE) {
//       setTimeout(() => {
//         reject({
//           data: null,
//           error: 'Network connection failed. Please try again.',
//         });
//       }, delay);
//       return;
//     }

//     setTimeout(() => {
//       try {
//         const result = callback();
//         resolve(result);
//       } catch (err) {
//         reject({
//           data: null,
//           error: 'An unexpected error occurred.',
//         });
//       }
//     }, delay);
//   });
// };

// /**
//  * Authenticates a user with the specified authentication method
//  */
// export const authenticateUser = async (
//   userId: string,
//   authMethod: string,
//   pin?: string
// ): Promise<ApiResponse<{ token: string }>> => {
//   return createDelayedPromise<ApiResponse<{ token: string }>>(() => {
//     // Check if user exists
//     const user = getMockUserById(userId);
//     if (!user) {
//       return {
//         data: null,
//         error: ErrorCode.USER_NOT_FOUND,
//       };
//     }

//     // For PIN authentication, validate PIN
//     if (authMethod === 'PIN') {
//       if (!pin) {
//         return {
//           data: null,
//           error: ErrorCode.INVALID_CREDENTIALS,
//         };
//       }

//       // Use the validateUserCredentials function to check the PIN
//       const isValid = validateUserCredentials(userId, pin);
//       if (!isValid) {
//         return {
//           data: null,
//           error: ErrorCode.INVALID_CREDENTIALS,
//         };
//       }
//     }

//     // Success - generate a mock token
//     const token = `token_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

//     return {
//       data: { token },
//       error: null,
//     };
//   });
// };

// /**
//  * Mock account validation API call
//  */
// export const validateAccountNumber = async (
//   accountNo: string,
//   bankCode: string
// ): Promise<ApiResponse<{ isValid: boolean; accountHolder?: string }>> => {
//   return createDelayedPromise(() => {
//     // Check if account number is valid format (at least 10 digits)
//     if (!accountNo || !/^\d{10,}$/.test(accountNo)) {
//       return {
//         data: null,
//         error: ErrorCode.INVALID_ACCOUNT_FORMAT,
//       };
//     }

//     // Check if bank code is valid (simple check, just ensuring it's not empty)
//     if (!bankCode) {
//       return {
//         data: null,
//         error: ErrorCode.INVALID_BANK_CODE,
//       };
//     }

//     // For testing purposes, make specific account numbers invalid
//     if (accountNo === '0000000000') {
//       return {
//         data: null,
//         error: ErrorCode.ACCOUNT_NOT_FOUND,
//       };
//     }

//     // Account validation passed
//     return {
//       data: {
//         isValid: true,
//         accountHolder: accountNo.startsWith('1') ? 'JOHN DOE' : 'JANE SMITH',
//       },
//       error: null,
//     };
//   });
// };

// /**
//  * Mock fetch accounts API call
//  */
// export const fetchUserAccounts = async (userId: string): Promise<ApiResponse<Account[]>> => {
//   return createDelayedPromise(() => {
//     if (!userId) {
//       return {
//         data: null,
//         error: ErrorCode.USER_NOT_FOUND,
//       };
//     }

//     return {
//       data: getMockAccounts(userId),
//       error: null,
//     };
//   });
// };

// /**
//  * Mock fetch recipients API call
//  */
// export const fetchUserRecipients = async (userId: string): Promise<ApiResponse<Recipient[]>> => {
//   return createDelayedPromise(() => {
//     if (!userId) {
//       return {
//         data: null,
//         error: ErrorCode.USER_NOT_FOUND,
//       };
//     }

//     return {
//       data: getMockRecipients(userId),
//       error: null,
//     };
//   });
// };

// /**
//  * Mock transfer initiation API call
//  */
// export const initiateTransfer = async (
//   userId: string,
//   transferRequest: TransferRequestDto
// ): Promise<ApiResponse<Transfer>> => {
//   return createDelayedPromise(() => {
//     // Check if user ID exists
//     if (!userId) {
//       return {
//         data: null,
//         error: ErrorCode.USER_NOT_FOUND,
//       };
//     }

//     // Check if account ID exists
//     if (!transferRequest.accountId) {
//       return {
//         data: null,
//         error: ErrorCode.ACCOUNT_NOT_FOUND,
//       };
//     }

//     // Check if channel is specified
//     if (!transferRequest.channel) {
//       return {
//         data: null,
//         error: ErrorCode.INVALID_CHANNEL,
//       };
//     }

//     // Check if amount is valid
//     if (!transferRequest.amountCents || transferRequest.amountCents <= 0) {
//       return {
//         data: null,
//         error: ErrorCode.INVALID_AMOUNT,
//       };
//     }

//     // Validate recipient details based on channel
//     if (transferRequest.channel === Channel.BANK_ACCOUNT) {
//       if (
//         !transferRequest.recipientId &&
//         (!transferRequest.accountNo || !transferRequest.bankCode)
//       ) {
//         return {
//           data: null,
//           error: ErrorCode.INVALID_RECIPIENT,
//         };
//       }
//     } else if (transferRequest.channel === Channel.MOBILE_NUMBER) {
//       if (!transferRequest.recipientId && !transferRequest.mobileNumber) {
//         return {
//           data: null,
//           error: ErrorCode.INVALID_RECIPIENT,
//         };
//       }
//     }

//     // Create a new transfer object
//     const newTransfer: Transfer = {
//       id: generateId('transfer'),
//       accountId: transferRequest.accountId,
//       channel: transferRequest.channel,
//       recipientId: transferRequest.recipientId,
//       amountCents: transferRequest.amountCents,
//       note: transferRequest.note,
//       status: TransferStatus.PENDING,
//       initiatedAt: new Date().toISOString(),
//       referenceCode: generateReferenceCode(),
//     };

//     return {
//       data: newTransfer,
//       error: null,
//     };
//   });
// };

// /**
//  * Mock confirm transfer API call
//  */
// export const confirmTransfer = async (
//   transferId: UUID,
//   accountId: UUID,
//   accountBalance: number
// ): Promise<ApiResponse<Transfer>> => {
//   return createDelayedPromise(() => {
//     // Check if transfer ID exists
//     if (!transferId) {
//       return {
//         data: null,
//         error: ErrorCode.TRANSFER_NOT_FOUND,
//       };
//     }

//     // Simulating a transfer that doesn't exist
//     if (transferId === 'transfer-invalid') {
//       return {
//         data: null,
//         error: ErrorCode.TRANSFER_NOT_FOUND,
//       };
//     }

//     // Get transfer amount from transfer ID (mocked - for real app would fetch from DB)
//     // For demonstration, we'll extract a fake amount from the ID
//     const amountCents = parseInt(transferId.split('-').pop() || '10000', 10);

//     // Check sufficient funds
//     if (accountBalance < amountCents) {
//       return {
//         data: {
//           id: transferId,
//           accountId,
//           channel: Channel.BANK_ACCOUNT,
//           amountCents,
//           status: TransferStatus.FAILED,
//           failReason: 'INSUFFICIENT_FUNDS',
//           initiatedAt: new Date().toISOString(),
//           completedAt: new Date().toISOString(),
//         },
//         error: null,
//       };
//     }

//     // Simulating a specific transfer ID that always fails network validation
//     if (transferId.includes('network-fail')) {
//       return {
//         data: null,
//         error: ErrorCode.NETWORK_VALIDATION_FAILED,
//       };
//     }

//     // Successful confirmation
//     return {
//       data: {
//         id: transferId,
//         accountId,
//         channel: Channel.BANK_ACCOUNT,
//         amountCents,
//         status: TransferStatus.SUCCESS,
//         initiatedAt: new Date().toISOString(),
//         completedAt: new Date().toISOString(),
//         referenceCode: generateReferenceCode(),
//       },
//       error: null,
//     };
//   });
// };

// /**
//  * Mock cancel transfer API call
//  */
// export const cancelTransfer = async (
//   transferId: UUID
// ): Promise<ApiResponse<{ cancelled: boolean }>> => {
//   return createDelayedPromise(() => {
//     // Check if transfer ID exists
//     if (!transferId) {
//       return {
//         data: null,
//         error: ErrorCode.TRANSFER_NOT_FOUND,
//       };
//     }

//     // Simulating a transfer that can't be cancelled
//     if (transferId.includes('processing')) {
//       return {
//         data: null,
//         error: ErrorCode.TRANSFER_NOT_CANCELLABLE,
//       };
//     }

//     // Successful cancellation
//     return {
//       data: {
//         cancelled: true,
//       },
//       error: null,
//     };
//   });
// };

// /**
//  * Mock get transfer status API call
//  */
// export const getTransferStatus = async (
//   transferId: UUID
// ): Promise<ApiResponse<{ status: TransferStatus; failReason?: FailReason }>> => {
//   return createDelayedPromise(() => {
//     // Check if transfer ID exists
//     if (!transferId) {
//       return {
//         data: null,
//         error: ErrorCode.TRANSFER_NOT_FOUND,
//       };
//     }

//     // Simulating different transfer statuses based on transfer ID for testing
//     if (transferId.includes('pending')) {
//       return {
//         data: {
//           status: TransferStatus.PENDING,
//         },
//         error: null,
//       };
//     }

//     if (transferId.includes('processing')) {
//       return {
//         data: {
//           status: TransferStatus.PROCESSING,
//         },
//         error: null,
//       };
//     }

//     if (transferId.includes('failed')) {
//       return {
//         data: {
//           status: TransferStatus.FAILED,
//           failReason: 'NETWORK_ERROR',
//         },
//         error: null,
//       };
//     }

//     // Default to success
//     return {
//       data: {
//         status: TransferStatus.SUCCESS,
//       },
//       error: null,
//     };
//   });
// };

// export const api = {
//   /**
//    * Authentication API
//    */
//   auth: {
//     // Authenticate user
//     authenticate: async (): Promise<ApiResponse<{ success: boolean }>> => {
//       try {
//         // Simulate API call delay
//         await delay(1000);

//         // Simulate possible error
//         simulateRandomError();

//         // Return success response
//         return {
//           data: { success: true },
//           error: null,
//         };
//       } catch (error) {
//         console.error('Auth error:', error);
//         return {
//           data: null,
//           error: error instanceof Error ? error.message : 'Unknown error occurred',
//         };
//       }
//     },
//   },

//   /**
//    * Account API
//    */
//   account: {
//     // Get account details
//     getAccount: async (): Promise<ApiResponse<Account>> => {
//       try {
//         // Simulate API call delay
//         await delay(800);

//         // Simulate possible error
//         simulateRandomError();

//         // Get mock account
//         const account = getMockAccount();

//         return {
//           data: account,
//           error: null,
//         };
//       } catch (error) {
//         console.error('Account fetch error:', error);
//         return {
//           data: null,
//           error: error instanceof Error ? error.message : 'Unknown error occurred',
//         };
//       }
//     },
//   },

//   /**
//    * Recipients API
//    */
//   recipients: {
//     // Get all recipients
//     getRecipients: async (): Promise<ApiResponse<Recipient[]>> => {
//       try {
//         // Simulate API call delay
//         await delay(600);

//         // Simulate possible error
//         simulateRandomError();

//         return {
//           data: mockRecipients,
//           error: null,
//         };
//       } catch (error) {
//         console.error('Recipients fetch error:', error);
//         return {
//           data: null,
//           error: error instanceof Error ? error.message : 'Unknown error occurred',
//         };
//       }
//     },
//   },

//   /**
//    * Transfers API
//    */
//   transfers: {
//     // Get paginated transfers
//     getTransfers: async (
//       page: number = 0,
//       limit: number = 10
//     ): Promise<
//       ApiResponse<{
//         transfers: Transfer[];
//         pagination: TransferPaginationParams;
//       }>
//     > => {
//       try {
//         // Simulate API call delay
//         await delay(700);

//         // Simulate possible error
//         simulateRandomError();

//         const { transfers, hasMore } = getPaginatedTransfers(page, limit);

//         return {
//           data: {
//             transfers,
//             pagination: {
//               page,
//               limit,
//               hasMore,
//             },
//           },
//           error: null,
//         };
//       } catch (error) {
//         console.error('Transfers fetch error:', error);
//         return {
//           data: null,
//           error: error instanceof Error ? error.message : 'Unknown error occurred',
//         };
//       }
//     },

//     // Create a new transfer
//     createTransfer: async (request: NewTransferRequest): Promise<ApiResponse<Transfer>> => {
//       try {
//         // Simulate API call delay
//         await delay(1200);

//         // Simulate possible error
//         simulateRandomError(0.15); // Slightly higher error rate for transfers

//         // Create new transfer with ID and timestamp
//         const newTransfer = {
//           ...request,
//           id: `transfer-${Date.now()}`,
//           createdAt: new Date().toISOString(),
//         };

//         // Add to mock data
//         addTransfer(newTransfer);

//         return {
//           data: newTransfer,
//           error: null,
//         };
//       } catch (error) {
//         console.error('Transfer creation error:', error);
//         return {
//           data: null,
//           error: error instanceof Error ? error.message : 'Unknown error occurred',
//         };
//       }
//     },
//   },
// };
