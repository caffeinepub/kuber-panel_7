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
  status: "pending" | "approved" | "rejected";
  bankName?: string;
  accountNumber?: string;
  holderName?: string;
  ifscCode?: string;
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

// ---- Keys ----
const KEYS = {
  USERS: "kuber_users",
  BANK_ACCOUNTS: "kuber_bankAccounts",
  ACTIVATION_CODES: "kuber_activationCodes",
  WITHDRAWALS: "kuber_withdrawals",
  LIVE_TRANSACTIONS: "kuber_liveTransactions",
  SUPPORT_LINK: "kuber_supportLink",
  SESSION: "kuber_session",
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

// ---- Admin constants ----
export const ADMIN_EMAIL = "Kuberpanel@gmail.com";
export const ADMIN_PASSWORD = "Admin@123";

// ---- Utility functions ----
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function generateActivationCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += "-";
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function generateTransactionId(): string {
  return `TXN${Date.now().toString().slice(-8)}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
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
