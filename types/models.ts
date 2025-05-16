// ---------------- shared value objects ------------------
export type UUID = string;
export type Currency = 'MYR' | 'USD' | 'EUR';

export enum TransferStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export type FailReason = 'INSUFFICIENT_FUNDS' | 'NETWORK_ERROR' | 'AUTH_FAILED' | 'UNKNOWN';

// ---------------- recipient / channel -------------------

export enum Channel {
  BANK_ACCOUNT = 'BANK_ACCOUNT', // accountNo + bankCode
  MOBILE_NUMBER = 'MOBILE_NUMBER', // MSISDN (+ provider tag if you like)
}

/**
 * A single "recipient handle" the user can pick in the UI.
 * Only the fields relevant to its channel are populated.
 */
export interface Recipient {
  id: UUID;
  userId: UUID; // owner
  channel: Channel;
  name?: string; // optional for ad-hoc mobile top-ups

  // —— BANK_ACCOUNT channel ——
  accountNo?: string; // "1234567890"
  bankCode?: string; // "MB" = Maybank

  // —— MOBILE_NUMBER channel ——
  mobileNumber?: string; // E.164 e.g. "+60123456789"
  provider?: string; // "Boost", "TNG", etc. (if relevant)

  avatarUrl?: string;
  createdAt: string;
}

// ---------------- core entities -------------------------

export interface Account {
  id: UUID;
  userId: UUID;
  iban?: string;
  accountNo?: string;
  currency: Currency;
  balanceCents: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transfer {
  id: UUID;
  accountId: UUID; // debit source
  channel: Channel; // BANK_ACCOUNT or MOBILE_NUMBER
  recipientId?: UUID; // null when ad-hoc mobile top-up
  amountCents: number;
  note?: string;
  status: TransferStatus;
  failReason?: FailReason;
  referenceCode?: string;
  initiatedAt: string;
  completedAt?: string;
}

// ---------------- biometrics / auth ---------------------

export type AuthMethod = 'FACE_ID' | 'TOUCH_ID' | 'PIN';

export interface AuthEvent {
  id: UUID;
  transferId: UUID;
  userId: UUID;
  method: AuthMethod;
  success: boolean;
  errorCode?: string;
  createdAt: string;
}

// ---------------- DTOs for the mobile app ---------------

// outbound request from RN app → API
export interface TransferRequestDto {
  accountId: UUID;
  channel: Channel;

  // For saved handles (both channels)
  recipientId?: UUID;

  // For ad-hoc BANK_ACCOUNT
  accountNo?: string;
  bankCode?: string;

  // For ad-hoc MOBILE_NUMBER
  mobileNumber?: string;
  provider?: string;

  amountCents: number;
  note?: string;
}

// API response on create / poll
export interface TransferResponseDto {
  id: UUID;
  status: TransferStatus;
  referenceCode?: string;
  failReason?: FailReason;
}

// For Recent Transfers stretch feature
export interface RecentTransferDto {
  id: UUID;
  channel: Channel;
  label: string; // display "Maybank •••7890" or "+6012•••"
  currency: Currency;
  amountCents: number;
  executedAt: string;
}
