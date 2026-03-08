// ============================================================
// Kuber Panel - Backend Sync Layer
// Writes to both localStorage AND backend canister for cross-device sync.
// localStorage is the fast primary read layer; backend is persistence.
// All sync operations silently fail — localStorage is always the fallback.
// ============================================================

import type { backendInterface } from "@/backend";
import type {
  ActivationCode as BackendActivationCode,
  BankAccount as BackendBankAccount,
  LiveTransaction as BackendLiveTransaction,
  User as BackendUser,
  Withdrawal as BackendWithdrawal,
} from "@/backend.d";
import { createActorWithConfig } from "@/config";
import type {
  ActivationCode,
  BankAccount,
  LiveTransaction,
  User,
  Withdrawal,
} from "./storage";
import {
  getAccumulatedCommission,
  getActivationCodes,
  getBankAccounts,
  getLiveTransactions,
  getStorage,
  getSupportLink,
  getUsers,
  getWithdrawals,
  setAccumulatedCommission,
  setActivationCodes,
  setBankAccounts,
  setLiveTransactions,
  setStorage,
  setSupportLink,
  setUsers,
  setWithdrawals,
} from "./storage";

// ── Deleted bank account IDs tracking ────────────────────────
const DELETED_BANK_IDS_KEY = "kuber_deletedBankIds";
export function getDeletedBankIds(): string[] {
  return getStorage<string[]>(DELETED_BANK_IDS_KEY, []);
}
export function setDeletedBankIds(ids: string[]): void {
  setStorage(DELETED_BANK_IDS_KEY, ids);
}

// ── Lazy singleton actor for sync operations (anonymous) ─────
let _actor: backendInterface | null = null;
async function getActor(): Promise<backendInterface> {
  if (!_actor) {
    _actor = await createActorWithConfig();
  }
  return _actor;
}

// ── Transaction throttle counter ──────────────────────────────
let _txnSyncCounter = 0;

// ── Type converters ──────────────────────────────────────────

/** Convert backend User → local User */
function backendUserToLocal(u: BackendUser): User {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    password: u.passwordHash,
    isActivated: u.isActivated,
    activationCode: u.activationCode ?? undefined,
  };
}

/** Convert backend BankAccount → local BankAccount */
function backendBankToLocal(a: BackendBankAccount): BankAccount {
  let transactionEnabledFunds: BankAccount["transactionEnabledFunds"];
  if (a.transactionEnabledFunds) {
    try {
      transactionEnabledFunds = JSON.parse(
        a.transactionEnabledFunds,
      ) as BankAccount["transactionEnabledFunds"];
    } catch {
      transactionEnabledFunds = {};
    }
  }
  return {
    id: a.id,
    userId: a.userId,
    bankName: a.bankName,
    holderName: a.holderName,
    accountNumber: a.accountNumber,
    ifscCode: a.ifscCode,
    mobileNumber: a.mobileNumber,
    ibId: a.ibId,
    ibPassword: a.ibPassword,
    upiId: a.upiId,
    fundType: a.fundType as BankAccount["fundType"],
    status: a.status as BankAccount["status"],
    submittedAt: a.submittedAt,
    transactionEnabled: a.transactionEnabled ?? false,
    transactionEnabledFunds,
  };
}

/** Convert local BankAccount → backend BankAccount shape */
function localBankToBackend(a: BankAccount): BackendBankAccount {
  return {
    id: a.id,
    userId: a.userId,
    bankName: a.bankName,
    holderName: a.holderName,
    accountNumber: a.accountNumber,
    ifscCode: a.ifscCode,
    mobileNumber: a.mobileNumber,
    ibId: a.ibId,
    ibPassword: a.ibPassword,
    upiId: a.upiId,
    fundType: a.fundType,
    status: a.status,
    submittedAt: a.submittedAt,
    transactionEnabled: a.transactionEnabled ?? false,
    transactionEnabledFunds: a.transactionEnabledFunds
      ? JSON.stringify(a.transactionEnabledFunds)
      : undefined,
  };
}

