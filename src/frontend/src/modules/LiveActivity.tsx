import {
  FUND_CONFIG,
  type LiveTransaction,
  formatCurrency,
  getBankAccounts,
  getLiveTransactions,
  getSession,
} from "@/lib/storage";
import { Activity, Lock, Power } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface LiveActivityProps {
  isActivated: boolean;
}

type FundKey = "gaming" | "stock" | "political" | "mix";

export function LiveActivity({ isActivated }: LiveActivityProps) {
  const session = getSession();
  const [transactions, setTransactions] = useState<LiveTransaction[]>([]);
  const [pulse, setPulse] = useState(false);
  const [activeAccount, setActiveAccount] = useState<
    ReturnType<typeof getBankAccounts>[0] | null
  >(null);
  const [activeFund, setActiveFund] = useState<FundKey | null>(null);

  const refreshActiveAccount = useCallback(() => {
    const all = getBankAccounts();

    // Check fund-specific accounts (non-general) with transactionEnabled = true
    const fundSpecific = all.find(
      (a) =>
        a.userId === session?.userId &&
        a.status === "approved" &&
        a.transactionEnabled === true &&
        a.fundType !== "general",
    );
    if (fundSpecific) {
      setActiveAccount(fundSpecific);
      setActiveFund(fundSpecific.fundType as FundKey);
      return { account: fundSpecific, fund: fundSpecific.fundType as FundKey };
    }

    // Check general accounts with transactionEnabledFunds
    const funds: FundKey[] = ["gaming", "stock", "political", "mix"];
    for (const fund of funds) {
      const generalActive = all.find(
        (a) =>
          a.userId === session?.userId &&
          a.status === "approved" &&
          a.fundType === "general" &&
          a.transactionEnabledFunds?.[fund] === true,
      );
      if (generalActive) {
        setActiveAccount(generalActive);
        setActiveFund(fund);
        return { account: generalActive, fund };
      }
    }

    setActiveAccount(null);
    setActiveFund(null);
    return null;
  }, [session?.userId]);

  const fetchTransactions = useCallback(() => {
    const result = refreshActiveAccount();
    const all = getLiveTransactions();

    if (result) {
      const filtered = all.filter((t) => t.fundType === result.fund).reverse();
      setTransactions(filtered);
    } else {
      setTransactions([]);
    }
  }, [refreshActiveAccount]);

  useEffect(() => {
    if (!isActivated) return;
    fetchTransactions();
    const interval = setInterval(() => {
      fetchTransactions();
      setPulse(true);
      setTimeout(() => setPulse(false), 500);
    }, 1500);
    return () => clearInterval(interval);
  }, [isActivated, fetchTransactions]);

  const getFundLabel = (type: FundKey) => FUND_CONFIG[type]?.label ?? type;

  return (
    <div className="relative space-y-6 animate-fade-in-up">
      {!isActivated && (
        <div className="absolute inset-0 z-20 lock-overlay rounded-xl flex flex-col items-center justify-center gap-4">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-card border-2 border-border flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-lg font-display font-bold text-foreground mb-2">
              Locked
            </h3>
            <p className="text-muted-foreground text-sm">
              Activate panel to see live activity
            </p>
          </div>
        </div>
      )}

      <div className={!isActivated ? "pointer-events-none opacity-50" : ""}>
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Activity
                className={`w-5 h-5 text-primary transition-opacity ${pulse ? "opacity-50" : "opacity-100"}`}
              />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-foreground">
                Live Fund Activity
              </h2>
              <p className="text-muted-foreground text-sm">
                Real-time fund transactions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeAccount ? (
              <>
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm text-green-400 font-medium">Live</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                <span className="text-sm text-muted-foreground font-medium">
                  Inactive
                </span>
              </>
            )}
          </div>
        </div>

        {/* Active Bank Account Info */}
        {activeAccount ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Bank Details */}
              <div className="bg-card border border-green-500/40 rounded-xl p-4 sm:col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <Power className="w-4 h-4 text-green-400" />
                  <p className="text-xs text-green-400 font-semibold uppercase tracking-wide">
                    Active Bank Account
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs">
                      Bank Name
                    </span>
                    <p className="font-semibold text-foreground">
                      {activeAccount.bankName}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">
                      Account No.
                    </span>
                    <p className="font-mono text-foreground">
                      ••••{activeAccount.accountNumber.slice(-4)}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">
                      Holder Name
                    </span>
                    <p className="font-semibold text-foreground">
                      {activeAccount.holderName}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">
                      IFSC Code
                    </span>
                    <p className="font-mono text-foreground">
                      {activeAccount.ifscCode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Fund & Status */}
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">
                  Running Fund
                </p>
                <p className="font-bold text-primary text-base">
                  {activeFund ? getFundLabel(activeFund) : ""}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="font-semibold text-green-400 text-sm">
                    Transaction ON
                  </span>
                </div>
              </div>
            </div>

            {/* Transactions */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {transactions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Waiting for transactions...</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {transactions.map((txn, i) => (
                    <div
                      key={txn.id}
                      className={`flex items-center justify-between px-4 py-3 hover:bg-secondary/20 transition-colors ${i === 0 ? "animate-slide-in" : ""}`}
                    >
                      {/* Left: Icon + Fund + Time */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                          ${txn.type === "credit" ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}
                        >
                          {txn.type === "credit" ? "C" : "D"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {txn.type === "credit"
                              ? "Amount Credited"
                              : "Amount Debited"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {getFundLabel(txn.fundType as FundKey)} &middot;{" "}
                            {new Date(txn.timestamp).toLocaleTimeString(
                              "en-IN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                                hour12: true,
                              },
                            )}
                          </p>
                        </div>
                      </div>
                      {/* Right: Amount */}
                      <div className="text-right flex-shrink-0 ml-3">
                        <p
                          className={`font-bold tabular-nums text-sm ${txn.type === "credit" ? "text-green-400" : "text-red-400"}`}
                        >
                          {txn.type === "credit" ? "+" : "-"}
                          {formatCurrency(txn.amount)}
                        </p>
                        <p
                          className={`text-xs font-medium mt-0.5 ${txn.type === "credit" ? "text-green-500/70" : "text-red-500/70"}`}
                        >
                          {txn.type === "credit" ? "CREDITED" : "DEBITED"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Koi active fund account nahi mila</p>
          </div>
        )}
      </div>
    </div>
  );
}
