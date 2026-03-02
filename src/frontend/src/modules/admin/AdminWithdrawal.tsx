import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type CommissionHistoryEntry,
  type Withdrawal,
  formatCurrency,
  generateId,
  generateTransactionId,
  getAccumulatedCommission,
  getCommissionHistory,
  getWithdrawals,
  setAccumulatedCommission,
  setCommissionHistory,
  setWithdrawals,
} from "@/lib/storage";
import { ArrowDownToLine, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function AdminWithdrawal() {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"upi" | "bank" | "usdt">("upi");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const adminWithdrawals = getWithdrawals()
    .filter((w) => w.userId === "admin")
    .reverse();

  // Current available commission balance (total minus already withdrawn)
  const getAvailableBalance = () => {
    const acc = getAccumulatedCommission();
    const withdrawn = getWithdrawals()
      .filter((w) => w.userId === "admin" && w.status === "transfer_successful")
      .reduce((sum, w) => sum + w.amount, 0);
    return Math.max(0, acc.total - withdrawn);
  };

  const availableBalance = getAvailableBalance();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawAmount = Number(amount);
    if (!amount || withdrawAmount < 100) {
      toast.error("Minimum withdrawal amount is ₹100.");
      return;
    }

    const balance = getAvailableBalance();
    if (withdrawAmount > balance) {
      toast.error(
        `Insufficient commission balance. Available: ₹${balance.toFixed(2)}`,
      );
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));

    const now = new Date();

    // Deduct from accumulated commission
    const acc = getAccumulatedCommission();
    acc.total = Math.max(0, acc.total - withdrawAmount);
    acc.lastUpdated = now.toISOString();
    setAccumulatedCommission(acc);

    // Add red deduction entry to commission history
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 30);
    const deductionEntry: CommissionHistoryEntry = {
      id: `wd_deduct_${Date.now()}`,
      fundType: "withdrawal" as never,
      fundPercentage: 0,
      amount: -withdrawAmount,
      earnedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      note: `Withdrawal — ${method.toUpperCase()}${details ? ` (${details})` : ""}`,
    };
    const history = getCommissionHistory();
    setCommissionHistory([...history, deductionEntry]);

    const withdrawal: Withdrawal = {
      id: generateId(),
      userId: "admin",
      method,
      amount: withdrawAmount,
      bankDetails: details,
      transactionId: generateTransactionId(),
      date: now.toLocaleDateString("en-IN"),
      time: now.toLocaleTimeString("en-IN"),
      status: "transfer_successful",
    };

    const all = getWithdrawals();
    setWithdrawals([...all, withdrawal]);
    toast.success(
      `Withdrawal of ₹${withdrawAmount.toLocaleString("en-IN")} recorded. Commission deducted.`,
    );
    setAmount("");
    setDetails("");
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
          <ArrowDownToLine className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">
            Fund Withdrawal
          </h2>
          <p className="text-muted-foreground text-sm">
            Record and track withdrawals
          </p>
        </div>
      </div>

      {/* Available balance card */}
      <div className="bg-card border border-primary/30 rounded-xl p-4 card-glow flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">
            Available Commission Balance
          </p>
          <p className="text-2xl font-display font-bold text-primary tabular-nums mt-0.5">
            {formatCurrency(availableBalance)}
          </p>
        </div>
        <ArrowDownToLine className="w-8 h-8 text-primary opacity-40" />
      </div>

      {/* Form */}
      <div className="bg-card border border-border rounded-xl p-6 card-glow">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm">
                Withdrawal Method
              </Label>
              <Select
                value={method}
                onValueChange={(v) => setMethod(v as typeof method)}
              >
                <SelectTrigger className="bg-secondary border-border h-11 text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="usdt">USDT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm">
                Amount (₹) <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="100"
                className="bg-secondary border-border focus:border-primary h-11 text-foreground placeholder:text-muted-foreground/50"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-sm">
              Details / Notes
            </Label>
            <Input
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="UPI ID, account number, or USDT address"
              className="bg-secondary border-border focus:border-primary h-11 text-foreground placeholder:text-muted-foreground/50"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-semibold"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Record Withdrawal
          </Button>
        </form>
      </div>

      {/* History */}
      <div className="bg-card border border-border rounded-xl overflow-hidden card-glow">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-base font-semibold text-foreground">
            Withdrawal History
          </h3>
        </div>
        {adminWithdrawals.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <ArrowDownToLine className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No withdrawals recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">
                    Method
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Amount
                  </TableHead>
                  <TableHead className="text-muted-foreground">Date</TableHead>
                  <TableHead className="text-muted-foreground">
                    Txn ID
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminWithdrawals.map((w) => (
                  <TableRow
                    key={w.id}
                    className="border-border hover:bg-secondary/50"
                  >
                    <TableCell className="font-medium text-foreground uppercase">
                      {w.method}
                    </TableCell>
                    <TableCell className="font-semibold text-primary tabular-nums">
                      {formatCurrency(w.amount)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {w.date}
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {w.transactionId}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={w.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