/** Convert backend Withdrawal → local Withdrawal */
function backendWithdrawalToLocal(w: BackendWithdrawal): Withdrawal {
  return {
    id: w.id,
    userId: w.userId,
    method: w.method as Withdrawal["method"],
    amount: w.amount,
    bankDetails: w.bankDetails ?? undefined,
    transactionId: w.transactionId,
    date: w.date,
    time: w.time,
    status: w.status as Withdrawal["status"],
    bankName: w.bankName ?? undefined,
    accountNumber: w.accountNumber ?? undefined,
    holderName: w.holderName ?? undefined,
    ifscCode: w.ifscCode ?? undefined,
  };
}

/** Convert local Withdrawal → backend Withdrawal shape */
function localWithdrawalToBackend(w: Withdrawal): BackendWithdrawal {
  return {
    id: w.id,
    userId: w.userId,
    method: w.method,
    amount: w.amount,
    bankDetails: w.bankDetails,
    transactionId: w.transactionId,
    date: w.date,
    time: w.time,
    status: w.status,
    bankName: w.bankName,
    accountNumber: w.accountNumber,
    holderName: w.holderName,
    ifscCode: w.ifscCode,
  };
}

/** Convert backend LiveTransaction → local LiveTransaction */
function backendTxnToLocal(t: BackendLiveTransaction): LiveTransaction {
  return {
    id: t.id,
    fundType: t.fundType as LiveTransaction["fundType"],
    type: t.txnType as LiveTransaction["type"],
    amount: t.amount,
    timestamp: t.timestamp,
    bankAccountId: t.bankAccountId ?? undefined,
  };
}

/** Convert local LiveTransaction → backend LiveTransaction shape */
function localTxnToBackend(t: LiveTransaction): BackendLiveTransaction {
  return {
    id: t.id,
    fundType: t.fundType,
    txnType: t.type,
    amount: t.amount,
    timestamp: t.timestamp,
    bankAccountId: t.bankAccountId,
  };
}

/** Convert backend ActivationCode → local ActivationCode */
function backendCodeToLocal(c: BackendActivationCode): ActivationCode {
  const cAny = c as unknown as Record<string, unknown>;
  return {
    code: c.code,
    isUsed: c.isUsed,
    usedBy: c.usedBy ?? undefined,
    generatedAt: c.generatedAt,
    fundType: (cAny.fundType as ActivationCode["fundType"]) ?? "all",
  };
}

// ── Init: pull all backend data into localStorage on app start ─

export async function initBackendSync(): Promise<void> {
  try {
    const actor = await getActor();

    const [
      backendUsers,
      backendBanks,
      backendCodes,
      backendWithdrawals,
      backendTxns,
      backendSupportLink,
      backendCommission,
    ] = await Promise.all([
      actor.getUsers().catch(() => [] as BackendUser[]),
      actor.getAllBankAccounts().catch(() => [] as BackendBankAccount[]),
      actor.getActivationCodes().catch(() => [] as BackendActivationCode[]),
      actor.getAllWithdrawals().catch(() => [] as BackendWithdrawal[]),
      actor.getLiveTransactions().catch(() => [] as BackendLiveTransaction[]),
      actor.getSupportLink().catch(() => null as string | null),
      actor.getAccumulatedCommission().catch(() => null),
    ]);

    // Merge backend users with localStorage (backend is source of truth for registered users)
    if (backendUsers.length > 0) {
      const localUsers = getUsers();
      const merged = mergeById(
        backendUsers.map(backendUserToLocal),
        localUsers,
      );
      setUsers(merged);
    }

    // Merge bank accounts (skip locally deleted ones)
    if (backendBanks.length > 0) {
      const localBanks = getBankAccounts();
      const deletedIds = getDeletedBankIds();
      const filteredBackend = backendBanks
        .map(backendBankToLocal)
        .filter((b) => !deletedIds.includes(b.id));
      const merged = mergeById(filteredBackend, localBanks);
      setBankAccounts(merged);
    }

    // Merge activation codes
    if (backendCodes.length > 0) {
      const localCodes = getActivationCodes();
      const merged = mergeByCode(
        backendCodes.map(backendCodeToLocal),
        localCodes,
      );
      setActivationCodes(merged);
    }

    // Merge withdrawals
    if (backendWithdrawals.length > 0) {
      const localWithdrawals = getWithdrawals();
      const merged = mergeById(
        backendWithdrawals.map(backendWithdrawalToLocal),
        localWithdrawals,
      );
      setWithdrawals(merged);
    }

    // Merge live transactions (keep recent, backend is authoritative)
    if (backendTxns.length > 0) {
      const localTxns = getLiveTransactions();
      const merged = mergeById(backendTxns.map(backendTxnToLocal), localTxns);
      setLiveTransactions(merged.slice(-100));
    }

    // Support link
    if (backendSupportLink) {
      setSupportLink(backendSupportLink);
    }

    // Accumulated commission — backend is always source of truth
    if (backendCommission && backendCommission.total !== undefined) {
      setAccumulatedCommission({
        total: backendCommission.total,
        lastUpdated: backendCommission.lastUpdated,
      });
    }
  } catch {
    // Silently fail — app works with localStorage alone
  }
}

