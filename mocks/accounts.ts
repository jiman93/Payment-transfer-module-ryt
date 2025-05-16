import { Account, Currency } from '../types/models';

/**
 * Creates mock accounts for a given user ID
 */
export const getMockAccounts = (userId: string): Account[] => [
  {
    id: 'acc-1',
    userId,
    accountNo: '1234567890',
    currency: 'MYR' as Currency,
    balanceCents: 250000, // RM 2,500.00
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acc-2',
    userId,
    accountNo: '0987654321',
    currency: 'USD' as Currency,
    balanceCents: 100000, // $1,000.00
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
