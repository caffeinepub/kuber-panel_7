import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  type CommissionHistoryEntry,
  FUND_CONFIG,
  formatCurrency,
  getAccumulatedCommission,
  getBankAccounts,
  getCommissionHistory,
  getFundBreakdown,
  getLiveTransactions,
  getProcessedTxnIds,
  getSession,
  setAccumulatedCommission,
  setCommissionHistory,
  setFundBreakdown,
  setProcessedTxnIds,
} from "@/lib/storage";
import { ArrowDownToLine, Clock, Lock, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

interface MyCommissionProps {
  isActivated: boolean;
  onWithdraw: () => void;
  viewOnly?: boolean;
}

type FundKey = "gaming" | "stock" | "political" | "mix";

function getActiveFund(userId: string): FundKey | null {
  const all = getBankAccounts();
  const fundSpecific = all.find(
    (a) =>
      a.userId === userId &&
      a.status === "approved" &&
      a.transactionEnabled === true &&
      a.fundType !== "general",
  );
  if (fundSpecific) return fundSpecific.fundType as FundKey;

  const funds: FundKey[] = ["gaming", "stock", "political", "mix"];
  for (const fund of funds) {
    const g = all.find(
      (a) =>
        a.userId === userId &&
        a.status === "approved" &&
        a.fundType === "general" &&
        a.transactionEnabledFunds?.[fund] === true,
    );
    if (g) return fund;
  }
  return null;
}

function formatDateTime(iso: string): { date: string; time: string } {
  try {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      time: d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  } catch {
    return { date: "—", time: "—" };
  }
}

export function MyCommission({
  isActivated,
  onWithdraw,
  viewOnly = false,
}: MyCommissionProps) {
  const session = getSession();

  const [activeFund, setActiveFund] = useState<FundKey | null>(null);
  const [totalCommission, setTotalCommission] = useState(0);
  const [commissionHistory, setCommissionHistoryState] = useState<
    CommissionHistoryEntry[]
  >([]);
  // Fund breakdown: only shows running amount while active; 0 after fund turns off
  const [fundTotals, setFundTotals] = useState<Record<FundKey, number>>({
    gaming: 0,
    stock: 0,
    political: 0,
    mix: 0,
  });

  useEffect(() => {
    if (!session || !isActivated) return;

    if (viewOnly) {
      setTotalCommission(0);
      setActiveFund(null);
      setFundTotals({ gaming: 0, stock: 0, political: 0, mix: 0 });
      setCommissionHistoryState([]);
      return;
    }

    const tick = () => {
      const currentFund = getActiveFund(session.userId);
      setActiveFund(currentFund);

      // Load current fund breakdown state
      const breakdown = getFundBreakdown();

      // ---- Detect fund OFF event ----
      // If last tick had an active fund and now it's off (or different fund), save to history
      if (
        breakdown.lastActiveFund &&
        breakdown.lastActiveFund !== currentFund
      ) {
        const offFund = breakdown.lastActiveFund as FundKey;
        const offAmount = breakdown[offFund];

        if (offAmount > 0) {
          const now = new Date();
          const expiresAt = new Date(now);
          expiresAt.setDate(expiresAt.getDate() + 30);

          // Find the bank account that was active for this fund
          const allBankAccounts = getBankAccounts();
          const activeBank =
            allBankAccounts.find(
              (a) =>
                a.userId === session.userId &&
                a.status === "approved" &&
                ((a.fundType === offFund && a.transactionEnabled === true) ||
                  (a.fundType === "general" &&
                    a.transactionEnabledFunds?.[offFund] === true)),
            ) ??
            allBankAccounts.find(
              // fallback: any approved account for this fund (fund may have just been turned off)
              (a) =>
                a.userId === session.userId &&
                a.status === "approved" &&
                (a.fundType === offFund || a.fundType === "general"),
            );

          const history = getCommissionHistory();
          history.push({
            id: `fund_off_${offFund}_${Date.now()}`,
            fundType: offFund,
            fundPercentage: FUND_CONFIG[offFund].percentage,
            amount: offAmount,
            earnedAt: now.toISOString(),
            expiresAt: expiresAt.toISOString(),
            note: `${FUND_CONFIG[offFund].label} @ ${FUND_CONFIG[offFund].percentage}% — Final`,
            bankName: activeBank?.bankName,
            bankAccountLast5: activeBank
              ? activeBank.accountNumber.slice(-5)
              : undefined,
          });
          setCommissionHistory(history);

          // Reset that fund's breakdown to 0
          breakdown[offFund] = 0;
        }
      }

      // ---- Process new credit transactions for the active fund ----
      if (currentFund) {
        const allTxns = getLiveTransactions();
        const processedIds = getProcessedTxnIds();
        const processedSet = new Set(processedIds);

        const newCreditTxns = allTxns.filter(
          (t) =>
            t.type === "credit" &&
            t.fundType === currentFund &&
            !processedSet.has(t.id),
        );

        if (newCreditTxns.length > 0) {
          const now = new Date();

          let newTotal = 0;
          for (const txn of newCreditTxns) {
            const commissionRate = FUND_CONFIG[currentFund].percentage;
            const commissionAmount = (txn.amount * commissionRate) / 100;
            newTotal += commissionAmount;
            processedSet.add(txn.id);
          }

          if (newTotal > 0) {
            // Add to accumulated total
            const acc = getAccumulatedCommission();
            acc.total += newTotal;
            acc.lastUpdated = now.toISOString();
            setAccumulatedCommission(acc);

            // Add to fund breakdown running total (NOT history yet)
            breakdown[currentFund] = (breakdown[currentFund] || 0) + newTotal;

            setProcessedTxnIds([...processedSet]);
          }
        }
      }

      // Update last active fund tracker
      breakdown.lastActiveFund = currentFund;
      setFundBreakdown(breakdown);

      // ---- Calculate display values ----
      const acc = getAccumulatedCommission();

      // acc.total is already net (AdminWithdrawal deducts from it on each withdrawal)
      setTotalCommission(Math.max(0, acc.total));

      // Fund breakdown display: show running amount only for active fund, 0 for others
      const display: Record<FundKey, number> = {
        gaming: 0,
        stock: 0,
        political: 0,
        mix: 0,
      };
      if (currentFund) {
        display[currentFund] = breakdown[currentFund] || 0;
      }
      setFundTotals(display);

      // Commission history (fund OFF entries + withdrawal deduction entries, sorted newest first)
      const nowMs = Date.now();
      const validHistory = getCommissionHistory().filter(
        (h) => new Date(h.expiresAt).getTime() > nowMs,
      );
      setCommissionHistoryState(validHistory.slice().reverse());
    };

    tick();
    const interval = setInterval(tick, 1500);
    return () => clearInterval(interval);
  }, [session, isActivated, viewOnly]);

  const isLive = activeFund !== null;

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

          {!viewOnly && (
            <Button
              onClick={onWithdraw}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2"
            >
              <ArrowDownToLine className="w-4 h-4" />
              Withdraw
            </Button>
          )}
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
              {isLive ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                  Live Calculation — {FUND_CONFIG[activeFund!].label} is active
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                  Commission preserved — no fund active
                </>
              )}
            </p>
          </div>
        </div>

        <Tabs defaultValue="breakdown" className="w-full">
          <TabsList className="grid grid-cols-2 bg-secondary w-full mb-4">
            <TabsTrigger
              value="breakdown"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Fund Breakdown
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Commission History
            </TabsTrigger>
          </TabsList>

          {/* Fund Breakdown Tab */}
          <TabsContent value="breakdown">
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
                    ).map(([key, config]) => {
                      const isActive = key === activeFund;
                      const fundAmount = fundTotals[key] ?? 0;
                      return (
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
                            {formatCurrency(fundAmount)}
                          </TableCell>
                          <TableCell>
                            {isActive ? (
                              <span className="status-approved inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-current inline-block animate-pulse" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
                                <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
                                Inactive
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          {/* Commission History Tab */}
          <TabsContent value="history">
            <div className="bg-card border border-border rounded-xl overflow-hidden card-glow">
              <div className="px-6 py-4 border-b border-border flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-base font-semibold text-foreground">
                  Commission History
                </h3>
                <span className="text-xs text-muted-foreground ml-auto">
                  Last 30 days
                </span>
              </div>

              {commissionHistory.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No commission history yet.</p>
                  <p className="text-xs mt-1 opacity-70">
                    Entries appear here when a fund is turned OFF.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground">
                          Type
                        </TableHead>
                        <TableHead className="text-muted-foreground">
                          Details
                        </TableHead>
                        <TableHead className="text-muted-foreground">
                          Amount
                        </TableHead>
                        <TableHead className="text-muted-foreground">
                          Date
                        </TableHead>
                        <TableHead className="text-muted-foreground">
                          Time
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {commissionHistory.map((entry) => {
                        const { date, time } = formatDateTime(entry.earnedAt);
                        const isDeduction = entry.amount < 0;
                        const fundConfig =
                          FUND_CONFIG[entry.fundType as FundKey];
                        return (
                          <TableRow
                            key={entry.id}
                            className={`border-border hover:bg-secondary/50 ${isDeduction ? "bg-red-500/5" : ""}`}
                          >
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-2 h-2 rounded-full inline-block ${isDeduction ? "bg-red-400" : (fundConfig?.color ?? "bg-primary")}`}
                                />
                                <span
                                  className={`font-medium text-sm ${isDeduction ? "text-red-400" : "text-foreground"}`}
                                >
                                  {isDeduction
                                    ? "Withdrawal"
                                    : (fundConfig?.label ?? entry.fundType)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {isDeduction ? (
                                <div className="space-y-0.5">
                                  {(() => {
                                    const note = entry.note ?? "";
                                    const txnMatch = note.match(/TXN:\s*(\S+)/);
                                    const methodPart = note.split(" | TXN:")[0];
                                    return (
                                      <>
                                        <p className="text-xs uppercase">
                                          {methodPart}
                                        </p>
                                        {txnMatch && (
                                          <p className="font-mono text-xs text-amber-400/80 tracking-wide">
                                            {txnMatch[1]}
                                          </p>
                                        )}
                                      </>
                                    );
                                  })()}
                                </div>
                              ) : (
                                <div className="space-y-0.5">
                                  <p className="font-medium text-foreground/90">
                                    {entry.fundPercentage}%
                                  </p>
                                  {(entry.bankName ||
                                    entry.bankAccountLast5) && (
                                    <p className="text-xs text-muted-foreground/70 font-mono">
                                      {entry.bankName && (
                                        <span>{entry.bankName}</span>
                                      )}
                                      {entry.bankName &&
                                        entry.bankAccountLast5 && (
                                          <span className="mx-1">·</span>
                                        )}
                                      {entry.bankAccountLast5 && (
                                        <span>XX{entry.bankAccountLast5}</span>
                                      )}
                                    </p>
                                  )}
                                </div>
                              )}
                            </TableCell>
                            <TableCell
                              className={`font-semibold tabular-nums text-sm ${isDeduction ? "text-red-400" : "text-green-400"}`}
                            >
                              {isDeduction
                                ? `-${formatCurrency(Math.abs(entry.amount))}`
                                : `+${formatCurrency(entry.amount)}`}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {date}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs">
                              {time}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
