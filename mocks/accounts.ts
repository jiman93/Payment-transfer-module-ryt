import { Account } from '../types/models';

/**
 * Creates mock account
 */
export const getMockAccount = (): Account => ({
  id: 'acc-1',
  balanceCents: 250000, // RM 2,500.00
  currency: 'MYR',
});
