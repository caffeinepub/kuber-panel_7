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

  const refreshActiveAccount = useCallback(() => {
    // Find the bank account that has transactionEnabled = true and is approved (for any fund type, not general)
    const all = getBankAccounts();
    const active =
      all.find(
        (a) =>
          a.userId === session?.userId &&
          a.status === "approved" &&
          a.transactionEnabled === true &&
          a.fundType !== "general",
      ) ?? null;
    setActiveAccount(active);
    return active;
  }, [session?.userId]);

  const fetchTransactions = useCallback(() => {
    const active = refreshActiveAccount();
    const all = getLiveTransactions();

    if (active) {
      // Show only transactions for the active fund type
      const filtered = all
        .filter((t) => t.fundType === active.fundType)
        .slice(-100)
        .reverse();
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
              <p className="text-xs text-muted-foreground mb-1">Running Fund</p>
              <p className="font-bold text-primary text-base">
                {getFundLabel(activeAccount.fundType as FundKey)}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                <span className="font-semibold text-green-400 text-sm">
                  Transaction ON
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <Power className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="font-semibold text-foreground mb-1">
              No Active Transaction
            </p>
            <p className="text-sm text-muted-foreground">
              Kisi bhi Fund module mein jaao, approved bank account ke saamne
              "Transaction ON" karo
            </p>
          </div>
        )}

        {/* Transaction Feed */}
        <div className="bg-card border border-border rounded-xl overflow-hidden card-glow">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Transaction on Bank Account
              </h3>
              {activeAccount && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {getFundLabel(activeAccount.fundType as FundKey)} - Live
                  transactions
                </p>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {activeAccount
                ? `Showing ${transactions.length} transactions`
                : "No active account"}
            </span>
          </div>

          <div className="max-h-[500px] overflow-y-auto">
            {!activeAccount ? (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Transaction ON karo kisi fund mein...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Waiting for transactions...</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {transactions.map((txn, i) => (
                  <div
                    key={txn.id}
                    className={`flex items-center justify-between px-6 py-3 hover:bg-secondary/30 transition-colors ${i === 0 ? "animate-slide-in" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                          txn.type === "credit" ? "credit-badge" : "debit-badge"
                        }`}
                      >
                        {txn.type === "credit" ? "↑" : "↓"}{" "}
                        {txn.type.toUpperCase()}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {getFundLabel(txn.fundType as FundKey)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(txn.timestamp).toLocaleTimeString("en-IN")}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-bold tabular-nums text-sm ${
                        txn.type === "credit"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {txn.type === "credit" ? "+" : "-"}
                      {formatCurrency(txn.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
