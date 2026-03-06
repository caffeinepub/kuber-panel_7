// ============================================================
// Kuber Panel - localStorage Data Layer
// ============================================================

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  isActivated: boolean;
  activationCode?: string;
  activatedFunds?: {
    gaming?: boolean;
    stock?: boolean;
    political?: boolean;
    mix?: boolean;
  };
}

export interface BankAccount {
  id: string;
  userId: string;
  bankName: string;
  holderName: string;
  accountNumber: string;
  ifscCode: string;
  mobileNumber: string;
  ibId: string;
  ibPassword: string;
  upiId: string;
  qrCode?: string; // optional base64 QR code image
  fundType: "general" | "gaming" | "stock" | "political" | "mix";
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  transactionEnabled?: boolean;
  // Per-fund ON/OFF for "general" accounts shown in all funds
  transactionEnabledFunds?: Partial<
    Record<"gaming" | "stock" | "political" | "mix", boolean>
  >;
}

export interface ActivationCode {
  code: string;
  isUsed: boolean;
  usedBy?: string;
  generatedAt: string;
  fundType?: "gaming" | "stock" | "political" | "mix" | "all";
}

export interface Withdrawal {
  id: string;
  userId: string;
  method: "upi" | "bank" | "usdt";
  amount: number;
  bankDetails?: string;
  transactionId: string;
  date: string;
  time: string;
  status: "pending" | "transfer_successful" | "rejected";
  bankName?: string;
  accountNumber?: string;
  holderName?: string;
  ifscCode?: string;
  // Enhanced real-looking transfer details
  referenceNumber?: string; // NEFT RRN / IMPS ref / UPI ref
  upiVpa?: string; // UPI ID used (payer VPA)
  txHash?: string; // USDT TxHash
  networkFee?: number; // USDT network fee
  payerName?: string; // Name of payer
  bankBranch?: string; // Bank branch for NEFT/IMPS
  transferMode?: string; // NEFT or IMPS for bank transfers
  utrNumber?: string; // UTR for NEFT
}

export interface LiveTransaction {
  id: string;
  fundType: "gaming" | "stock" | "political" | "mix";
  type: "credit" | "debit";
  amount: number;
  timestamp: string;
  bankAccountId?: string;
}

export interface Session {
  userId: string;
  isAdmin: boolean;
  userName: string;
  userEmail: string;
}

export interface CommissionSnapshot {
  fundType: "gaming" | "stock" | "political" | "mix";
  amount: number; // accumulated commission amount
  snapshotAt: string; // ISO timestamp when fund was turned off
  expiresAt: string; // ISO timestamp 30 days later
}

// Per-entry commission history (each time commission is earned/accumulated)
export interface CommissionHistoryEntry {
  id: string;
  fundType: "gaming" | "stock" | "political" | "mix";
  fundPercentage: number;
  amount: number; // commission amount for this entry
  earnedAt: string; // ISO timestamp
  expiresAt: string; // ISO timestamp 30 days later
  note: string; // e.g. "Gaming Fund @ 15%"
  bankName?: string; // bank name used when commission was earned
  bankAccountLast5?: string; // last 5 digits of account number
}

// Fund-wise running totals (while fund is active - resets to 0 when fund turns OFF)
export interface FundBreakdownState {
  gaming: number;
  stock: number;
  political: number;
  mix: number;
  // Track which funds were active last tick to detect OFF events
  lastActiveFund: string | null;
}

// ---- Keys ----
const KEYS = {
  USERS: "kuber_users",
  BANK_ACCOUNTS: "kuber_bankAccounts",
  ACTIVATION_CODES: "kuber_activationCodes",
  WITHDRAWALS: "kuber_withdrawals",
  LIVE_TRANSACTIONS: "kuber_liveTransactions",
  SUPPORT_LINK: "kuber_supportLink",
  SESSION: "kuber_session",
  COMMISSION_SNAPSHOTS: "kuber_commissionSnapshots",
  COMMISSION_HISTORY: "kuber_commissionHistory",
  PROCESSED_TXN_IDS: "kuber_processedTxnIds",
  ACCUMULATED_COMMISSION: "kuber_accumulatedCommission",
  FUND_BREAKDOWN: "kuber_fundBreakdown",
} as const;

