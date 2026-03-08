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
    if (!isAdmin) {
      setActiveAccount(null);
      setActiveFund(null);
      setTransactions([]);
      return null;
    }

    const all = getBankAccounts();

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

  // User mode: professional offline screen
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
                INACTIVE
              </span>
            </div>
          </div>

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
                  OFFLINE
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
                <span className="text-sm text-green-400 font-semibold">
                  Live
                </span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-orange-400" />
                <span className="text-sm text-orange-400 font-semibold">
                  INACTIVE
                </span>
              </>
            )}
          </div>
        </div>

        {activeAccount ? (
          <div className="space-y-3">
            {/* Bank Info Bar - clean official style */}
            <div className="bg-card border border-green-500/30 rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 bg-green-500/5 border-b border-green-500/20">
                <div className="w-8 h-8 rounded-lg bg-green-500/15 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">
                    {activeAccount.bankName}
                  </p>
                  <p className="text-xs font-mono text-muted-foreground">
                    {activeAccount.accountNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {activeAccount.holderName}
                  </p>
                  <p className="text-xs font-mono text-muted-foreground/70">
                    {activeAccount.ifscCode}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 ml-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs font-bold text-green-400 uppercase tracking-widest">
                    {activeFund ? getFundLabel(activeFund) : "Live"}
                  </span>
                </div>
              </div>
            </div>

            {/* Transactions - Real bank passbook style */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {/* Statement header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-secondary/30">
                <div className="flex items-center gap-2">
                  <Wifi className="w-3.5 h-3.5 text-primary/70" />
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                    {activeAccount.bankName} — Live Statement
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${pulse ? "bg-green-300" : "bg-green-400 animate-pulse"}`}
                  />
                  <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">
                    Live
                  </span>
                </div>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Waiting for transactions...</p>
                </div>
              ) : (
                <div className="divide-y divide-border/30 max-h-[500px] overflow-y-auto">
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
                    // 12-digit UTR from txn.utr or generate display UTR from id
                    const utrDisplay = txn.utr
                      ? txn.utr
                      : txn.id.replace(/-/g, "").slice(0, 12).toUpperCase();

                    return (
                      <div
                        key={txn.id}
                        className={`px-4 py-3.5 hover:bg-secondary/20 transition-colors ${i === 0 ? "animate-slide-in" : ""}`}
                      >
                        <div className="flex items-center gap-3">
                          {/* CR/DR icon */}
                          <div
                            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                            ${isCredit ? "bg-emerald-500/10 border border-emerald-500/25" : "bg-red-500/10 border border-red-500/25"}`}
                          >
                            {isCredit ? (
                              <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <ArrowUpRight className="w-5 h-5 text-red-400" />
                            )}
                          </div>

                          {/* Transaction info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-widest border
                                ${isCredit ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-red-500/15 text-red-400 border-red-500/30"}`}
                              >
                                {isCredit ? "CR" : "DR"}
                              </span>
                              <p className="text-sm font-bold text-foreground">
                                {isCredit
                                  ? "Amount Credited"
                                  : "Amount Debited"}
                              </p>
                            </div>
                            <p className="text-[11px] font-mono text-muted-foreground/80 mt-1">
                              UTR: {utrDisplay}
                            </p>
                            <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                              {dateStr} · {timeStr}
                            </p>
                          </div>

                          {/* Amount */}
                          <div className="text-right flex-shrink-0">
                            <p
                              className={`text-base font-black tabular-nums ${isCredit ? "text-emerald-400" : "text-red-400"}`}
                            >
                              {isCredit ? "+" : "-"}
                              {formatCurrency(txn.amount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400/70" />
                <span className="text-xs font-semibold text-orange-400 uppercase tracking-wide">
                  INACTIVE
                </span>
              </div>
            </div>
            <div className="text-center py-16 text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">No Active Account</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Activate a fund account to begin recording transactions
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
