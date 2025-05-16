export type UUID = string;
export type Currency = 'MYR'; // one currency for demo
export type TransactionType = 'Fund Transfer' | 'Credit Card Payment' | 'Loan Payment';
export type BiometricsType = 'FaceID' | 'TouchID' | 'Fingerprint' | 'None';

/* ── 1. Auth flag ───────────────────────────────────────── */
export interface AuthState {
  isAuthenticated: boolean; // true after biometrics or PIN
  biometricsType: BiometricsType; // type of biometrics enabled by user
}

/* ── 2. Account ─────────────────────────────────────────── */
export interface Account {
  id: UUID;
  balanceCents: number;
  currency: Currency; // always 'MYR' here
}

/* ── 3. Recipients (bank OR mobile) ─────────────────────── */
export type Recipient = BankRecipient | MobileRecipient;

export interface BankRecipient {
  id: UUID;
  type: 'BANK'; // discriminator
  name: string;
  accountNo: string; // "1234567890"
  bankCode: string; // "MB" etc.
}

export interface MobileRecipient {
  id: UUID;
  type: 'MOBILE'; // discriminator
  name: string;
  mobileNumber: string; // "+60123456789"
}

/* ── 4. Transfers ───────────────────────────────────────── */
export interface Transfer {
  id: UUID;
  recipient: Recipient;
  transactionType: TransactionType;
  amountCents: number;
  reference: string;
  note?: string;
  createdAt: string; // ISO-8601
}

/* ── 5. DTOs for API/mocks ──────────────────────────────── */
export type NewTransferRequest = Omit<Transfer, 'id' | 'createdAt'>;
export type NewTransferResponse = Transfer;

export interface TransferPaginationParams {
  page: number;
  limit: number;
  hasMore: boolean;
}

/* ── 6. In-memory store shape (Zustand) ─────────────────── */
export interface StoreState {
  auth: AuthState;
  account: Account | null;
  recipients: Recipient[];
  transfers: Transfer[];
  transfersPagination: TransferPaginationParams;

  /* Actions */
  authenticate: () => Promise<void>; // biometrics or PIN
  fetchAccount: () => Promise<void>;
  newTransfer: (req: NewTransferRequest) => Promise<void>;
  fetchRecentTransfers: (page?: number, limit?: number) => Promise<void>; // for infinite scrolling
}