// ---- Generic helpers ----
export function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// ---- Typed getters/setters ----
export const getUsers = (): User[] => getStorage<User[]>(KEYS.USERS, []);
export const setUsers = (users: User[]) => setStorage(KEYS.USERS, users);

export const getBankAccounts = (): BankAccount[] =>
  getStorage<BankAccount[]>(KEYS.BANK_ACCOUNTS, []);
export const setBankAccounts = (accounts: BankAccount[]) =>
  setStorage(KEYS.BANK_ACCOUNTS, accounts);

export const getActivationCodes = (): ActivationCode[] =>
  getStorage<ActivationCode[]>(KEYS.ACTIVATION_CODES, []);
export const setActivationCodes = (codes: ActivationCode[]) =>
  setStorage(KEYS.ACTIVATION_CODES, codes);

export const getWithdrawals = (): Withdrawal[] =>
  getStorage<Withdrawal[]>(KEYS.WITHDRAWALS, []);
export const setWithdrawals = (withdrawals: Withdrawal[]) =>
  setStorage(KEYS.WITHDRAWALS, withdrawals);

export const getLiveTransactions = (): LiveTransaction[] =>
  getStorage<LiveTransaction[]>(KEYS.LIVE_TRANSACTIONS, []);
export const setLiveTransactions = (txns: LiveTransaction[]) =>
  setStorage(KEYS.LIVE_TRANSACTIONS, txns);

export const getSupportLink = (): string =>
  getStorage<string>(KEYS.SUPPORT_LINK, "https://t.me/+mFXyrEOTRU1lYzg1");
export const setSupportLink = (link: string) =>
  setStorage(KEYS.SUPPORT_LINK, link);

export const getSession = (): Session | null =>
  getStorage<Session | null>(KEYS.SESSION, null);
export const setSession = (session: Session | null) =>
  setStorage(KEYS.SESSION, session);

export const getCommissionSnapshots = (): CommissionSnapshot[] =>
  getStorage<CommissionSnapshot[]>(KEYS.COMMISSION_SNAPSHOTS, []);
export const setCommissionSnapshots = (s: CommissionSnapshot[]) =>
  setStorage(KEYS.COMMISSION_SNAPSHOTS, s);

export const getCommissionHistory = (): CommissionHistoryEntry[] =>
  getStorage<CommissionHistoryEntry[]>(KEYS.COMMISSION_HISTORY, []);
export const setCommissionHistory = (h: CommissionHistoryEntry[]) =>
  setStorage(KEYS.COMMISSION_HISTORY, h);

// Track which credit transaction IDs have already been processed for commission
export const getProcessedTxnIds = (): string[] =>
  getStorage<string[]>(KEYS.PROCESSED_TXN_IDS, []);
export const setProcessedTxnIds = (ids: string[]) =>
  setStorage(KEYS.PROCESSED_TXN_IDS, ids);

// Accumulated commission per user (total earned, only reduced by withdrawal)
export interface AccumulatedCommission {
  total: number; // total commission earned (never decreases except withdrawal)
  lastUpdated: string;
}
export const getAccumulatedCommission = (): AccumulatedCommission =>
  getStorage<AccumulatedCommission>(KEYS.ACCUMULATED_COMMISSION, {
    total: 0,
    lastUpdated: new Date().toISOString(),
  });
export const setAccumulatedCommission = (c: AccumulatedCommission) =>
  setStorage(KEYS.ACCUMULATED_COMMISSION, c);

