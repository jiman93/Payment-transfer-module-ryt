import { UUID } from '../types/models';

/**
 * Generates a random reference code
 */
export const generateReferenceCode = (): string => {
  return `REF${Math.floor(Math.random() * 1000000)}`;
};

/**
 * Generates a random account number
 */
export const generateAccountNumber = (): string => {
  return Math.floor(Math.random() * 9000000000 + 1000000000).toString();
};

/**
 * Generates a random ID with a prefix
 */
export const generateId = (prefix: string): UUID => {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};
