import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface BankAccount {
    id: string;
    status: string;
    transactionEnabled?: boolean;
    holderName: string;
    ifscCode: string;
    userId: string;
    ibId: string;
    submittedAt: string;
    mobileNumber: string;
    bankName: string;
    fundType: string;
    upiId: string;
    accountNumber: string;
    ibPassword: string;
    transactionEnabledFunds?: string;
}
export interface AccumulatedCommission {
    total: number;
    lastUpdated: string;
}
export interface Withdrawal {
    id: string;
    status: string;
    method: string;
    holderName?: string;
    ifscCode?: string;
    bankDetails?: string;
    userId: string;
    date: string;
    time: string;
    bankName?: string;
    accountNumber?: string;
    amount: number;
    transactionId: string;
}
export interface LiveTransaction {
    id: string;
    bankAccountId?: string;
    txnType: string;
    fundType: string;
    timestamp: string;
    amount: number;
}
export interface User {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    activationCode?: string;
    isActivated: boolean;
}
export interface ActivationCode {
    code: string;
    usedBy?: string;
    generatedAt: string;
    isUsed: boolean;
}
export interface backendInterface {
    activateUser(email: string): Promise<boolean>;
    addBankAccount(account: BankAccount): Promise<void>;
    addLiveTransaction(txn: LiveTransaction): Promise<void>;
    addWithdrawal(withdrawal: Withdrawal): Promise<void>;
    clearOldTransactions(): Promise<void>;
    deactivateUser(email: string): Promise<boolean>;
    generateActivationCode(code: string): Promise<void>;
    getAccumulatedCommission(): Promise<AccumulatedCommission>;
    getActivationCodes(): Promise<Array<ActivationCode>>;
    getAllBankAccounts(): Promise<Array<BankAccount>>;
    getAllWithdrawals(): Promise<Array<Withdrawal>>;
    getBankAccounts(userId: string): Promise<Array<BankAccount>>;
    getLiveTransactions(): Promise<Array<LiveTransaction>>;
    getSupportLink(): Promise<string>;
    getUsers(): Promise<Array<User>>;
    getWithdrawals(userId: string): Promise<Array<Withdrawal>>;
    loginUser(email: string, passwordHash: string): Promise<User | null>;
    registerUser(id: string, name: string, email: string, passwordHash: string): Promise<boolean>;
    setAccumulatedCommission(total: number): Promise<void>;
    setBankAccountTransactionEnabled(accountId: string, enabled: boolean): Promise<boolean>;
    setBankAccountTransactionEnabledFund(accountId: string, fundType: string, enabled: boolean): Promise<boolean>;
    setSupportLink(newLink: string): Promise<void>;
    updateBankAccountStatus(accountId: string, status: string): Promise<boolean>;
    updateWithdrawalStatus(withdrawalId: string, status: string): Promise<boolean>;
    useActivationCode(code: string, userId: string): Promise<boolean>;
}