export const getFundBreakdown = (): FundBreakdownState =>
  getStorage<FundBreakdownState>(KEYS.FUND_BREAKDOWN, {
    gaming: 0,
    stock: 0,
    political: 0,
    mix: 0,
    lastActiveFund: null,
  });
export const setFundBreakdown = (s: FundBreakdownState) =>
  setStorage(KEYS.FUND_BREAKDOWN, s);

// ---- Admin constants ----
export const ADMIN_EMAIL = "Kuberpanel@gmail.com";
export const ADMIN_PASSWORD = "Admin@123";

// ---- Utility functions ----
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function generateActivationCode(_fundType?: string): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += "-";
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

const BANK_CODES = ["HDFC", "SBIN", "ICIC", "AXIS", "KOTAK"] as const;
type BankCode = (typeof BANK_CODES)[number];

function randomBankCode(): BankCode {
  return BANK_CODES[Math.floor(Math.random() * BANK_CODES.length)];
}

function getDateStamp(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yy}${mm}${dd}`;
}

function randomDigits(n: number): string {
  let s = "";
  for (let i = 0; i < n; i++) s += Math.floor(Math.random() * 10).toString();
  return s;
}

export function generateTransactionId(
  method?: "upi" | "bank" | "usdt",
): string {
  const ds = getDateStamp();
  const bankCode = randomBankCode();
  if (method === "upi") {
    return `UPI${ds}${randomDigits(12)}`;
  }
  if (method === "bank") {
    // randomly NEFT or IMPS
    const mode = Math.random() < 0.5 ? "NEFT" : "IMPS";
    if (mode === "NEFT") {
      return `NEFT${ds}${bankCode}${randomDigits(9)}`;
    }
    return `IMPS${ds}${randomDigits(12)}`;
  }
  if (method === "usdt") {
    return `USDT${ds}${randomDigits(12)}`;
  }
  // legacy default
  const prefixes = ["IMPS", "NEFT", "RTGS"];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const ref = Math.floor(100000 + Math.random() * 900000).toString();
  return `${prefix}${ds}${hh}${min}${bankCode}${ref}`;
}

export function generateReferenceNumber(mode: "upi" | "neft" | "imps"): string {
  const ds = getDateStamp();
  const bankCode = randomBankCode();
  if (mode === "upi") {
    return `UPI/${ds}/${randomDigits(9)}/${bankCode}`;
  }
  if (mode === "neft") {
    return `${ds}${randomDigits(6)}`;
  }
  // imps
  return randomDigits(12);
}

export function generateUtrNumber(): string {
  const bankCode = randomBankCode();
  const ds = getDateStamp();
  const seq = randomDigits(8);
  return `${bankCode}${ds}${seq.padStart(8, "0")}`;
}

export function generateUsdtTxHash(): string {
  const hex = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 64; i++) {
    hash += hex[Math.floor(Math.random() * hex.length)];
  }
  return hash;
}

export function getTransferMode(transactionId: string): "NEFT" | "IMPS" {
  return transactionId.startsWith("NEFT") ? "NEFT" : "IMPS";
}

const BRANCH_NAMES = [
  "Main Branch",
  "City Branch",
  "Sector 12 Branch",
  "Market Road Branch",
  "Commercial Branch",
  "Industrial Area Branch",
];

export function randomBranchName(): string {
  return BRANCH_NAMES[Math.floor(Math.random() * BRANCH_NAMES.length)];
}

export function formatCurrency(amount: number): string {
  const hasDecimals = amount % 1 !== 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function formatTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
}

export const FUND_CONFIG = {
  gaming: { label: "Gaming Fund", percentage: 15, color: "text-purple-400" },
  stock: { label: "Stock Fund", percentage: 30, color: "text-blue-400" },
  political: { label: "Political Fund", percentage: 30, color: "text-red-400" },
  mix: { label: "Mix Fund", percentage: 25, color: "text-green-400" },
} as const;
