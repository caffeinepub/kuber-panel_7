import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FUND_CONFIG,
  formatCurrency,
  getBankAccounts,
  getSession,
} from "@/lib/storage";
import { ArrowDownToLine, Lock, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

interface MyCommissionProps {
  isActivated: boolean;
  onWithdraw: () => void;
}

type FundKey = "gaming" | "stock" | "political" | "mix";

export function MyCommission({ isActivated, onWithdraw }: MyCommissionProps) {
  const session = getSession();

  const [commissions, setCommissions] = useState<Record<FundKey, number>>({
    gaming: 0,
    stock: 0,
    political: 0,
    mix: 0,
  });

  useEffect(() => {
    if (!session || !isActivated) return;

    const accounts = getBankAccounts().filter(
      (a) => a.userId === session.userId && a.status === "approved",
    );

    // Initialize commissions based on approved accounts
    const initial: Record<FundKey, number> = {
      gaming: 0,
      stock: 0,
      political: 0,
      mix: 0,
    };

    for (const acc of accounts) {
      if (acc.fundType !== "general") {
        const fund = acc.fundType as FundKey;
        initial[fund] += Math.floor(Math.random() * 4500 + 500);
      }
    }

    // Add some defaults for demo purposes
    if (Object.values(initial).every((v) => v === 0)) {
      initial.gaming = Math.floor(Math.random() * 2000 + 800);
      initial.stock = Math.floor(Math.random() * 3000 + 1200);
      initial.political = Math.floor(Math.random() * 2500 + 900);
      initial.mix = Math.floor(Math.random() * 1500 + 600);
    }

    setCommissions(initial);

    // Incrementally update commissions
    const interval = setInterval(() => {
      setCommissions((prev) => {
        const updated = { ...prev };
        for (const k of Object.keys(updated) as FundKey[]) {
          updated[k] += Math.floor(Math.random() * 150);
        }
        return updated;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [session, isActivated]);

  const totalCommission = Object.values(commissions).reduce((a, b) => a + b, 0);

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
              Activate panel to view commissions
            </p>
          </div>
        </div>
      )}

      <div className={!isActivated ? "pointer-events-none opacity-50" : ""}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-foreground">
                My Commission
              </h2>
              <p className="text-muted-foreground text-sm">
                Real-time commission earnings
              </p>
            </div>
          </div>

          <Button
            onClick={onWithdraw}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2"
          >
            <ArrowDownToLine className="w-4 h-4" />
            Withdraw
          </Button>
        </div>

        {/* Total card */}
        <div className="bg-card border border-primary/30 rounded-xl p-6 card-glow relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5" />
          <div className="relative z-10">
            <p className="text-muted-foreground text-sm">
              Total Commission Earned
            </p>
            <p className="text-4xl font-display font-bold text-primary mt-1 tabular-nums">
              {formatCurrency(totalCommission)}
            </p>
            <p className="text-muted-foreground text-xs mt-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
              Live accumulating
            </p>
          </div>
        </div>

        {/* Per-fund table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden card-glow">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-base font-semibold text-foreground">
              Fund-wise Breakdown
            </h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">
                    Fund Name
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Fund %
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Commission
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(
                  Object.entries(FUND_CONFIG) as [
                    FundKey,
                    (typeof FUND_CONFIG)[FundKey],
                  ][]
                ).map(([key, config]) => (
                  <TableRow
                    key={key}
                    className="border-border hover:bg-secondary/50"
                  >
                    <TableCell className="font-medium text-foreground">
                      {config.label}
                    </TableCell>
                    <TableCell className="text-primary font-bold">
                      {config.percentage}%
                    </TableCell>
                    <TableCell className="font-semibold text-foreground tabular-nums">
                      {formatCurrency(commissions[key])}
                    </TableCell>
                    <TableCell>
                      <span className="status-approved inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-current inline-block animate-pulse" />
                        Active
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
