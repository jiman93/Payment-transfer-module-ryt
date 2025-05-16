/**
 * Error codes that can be returned by the mock API
 */
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

/**
 * Error response structure
 */
export interface ErrorResponse {
  code: ErrorCode | string;
  message: string;
  details?: any;
}

/**
 * Map error codes to user-friendly messages
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  // Network errors
  [ErrorCode.NETWORK_ERROR]:
    'Network connection failed. Please check your internet connection and try again.',
  [ErrorCode.TIMEOUT_ERROR]: 'Request timed out. Please try again later.',

  // Authentication errors
  [ErrorCode.INVALID_CREDENTIALS]: 'Invalid credentials provided. Please check and try again.',
  [ErrorCode.USER_NOT_FOUND]: 'User not found. Please check your login details.',
  [ErrorCode.SESSION_EXPIRED]: 'Your session has expired. Please log in again.',
  [ErrorCode.UNAUTHORIZED]: 'You are not authorized to perform this action.',

  // Account errors
  [ErrorCode.ACCOUNT_NOT_FOUND]: 'Account not found. Please check the account details.',
  [ErrorCode.INVALID_ACCOUNT_FORMAT]: 'Invalid account number format. Please check and try again.',
  [ErrorCode.ACCOUNT_LOCKED]: 'This account is currently locked. Please contact customer support.',

  // Bank errors
  [ErrorCode.INVALID_BANK_CODE]: 'Invalid bank code. Please select a valid bank.',
  [ErrorCode.BANK_NOT_SUPPORTED]: 'This bank is not currently supported for transfers.',

  // Transfer errors
  [ErrorCode.INVALID_AMOUNT]: 'Invalid transfer amount. Please enter a valid amount.',
  [ErrorCode.INSUFFICIENT_FUNDS]: 'Insufficient funds in your account to complete this transfer.',
  [ErrorCode.TRANSFER_LIMIT_EXCEEDED]: 'This transfer exceeds your daily transfer limit.',
  [ErrorCode.INVALID_RECIPIENT]: 'Invalid recipient details. Please check and try again.',
  [ErrorCode.TRANSFER_NOT_FOUND]: 'Transfer not found. Please check the transfer details.',
  [ErrorCode.TRANSFER_NOT_CANCELLABLE]:
    'This transfer cannot be cancelled as it is already being processed.',
  [ErrorCode.NETWORK_VALIDATION_FAILED]:
    'Network validation failed for this transfer. Please try again later.',

  // General errors
  [ErrorCode.INVALID_REQUEST]: 'Invalid request. Please check your input and try again.',
  [ErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again later.',
};

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  code: ErrorCode | string;
  details?: any;

  constructor(errorResponse: ErrorResponse) {
    super(errorResponse.message);
    this.name = 'ApiError';
    this.code = errorResponse.code;
    this.details = errorResponse.details;
  }
}

/**
 * Handle API errors with consistent formatting
 */
export const handleApiError = (error: any): ErrorResponse => {
  // If it's already an ErrorResponse, return it
  if (error && error.code && error.message) {
    return error as ErrorResponse;
  }

  // If it's an ApiError, format it
  if (error instanceof ApiError) {
    return {
      code: error.code,
      message: error.message,
      details: error.details,
    };
  }

  // If it's a network error (from fetch API)
  if (error instanceof TypeError && error.message.includes('network')) {
    return {
      code: ErrorCode.NETWORK_ERROR,
      message: ERROR_MESSAGES[ErrorCode.NETWORK_ERROR],
    };
  }

  // Default unknown error
  return {
    code: ErrorCode.UNKNOWN_ERROR,
    message: ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR],
  };
};

/**
 * Get a user-friendly error message from an error code
 */
export const getErrorMessage = (code: ErrorCode | string): string => {
  if (code in ErrorCode) {
    return ERROR_MESSAGES[code as ErrorCode];
  }
  return ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR];
};

/**
 * Format error for displaying to user
 */
export const formatErrorForDisplay = (error: any): { title: string; message: string } => {
  const errorResponse = handleApiError(error);

  let title = 'Error';

  // Customize title based on error category
  if (errorResponse.code.includes('NETWORK')) {
    title = 'Network Error';
  } else if (
    errorResponse.code.includes('AUTH') ||
    errorResponse.code.includes('CREDENTIAL') ||
    errorResponse.code.includes('SESSION')
  ) {
    title = 'Authentication Error';
  } else if (errorResponse.code.includes('ACCOUNT')) {
    title = 'Account Error';
  } else if (errorResponse.code.includes('TRANSFER')) {
    title = 'Transfer Error';
  } else if (errorResponse.code.includes('BANK')) {
    title = 'Bank Error';
  }

  return {
    title,
    message: errorResponse.message,
  };
};
