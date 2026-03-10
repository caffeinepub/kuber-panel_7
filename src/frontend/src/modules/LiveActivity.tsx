import {
  FUND_CONFIG,
  type LiveTransaction,
  formatCurrency,
  getBankAccounts,
  getLiveTransactions,
  getSession,
} from "@/lib/storage";
import { Activity, Lock, Wifi, WifiOff } from "lucide-react";
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

  // User mode — always OFFLINE
  if (!isAdmin) {
    return (
      <div className="relative space-y-4 animate-fade-in-up">
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
          {/* Page title */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary" />
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
            <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-full">
              <WifiOff className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
                OFFLINE
              </span>
            </div>
          </div>

          {/* Account Details Box — OFFLINE */}
          <div
            className="rounded-xl overflow-hidden border mb-3"
            style={{ borderColor: "#1a3050" }}
          >
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{
                background:
                  "linear-gradient(135deg, #07192e 0%, #0b2545 60%, #07192e 100%)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <span className="text-white font-black text-xs">₹</span>
                </div>
                <div>
                  <p className="text-xs font-black text-white/80 uppercase tracking-widest">
                    Account Statement
                  </p>
                  <p className="text-[10px] text-white/35 mt-0.5">
                    No Active Fund
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <WifiOff className="w-3 h-3 text-orange-400" />
                <span className="text-[10px] font-bold text-orange-300 uppercase tracking-widest">
                  OFFLINE
                </span>
              </div>
            </div>
            <div
              className="px-4 py-3 grid grid-cols-3 gap-3"
              style={{ background: "#0a1e35" }}
            >
              {["Account Holder", "Account No.", "IFSC Code"].map((label) => (
                <div key={label}>
                  <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1">
                    {label}
                  </p>
                  <p className="text-xs font-bold text-white/40">——</p>
                </div>
              ))}
            </div>
          </div>

          {/* Transactions box */}
          <div
            className="rounded-xl overflow-hidden border"
            style={{ borderColor: "#1a3050" }}
          >
            <div
              className="px-4 py-2.5 flex items-center justify-between"
              style={{
                background: "#0d2035",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                Live Fund Activity
              </span>
            </div>
            <div className="text-center py-14 bg-card">
              <Activity className="w-10 h-10 mx-auto mb-3 opacity-15" />
              <p className="text-sm text-muted-foreground font-medium">
                No Active Account
              </p>
              <p className="text-xs text-muted-foreground/50 mt-1">
                No fund activity available
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin mode — full live activity
  const isLive = !!activeAccount;

  return (
    <div className="relative space-y-4 animate-fade-in-up">
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
        {/* Page title */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Activity
                className={`w-5 h-5 text-primary transition-opacity ${
                  pulse ? "opacity-40" : "opacity-100"
                }`}
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
          {isLive ? (
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
              <Wifi className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs font-bold text-green-400 uppercase tracking-widest">
                LIVE
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-full">
              <WifiOff className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
                OFFLINE
              </span>
            </div>
          )}
        </div>

        {/* ─── ACCOUNT STATEMENT BOX (account details) ─── */}
        <div
          className="rounded-xl overflow-hidden border mb-4"
          style={{ borderColor: isLive ? "#1d4a2e" : "#1a3050" }}
        >
          {/* Header bar */}
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{
              background: isLive
                ? "linear-gradient(135deg, #061c10 0%, #0a2e18 60%, #061c10 100%)"
                : "linear-gradient(135deg, #07192e 0%, #0b2545 60%, #07192e 100%)",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: isLive
                    ? "rgba(52,211,153,0.12)"
                    : "rgba(255,255,255,0.07)",
                  border: isLive
                    ? "1px solid rgba(52,211,153,0.25)"
                    : "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <span
                  className="font-black text-sm"
                  style={{
                    color: isLive ? "#34d399" : "rgba(255,255,255,0.6)",
                  }}
                >
                  ₹
                </span>
              </div>
              <div>
                <p
                  className="text-xs font-black uppercase tracking-widest"
                  style={{
                    color: isLive ? "#86efac" : "rgba(255,255,255,0.7)",
                  }}
                >
                  Account Statement
                </p>
                <p
                  className="text-[10px] mt-0.5 uppercase tracking-wide font-semibold"
                  style={{
                    color: isLive
                      ? "rgba(134,239,172,0.5)"
                      : "rgba(255,255,255,0.3)",
                  }}
                >
                  {isLive && activeFund
                    ? getFundLabel(activeFund)
                    : "No Active Fund"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {isLive ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-green-300 uppercase tracking-widest">
                    LIVE
                  </span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-orange-400" />
                  <span className="text-[10px] font-bold text-orange-300 uppercase tracking-widest">
                    OFFLINE
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Account details grid */}
          <div
            className="px-4 py-3 grid gap-3"
            style={{
              background: isLive ? "#081a10" : "#0a1e35",
              gridTemplateColumns: "repeat(3,1fr)",
            }}
          >
            <div>
              <p
                className="text-[9px] uppercase tracking-widest mb-1"
                style={{
                  color: isLive
                    ? "rgba(134,239,172,0.35)"
                    : "rgba(255,255,255,0.3)",
                }}
              >
                Account Holder
              </p>
              <p
                className="text-xs font-bold"
                style={{ color: isLive ? "#d1fae5" : "rgba(255,255,255,0.4)" }}
              >
                {activeAccount?.holderName ?? "——"}
              </p>
            </div>
            <div>
              <p
                className="text-[9px] uppercase tracking-widest mb-1"
                style={{
                  color: isLive
                    ? "rgba(134,239,172,0.35)"
                    : "rgba(255,255,255,0.3)",
                }}
              >
                Account No.
              </p>
              <p
                className="text-xs font-mono font-bold"
                style={{ color: isLive ? "#d1fae5" : "rgba(255,255,255,0.4)" }}
              >
                {activeAccount?.accountNumber ?? "——"}
              </p>
            </div>
            <div>
              <p
                className="text-[9px] uppercase tracking-widest mb-1"
                style={{
                  color: isLive
                    ? "rgba(134,239,172,0.35)"
                    : "rgba(255,255,255,0.3)",
                }}
              >
                IFSC Code
              </p>
              <p
                className="text-xs font-mono font-bold"
                style={{ color: isLive ? "#d1fae5" : "rgba(255,255,255,0.4)" }}
              >
                {activeAccount?.ifscCode ?? "——"}
              </p>
            </div>
          </div>

          {/* Bank name footer strip */}
          {isLive && activeAccount && (
            <div
              className="px-4 py-2 flex items-center gap-2"
              style={{
                background: "#061510",
                borderTop: "1px solid rgba(52,211,153,0.1)",
              }}
            >
              <span
                className="text-[10px] font-black uppercase tracking-widest"
                style={{ color: "rgba(134,239,172,0.5)" }}
              >
                Bank:
              </span>
              <span
                className="text-[11px] font-black uppercase tracking-wider"
                style={{ color: "#86efac" }}
              >
                {activeAccount.bankName}
              </span>
            </div>
          )}
        </div>

        {/* ─── LIVE FUND ACTIVITY TRANSACTIONS BOX ─── */}
        <div
          className="rounded-xl overflow-hidden border"
          style={{ borderColor: isLive ? "#1d4a2e" : "#1a3050" }}
        >
          {/* Box header */}
          <div
            className="px-4 py-2.5 flex items-center justify-between"
            style={{
              background: isLive ? "#0a2518" : "#0d2035",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <span
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{
                color: isLive
                  ? "rgba(134,239,172,0.5)"
                  : "rgba(255,255,255,0.3)",
              }}
            >
              Live Fund Activity
            </span>
            {isLive && (
              <span
                className="text-[10px] font-semibold"
                style={{ color: "rgba(134,239,172,0.4)" }}
              >
                {transactions.length} transaction
                {transactions.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Transactions */}
          {!isLive ? (
            <div className="text-center py-14 bg-card">
              <Activity className="w-10 h-10 mx-auto mb-3 opacity-15" />
              <p className="text-sm text-muted-foreground font-medium">
                No Active Account
              </p>
              <p className="text-xs text-muted-foreground/50 mt-1">
                Turn ON a bank account in any Fund to start live transactions
              </p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-14 bg-card">
              <Activity className="w-10 h-10 mx-auto mb-3 opacity-15" />
              <p className="text-sm text-muted-foreground font-medium">
                Waiting for transactions...
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5 max-h-[560px] overflow-y-auto bg-card">
              {transactions.map((txn, i) => {
                const isCredit = txn.type === "credit";
                const rawUtr = txn.utr ?? txn.id.replace(/-/g, "").slice(0, 12);
                const utr12 = rawUtr
                  .replace(/[^0-9]/g, "")
                  .padStart(12, "0")
                  .slice(0, 12);

                return (
                  <div
                    key={txn.id}
                    className={`flex items-center gap-0 hover:bg-secondary/20 transition-colors ${
                      i === 0 ? "animate-slide-in" : ""
                    }`}
                    style={{
                      borderLeft: `4px solid ${
                        isCredit ? "#10b981" : "#ef4444"
                      }`,
                    }}
                  >
                    {/* Left: CR/DR badge + labels */}
                    <div className="flex-1 flex items-center gap-3 px-4 py-3.5 min-w-0">
                      {/* Badge */}
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 font-black text-xs tracking-widest"
                        style={{
                          background: isCredit
                            ? "rgba(16,185,129,0.12)"
                            : "rgba(239,68,68,0.12)",
                          border: `1px solid ${
                            isCredit
                              ? "rgba(16,185,129,0.3)"
                              : "rgba(239,68,68,0.3)"
                          }`,
                          color: isCredit ? "#34d399" : "#f87171",
                        }}
                      >
                        {isCredit ? "CR" : "DR"}
                      </div>

                      {/* Text */}
                      <div className="min-w-0">
                        <p
                          className="text-sm font-black uppercase tracking-wide"
                          style={{ color: isCredit ? "#34d399" : "#f87171" }}
                        >
                          {isCredit ? "AMOUNT CREDITED" : "AMOUNT DEBITED"}
                        </p>
                        <p
                          className="text-[11px] font-mono mt-0.5"
                          style={{
                            color: "rgba(255,255,255,0.35)",
                            letterSpacing: "0.1em",
                          }}
                        >
                          UTR {utr12}
                        </p>
                      </div>
                    </div>

                    {/* Right: Amount */}
                    <div className="pr-4 flex-shrink-0 text-right">
                      <p
                        className="text-base font-black tabular-nums"
                        style={{ color: isCredit ? "#34d399" : "#f87171" }}
                      >
                        {isCredit ? "+" : "-"}
                        {formatCurrency(txn.amount)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
