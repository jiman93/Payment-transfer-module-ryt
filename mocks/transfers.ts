import {
  UUID,
  Transfer,
  TransactionType,
  Recipient,
  BankRecipient,
  MobileRecipient,
} from '../types/models';
import { MALAYSIAN_BANKS } from './bankData';

// Helper function to generate a random UUID with a prefix
const generateId = (prefix: string): UUID => {
  return `${prefix}-${Math.random().toString(36).substring(2, 10)}`;
};

// Helper function to generate a random amount in cents (between 10 and 10,000 MYR)
const randomAmount = (): number => {
  return Math.floor(Math.random() * 1000000) + 1000; // 10 MYR to 10,000 MYR in cents
};

// Helper function to generate a random date in the past (up to 45 days ago)
const randomDate = (): string => {
  const daysAgo = Math.floor(Math.random() * 45) + 1;
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

// Helper function to pick a random transaction type
const randomTransactionType = (): TransactionType => {
  const types: TransactionType[] = ['Fund Transfer', 'Credit Card Payment', 'Loan Payment'];
  return types[Math.floor(Math.random() * types.length)];
};

// Helper function to generate a random reference number
const randomReference = (): string => {
  return `REF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
};

// Sample recipient names
const names = [
  'John Smith',
  'Sarah Johnson',
  'Michael Tan',
  'Lisa Wong',
  'David Chen',
  'Amanda Lee',
  'James Lim',
  'Maria Garcia',
  'Robert Ng',
  'Emma Wilson',
  'William Taylor',
  'Sophia Ali',
  'Daniel Lee',
  'Olivia Chen',
  'Ethan Wong',
  'Isabella Tan',
  'Alexander Lim',
  'Mia Abdullah',
  'Benjamin Kumar',
  'Charlotte Yeo',
];

// Generate mock bank recipients
const generateBankRecipients = (): BankRecipient[] => {
  return names.slice(0, 12).map((name, index) => ({
    id: generateId('bank-recipient'),
    type: 'BANK',
    name,
    accountNo: `${1000000000 + index}`,
    bankCode: MALAYSIAN_BANKS[index % MALAYSIAN_BANKS.length].substring(0, 2).toUpperCase(),
  }));
};

// Generate mock mobile recipients
const generateMobileRecipients = (): MobileRecipient[] => {
  return names.slice(12).map((name, index) => ({
    id: generateId('mobile-recipient'),
    type: 'MOBILE',
    name,
    mobileNumber: `+601${2 + index}${Math.floor(1000000 + Math.random() * 9000000)}`,
  }));
};

// Generate all recipients
export const mockRecipients: Recipient[] = [
  ...generateBankRecipients(),
  ...generateMobileRecipients(),
];

// Generate 20 mock transfers with our recipients
export const mockTransfers: Transfer[] = Array.from({ length: 20 }, (_, i) => {
  const recipient = mockRecipients[i % mockRecipients.length];

  return {
    id: generateId('transfer'),
    recipient,
    transactionType: randomTransactionType(),
    amountCents: randomAmount(),
    reference: randomReference(),
    note: Math.random() > 0.5 ? `Payment for ${recipient.name}` : undefined,
    createdAt: randomDate(),
  };
}).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sort by date, newest first

/**
 * Get paginated transfers
 */
export const getPaginatedTransfers = (
  page: number = 0,
  limit: number = 10
): {
  transfers: Transfer[];
  hasMore: boolean;
} => {
  const start = page * limit;
  const end = start + limit;
  const paginatedTransfers = mockTransfers.slice(start, end);

  return {
    transfers: paginatedTransfers,
    hasMore: end < mockTransfers.length,
  };
};

/**
 * Add a new transfer to the transfer history
 */
export const addTransfer = (transfer: Transfer): Transfer[] => {
  mockTransfers.unshift({
    ...transfer,
    id: generateId('transfer'),
    createdAt: new Date().toISOString(),
  });
  return [...mockTransfers];
};