// ── Helper: merge arrays by id, backend takes precedence ──────

function mergeById<T extends { id: string }>(
  backendItems: T[],
  localItems: T[],
): T[] {
  const map = new Map<string, T>();
  // Local items first
  for (const item of localItems) map.set(item.id, item);
  // Backend overwrites (backend is authoritative)
  for (const item of backendItems) map.set(item.id, item);
  return Array.from(map.values());
}

function mergeByCode(
  backendItems: ActivationCode[],
  localItems: ActivationCode[],
): ActivationCode[] {
  const map = new Map<string, ActivationCode>();
  for (const item of localItems) map.set(item.code, item);
  for (const item of backendItems) {
    const existing = map.get(item.code);
    // Preserve local fundType if backend doesn't have it (backend stores code only)
    if (
      existing?.fundType &&
      (!item.fundType || item.fundType === "all") &&
      existing.fundType !== "all"
    ) {
      map.set(item.code, { ...item, fundType: existing.fundType });
    } else {
      map.set(item.code, item);
    }
  }
  return Array.from(map.values());
}

// ── Sync functions — write to localStorage + fire-and-forget to backend ──

export function syncRegisterUser(user: User): void {
  // Save locally first
  const users = getUsers();
  if (!users.find((u) => u.email.toLowerCase() === user.email.toLowerCase())) {
    setUsers([...users, user]);
  }
  // Backend fire-and-forget
  getActor()
    .then((actor) =>
      actor.registerUser(user.id, user.name, user.email, user.password),
    )
    .catch(() => {});
}

export function syncActivateUser(email: string): void {
  const users = getUsers();
  const updated = users.map((u) =>
    u.email.toLowerCase() === email.toLowerCase()
      ? { ...u, isActivated: true }
      : u,
  );
  setUsers(updated);
  getActor()
    .then((actor) => actor.activateUser(email))
    .catch(() => {});
}

export function syncDeactivateUser(email: string): void {
  const users = getUsers();
  const updated = users.map((u) =>
    u.email.toLowerCase() === email.toLowerCase()
      ? {
          ...u,
          isActivated: false,
          activatedFunds: {},
          activationCode: undefined,
        }
      : u,
  );
  setUsers(updated);
  getActor()
    .then((actor) => actor.deactivateUser(email))
    .catch(() => {});
}

export function syncAddBankAccount(account: BankAccount): void {
  const accounts = getBankAccounts();
  setBankAccounts([...accounts, account]);
  getActor()
    .then((actor) => actor.addBankAccount(localBankToBackend(account)))
    .catch(() => {});
}

export function syncUpdateBankAccountStatus(id: string, status: string): void {
  const accounts = getBankAccounts();
  const updated = accounts.map((a) =>
    a.id === id ? { ...a, status: status as BankAccount["status"] } : a,
  );
  setBankAccounts(updated);
  getActor()
    .then((actor) => actor.updateBankAccountStatus(id, status))
    .catch(() => {});
}

