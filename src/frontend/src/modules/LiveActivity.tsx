import {
  FUND_CONFIG,
  type LiveTransaction,
  formatCurrency,
  getBankAccounts,
  getLiveTransactions,
  getSession,
} from "@/lib/storage";
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  Lock,
  Power,
  Wifi,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface LiveActivityProps {
  isActivated: boolean;
  isAdmin?: boolean;
}

type FundKey = "gaming" | "stock" | "political" | "mix";

export function LiveActivity({
  isActivated,
  isAdmin = false,
}: LiveActivityProps) {
  const session = getSession();
  const [transactions, setTransactions] = useState<LiveTransaction[]>([]);
  const [pulse, setPulse] = useState(false);
  const [activeAccount, setActiveAccount] = useState<
    ReturnType<typeof getBankAccounts>[0] | null
  >(null);
  const [activeFund, setActiveFund] = useState<FundKey | null>(null);

  const refreshActiveAccount = useCallback(() => {
    // User ID me koi transaction nahi dikhega - sirf admin ke liye
    if (!isAdmin) {
      setActiveAccount(null);
      setActiveFund(null);
      setTransactions([]);
      return null;
    }

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
  }, [session?.userId, isAdmin]);

  const fetchTransactions = useCallback(() => {
    const result = refreshActiveAccount();
    if (!isAdmin) {
      setTransactions([]);
      return;
    }
    const all = getLiveTransactions();

    if (result) {
      const filtered = all.filter((t) => t.fundType === result.fund).reverse();
      setTransactions(filtered);
    } else {
      setTransactions([]);
    }
  }, [refreshActiveAccount, isAdmin]);

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

  // User mode: show professional "no active account" screen (no hint about admin)
  if (!isAdmin) {
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
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary opacity-100" />
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
              <span className="w-2 h-2 rounded-full bg-muted-foreground" />
              <span className="text-sm text-muted-foreground font-medium">
                Inactive
              </span>
            </div>
          </div>

          {/* Official bank statement style container */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    Account Statement
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    No Active Fund
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Offline
                </span>
              </div>
            </div>
            <div className="text-center py-16 text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">No Active Account</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Transactions will appear here when a fund is active
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin mode: full live activity
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
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
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
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                <span className="text-sm text-yellow-400 font-medium">
                  Ready
                </span>
              </>
            )}
          </div>
        </div>

        {/* Active Bank Account Info */}
        {activeAccount ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Bank Details - Official style */}
              <div className="bg-card border border-green-500/40 rounded-xl p-4 sm:col-span-2">
                <div className="flex items-center gap-2 mb-3">
                  <Power className="w-4 h-4 text-green-400" />
                  <p className="text-xs text-green-400 font-semibold uppercase tracking-widest">
                    Active Bank Account
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs uppercase tracking-wide">
                      Bank Name
                    </span>
                    <p className="font-bold text-foreground mt-0.5">
                      {activeAccount.bankName}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs uppercase tracking-wide">
                      Account No.
                    </span>
                    <p className="font-mono font-bold text-foreground mt-0.5 tracking-widest">
                      {activeAccount.accountNumber}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs uppercase tracking-wide">
                      Holder Name
                    </span>
                    <p className="font-bold text-foreground mt-0.5">
                      {activeAccount.holderName}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs uppercase tracking-wide">
                      IFSC Code
                    </span>
                    <p className="font-mono font-bold text-foreground mt-0.5 tracking-widest">
                      {activeAccount.ifscCode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Fund & Status */}
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Running Fund
                </p>
                <p className="font-bold text-primary text-base mt-1">
                  {activeFund ? getFundLabel(activeFund) : ""}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="font-semibold text-green-400 text-sm">
                    Transaction ON
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-border/60">
                  <div className="flex items-center gap-1.5">
                    <Wifi className="w-3 h-3 text-primary/60" />
                    <span className="text-[10px] text-muted-foreground/60 uppercase tracking-widest">
                      Live Feed · 1.5s
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Transactions - Official Bank Statement Style */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {/* Header bar - real bank statement style */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-primary/20 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Account Statement
                    </p>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      {activeAccount?.bankName} &nbsp;·&nbsp;{" "}
                      {activeAccount?.accountNumber}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${pulse ? "bg-green-300" : "bg-green-400 animate-pulse"}`}
                  />
                  <span className="text-xs font-bold text-green-400 uppercase tracking-widest">
                    Live
                  </span>
                </div>
              </div>

              {/* Column headers */}
              <div className="grid grid-cols-[auto_1fr_auto] gap-2 px-4 py-2 bg-secondary/20 border-b border-border/40">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest w-8">
                  Type
                </span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Description / Reference
                </span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">
                  Amount
                </span>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Waiting for transactions...</p>
                </div>
              ) : (
                <div className="divide-y divide-border/40 max-h-[440px] overflow-y-auto">
                  {transactions.map((txn, i) => {
                    const isCredit = txn.type === "credit";
                    const txnTime = new Date(txn.timestamp);
                    const timeStr = txnTime.toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true,
                    });
                    const dateStr = txnTime.toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    });
                    const refNum = txn.id
                      .toUpperCase()
                      .replace(/-/g, "")
                      .slice(0, 16);
                    return (
                      <div
                        key={txn.id}
                        className={`px-4 py-3 hover:bg-secondary/20 transition-colors ${i === 0 ? "animate-slide-in" : ""}`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Left: Type icon */}
                          <div
                            className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center mt-0.5
                            ${isCredit ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-red-500/10 border border-red-500/30"}`}
                          >
                            {isCredit ? (
                              <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4 text-red-400" />
                            )}
                          </div>

                          {/* Middle: Transaction details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest border
                                ${isCredit ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-red-500/15 text-red-400 border-red-500/30"}`}
                              >
                                {isCredit ? "CR" : "DR"}
                              </span>
                              <p className="text-xs font-bold text-foreground">
                                {isCredit
                                  ? "Amount Credited"
                                  : "Amount Debited"}
                              </p>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {getFundLabel(txn.fundType as FundKey)}{" "}
                              &nbsp;|&nbsp; {dateStr} &nbsp;{timeStr}
                            </p>
                            <p className="text-[10px] text-muted-foreground/50 font-mono mt-0.5 tracking-wide">
                              Ref No: {refNum}
                            </p>
                          </div>

                          {/* Right: Amount */}
                          <div className="text-right flex-shrink-0 min-w-[80px]">
                            <p
                              className={`text-sm font-black tabular-nums ${isCredit ? "text-emerald-400" : "text-red-400"}`}
                            >
                              {isCredit ? "+" : "-"}
                              {formatCurrency(txn.amount)}
                            </p>
                            <p
                              className={`text-[10px] font-semibold mt-0.5 uppercase tracking-wide ${isCredit ? "text-emerald-500/70" : "text-red-500/70"}`}
                            >
                              {isCredit ? "Received" : "Sent"}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Footer */}
              {transactions.length > 0 && (
                <div className="px-4 py-2.5 border-t border-border/40 bg-secondary/20 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground/60 uppercase tracking-widest">
                    {transactions.length} Transaction
                    {transactions.length !== 1 ? "s" : ""}
                  </span>
                  <span className="text-[10px] text-muted-foreground/60 uppercase tracking-widest">
                    Auto-refreshing every 1.5s
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    Account Statement
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    No Active Fund
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400/70 animate-pulse" />
                <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wide">
                  Ready
                </span>
              </div>
            </div>
            <div className="text-center py-16 text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">Waiting for Active Fund</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Turn ON a fund from any Fund module to start live transactions
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
