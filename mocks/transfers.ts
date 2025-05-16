import { UUID, Transfer, Channel, TransferStatus } from '../types/models';
import { generateId } from './utils';

/**
 * Interface for recent transfer display data
 */
export interface RecentTransfer {
  id: UUID;
  recipientName: string;
  recipientIdentifier: string; // Account number or phone number
  recipientType: 'BANK' | 'MOBILE';
  bankName?: string;
  amountCents: number;
  date: string;
  status: TransferStatus;
}

/**
 * Generate initial mock recent transfers
 */
export const generateMockRecentTransfers = (userId?: string): RecentTransfer[] => {
  return [
    {
      id: generateId('transfer'),
      recipientName: 'John Smith',
      recipientIdentifier: '1234567890',
      recipientType: 'BANK',
      bankName: 'Maybank',
      amountCents: 5000000, // RM 50,000.00
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
      status: TransferStatus.SUCCESS,
    },
    {
      id: generateId('transfer'),
      recipientName: 'Sarah Johnson',
      recipientIdentifier: '2345678901',
      recipientType: 'BANK',
      bankName: 'CIMB Bank',
      amountCents: 150000, // RM 1,500.00
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
      status: TransferStatus.SUCCESS,
    },
    {
      id: generateId('transfer'),
      recipientName: 'Michael Tan',
      recipientIdentifier: '+60123456789',
      recipientType: 'MOBILE',
      amountCents: 80000, // RM 800.00
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
      status: TransferStatus.SUCCESS,
    },
    {
      id: generateId('transfer'),
      recipientName: 'Lisa Wong',
      recipientIdentifier: '3456789012',
      recipientType: 'BANK',
      bankName: 'Public Bank',
      amountCents: 300000, // RM 3,000.00
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days ago
      status: TransferStatus.SUCCESS,
    },
    {
      id: generateId('transfer'),
      recipientName: 'David Chen',
      recipientIdentifier: '+60198765432',
      recipientType: 'MOBILE',
      amountCents: 50000, // RM 500.00
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(), // 14 days ago
      status: TransferStatus.SUCCESS,
    },
    {
      id: generateId('transfer'),
      recipientName: 'Amanda Lee',
      recipientIdentifier: '4567890123',
      recipientType: 'BANK',
      bankName: 'Hong Leong Bank',
      amountCents: 1200000, // RM 12,000.00
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(), // 18 days ago
      status: TransferStatus.SUCCESS,
    },
    {
      id: generateId('transfer'),
      recipientName: 'James Lim',
      recipientIdentifier: '5678901234',
      recipientType: 'BANK',
      bankName: 'RHB Bank',
      amountCents: 75000, // RM 750.00
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21).toISOString(), // 21 days ago
      status: TransferStatus.SUCCESS,
    },
    {
      id: generateId('transfer'),
      recipientName: 'Maria Garcia',
      recipientIdentifier: '+60187654321',
      recipientType: 'MOBILE',
      amountCents: 40000, // RM 400.00
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(), // 25 days ago
      status: TransferStatus.SUCCESS,
    },
    {
      id: generateId('transfer'),
      recipientName: 'Robert Ng',
      recipientIdentifier: '6789012345',
      recipientType: 'BANK',
      bankName: 'Maybank',
      amountCents: 900000, // RM 9,000.00
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28).toISOString(), // 28 days ago
      status: TransferStatus.SUCCESS,
    },
    {
      id: generateId('transfer'),
      recipientName: 'Emma Wilson',
      recipientIdentifier: '7890123456',
      recipientType: 'BANK',
      bankName: 'CIMB Bank',
      amountCents: 250000, // RM 2,500.00
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days ago
      status: TransferStatus.SUCCESS,
    },
  ];
};

// Store recent transfers in memory
let recentTransfers: RecentTransfer[] = generateMockRecentTransfers();

/**
 * Get recent transfers
 */
export const getRecentTransfers = (): RecentTransfer[] => {
  return [...recentTransfers];
};

/**
 * Add a new transfer to recent transfers
 */
export const addRecentTransfer = (transfer: RecentTransfer): RecentTransfer[] => {
  recentTransfers = [transfer, ...recentTransfers];
  return [...recentTransfers];
};

/**
 * Create a recent transfer from transfer data
 */
export const createRecentTransfer = (
  transfer: Transfer,
  recipientName: string,
  recipientIdentifier: string,
  recipientType: 'BANK' | 'MOBILE',
  bankName?: string
): RecentTransfer => {
  return {
    id: transfer.id,
    recipientName,
    recipientIdentifier,
    recipientType,
    bankName,
    amountCents: transfer.amountCents,
    date: new Date().toISOString(),
    status: transfer.status,
  };
};

/**
 * Interface for creating a mock transfer directly
 */
export interface CreateTransferParams {
  recipientName: string;
  accountNumber: string;
  amount: number;
  recipientBank: string;
  date: Date;
  channel: Channel;
}

/**
 * Create a mock transfer and add it to recent transfers
 */
export const createMockTransfer = (params: CreateTransferParams): RecentTransfer => {
  const { recipientName, accountNumber, amount, recipientBank, date, channel } = params;

  const newTransfer: RecentTransfer = {
    id: generateId('transfer'),
    recipientName,
    recipientIdentifier: accountNumber,
    recipientType: channel === Channel.BANK_ACCOUNT ? 'BANK' : 'MOBILE',
    bankName: channel === Channel.BANK_ACCOUNT ? recipientBank : undefined,
    amountCents: Math.round(amount * 100), // Convert to cents
    date: date.toISOString(),
    status: TransferStatus.SUCCESS,
  };

  // Add to recent transfers
  recentTransfers = [newTransfer, ...recentTransfers];

  return newTransfer;
};
