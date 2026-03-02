import {
  FUND_CONFIG,
  formatCurrency,
  getLiveTransactions,
  getWithdrawals,
} from "@/lib/storage";
import { TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

type FundKey = "gaming" | "stock" | "political" | "mix";

export function AdminCommission() {
  const [commissions, setCommissions] = useState<Record<FundKey, number>>({
    gaming: 0,
    stock: 0,
    political: 0,
    mix: 0,
  });
  const [totalDebit, setTotalDebit] = useState(0);

  useEffect(() => {
    const calculateCommissions = () => {
      const txns = getLiveTransactions();
      const calc: Record<FundKey, number> = {
        gaming: 0,
        stock: 0,
        political: 0,
        mix: 0,
      };
      for (const txn of txns) {
        if (txn.type === "credit") {
          const fund = txn.fundType as FundKey;
          const pct = FUND_CONFIG[fund]?.percentage ?? 0;
          calc[fund] += (txn.amount * pct) / 100;
        }
      }
      return calc;
    };

    const tick = () => {
      setCommissions(calculateCommissions());
      const adminWithdrawals = getWithdrawals().filter(
        (w) => w.userId === "admin" && w.status === "transfer_successful",
      );
      const debit = adminWithdrawals.reduce((sum, w) => sum + w.amount, 0);
      setTotalDebit(debit);
    };

    tick();
    const interval = setInterval(tick, 1500);
    return () => clearInterval(interval);
  }, []);

  const total = Object.values(commissions).reduce((a, b) => a + b, 0);
  const displayTotal = Math.max(0, total - totalDebit);

  const fundColors: Record<FundKey, string> = {
    gaming: "from-purple-500/20 to-purple-500/5",
    stock: "from-blue-500/20 to-blue-500/5",
    political: "from-red-500/20 to-red-500/5",
    mix: "from-green-500/20 to-green-500/5",
  };

  const fundBorderColors: Record<FundKey, string> = {
    gaming: "border-purple-500/30",
    stock: "border-blue-500/30",
    political: "border-red-500/30",
    mix: "border-green-500/30",
  };

  const fundTextColors: Record<FundKey, string> = {
    gaming: "text-purple-400",
    stock: "text-blue-400",
    political: "text-red-400",
    mix: "text-green-400",
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-foreground">
              My Fund Commission
            </h2>
            <p className="text-muted-foreground text-sm">
              Live accumulating commission from all funds
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm text-green-400 font-medium">Live</span>
        </div>
      </div>

      {/* Total */}
      <div className="bg-card border border-primary/30 rounded-xl p-6 card-glow relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
        <div className="relative z-10">
          <p className="text-muted-foreground text-sm">
            Total Commission (All Funds)
          </p>
          <p className="text-5xl font-display font-bold text-primary mt-2 tabular-nums">
            {formatCurrency(displayTotal)}
          </p>
          <p className="text-muted-foreground text-xs mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
            Live accumulating from fund transactions
          </p>
          {totalDebit > 0 && (
            <p className="text-red-400 text-xs mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
              {formatCurrency(totalDebit)} withdrawn (deducted)
            </p>
          )}
        </div>
      </div>

      {/* Per-fund cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(
          Object.entries(FUND_CONFIG) as [
            FundKey,
            (typeof FUND_CONFIG)[FundKey],
          ][]
        ).map(([key, config]) => (
          <div
            key={key}
            className={`bg-gradient-to-br ${fundColors[key]} border ${fundBorderColors[key]} rounded-xl p-5 relative overflow-hidden`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {config.label}
                </p>
                <p className={`text-xs font-bold ${fundTextColors[key]}`}>
                  {config.percentage}% Commission
                </p>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse mt-1" />
            </div>
            <p
              className={`text-2xl font-display font-bold tabular-nums ${fundTextColors[key]}`}
            >
              {formatCurrency(commissions[key])}
            </p>
            <div className="mt-2">
              <div className="h-1 bg-black/20 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${(commissions[key] / total) * 100}%`,
                    background: "currentColor",
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {((commissions[key] / total) * 100).toFixed(1)}% of total
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