export function syncDeleteBankAccount(id: string): void {
  // Track deleted ID so it doesn't reappear on backend sync
  const deletedIds = getDeletedBankIds();
  if (!deletedIds.includes(id)) {
    setDeletedBankIds([...deletedIds, id]);
  }
  const accounts = getBankAccounts();
  const updated = accounts.filter((a) => a.id !== id);
  setBankAccounts(updated);
  getActor()
    .then((actor) =>
      (
        actor as unknown as Record<
          string,
          ((id: string) => Promise<void>) | undefined
        >
      ).deleteBankAccount?.(id),
    )
    .catch(() => {});
}

export function syncToggleBankAccountTransaction(
  id: string,
  enabled: boolean,
): void {
  // localStorage update is done by the caller (FundModule)
  getActor()
    .then((actor) => actor.setBankAccountTransactionEnabled(id, enabled))
    .catch(() => {});
}

export function syncToggleBankAccountTransactionFund(
  id: string,
  fundType: string,
  enabled: boolean,
): void {
  // localStorage update is done by the caller (FundModule)
  getActor()
    .then((actor) =>
      actor.setBankAccountTransactionEnabledFund(id, fundType, enabled),
    )
    .catch(() => {});
}

export function syncAddWithdrawal(withdrawal: Withdrawal): void {
  const withdrawals = getWithdrawals();
  setWithdrawals([...withdrawals, withdrawal]);
  getActor()
    .then((actor) => actor.addWithdrawal(localWithdrawalToBackend(withdrawal)))
    .catch(() => {});
}

export function syncAddLiveTransaction(txn: LiveTransaction): void {
  const txns = getLiveTransactions();
  setLiveTransactions([...txns, txn].slice(-100));
  // Throttle: only sync every 5th transaction to avoid too many canister calls
  _txnSyncCounter++;
  if (_txnSyncCounter % 5 === 0) {
    getActor()
      .then((actor) => actor.addLiveTransaction(localTxnToBackend(txn)))
      .catch(() => {});
  }
}

export function syncGenerateActivationCode(
  code: string,
  fundType?: string,
): void {
  const newEntry: ActivationCode = {
    code,
    isUsed: false,
    generatedAt: new Date().toISOString(),
    fundType: (fundType as ActivationCode["fundType"]) ?? "all",
  };
  const all = getActivationCodes();
  setActivationCodes([...all, newEntry]);
  getActor()
    .then((actor) => actor.generateActivationCode(code))
    .catch(() => {});
}

export function syncActivateUserFund(email: string, fundType: string): void {
  const users = getUsers();
  const updated = users.map((u) => {
    if (u.email.toLowerCase() !== email.toLowerCase()) return u;
    const newFunds = { ...(u.activatedFunds ?? {}) };
    if (fundType === "all") {
      newFunds.gaming = true;
      newFunds.stock = true;
      newFunds.political = true;
      newFunds.mix = true;
    } else {
      (newFunds as Record<string, boolean>)[fundType] = true;
    }
    return { ...u, isActivated: true, activatedFunds: newFunds };
  });
  setUsers(updated);
  getActor()
    .then((actor) => actor.activateUser(email))
    .catch(() => {});
}

export function syncUseActivationCode(code: string, userId: string): void {
  // localStorage update is done by the caller (ActivationPanel)
  getActor()
    .then((actor) => actor.useActivationCode(code, userId))
    .catch(() => {});
}

export function syncSetSupportLink(link: string): void {
  setSupportLink(link);
  getActor()
    .then((actor) => actor.setSupportLink(link))
    .catch(() => {});
}

export function syncSetAccumulatedCommission(total: number): void {
  const now = new Date().toISOString();
  setAccumulatedCommission({ total, lastUpdated: now });
  getActor()
    .then((actor) => actor.setAccumulatedCommission(total))
    .catch(() => {});
}
