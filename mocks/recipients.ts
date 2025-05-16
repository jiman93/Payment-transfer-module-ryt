import { Recipient, Channel } from '../types/models';

/**
 * Creates mock recipients for a given user ID
 */
export const getMockRecipients = (userId: string): Recipient[] => [
  {
    id: 'rec-1',
    userId,
    channel: Channel.BANK_ACCOUNT,
    name: 'John Doe',
    accountNo: '1234567890',
    bankCode: 'MB',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rec-2',
    userId,
    channel: Channel.MOBILE_NUMBER,
    name: 'Jane Smith',
    mobileNumber: '+60123456789',
    provider: 'Boost',
    createdAt: new Date().toISOString(),
  },
];
