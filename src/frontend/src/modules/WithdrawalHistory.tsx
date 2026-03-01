import { StatusBadge } from "@/components/StatusBadge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type Withdrawal,
  formatCurrency,
  getSession,
  getWithdrawals,
} from "@/lib/storage";
import { History, Lock } from "lucide-react";
import { useState } from "react";

interface WithdrawalHistoryProps {
  isActivated: boolean;
}

export function WithdrawalHistory({ isActivated }: WithdrawalHistoryProps) {
  const session = getSession();
  const [selected, setSelected] = useState<Withdrawal | null>(null);

  // Get last 30 days
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const history = getWithdrawals()
    .filter((w) => w.userId === session?.userId)
    .filter((w) => {
      try {
        // Try to parse date
        const d = new Date(`${w.date} ${w.time}`).getTime();
        return Number.isNaN(d) ? true : d >= thirtyDaysAgo;
      } catch {
        return true;
      }
    })
    .reverse();

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
              Activate panel to view history
            </p>
          </div>
        </div>
      )}

      <div className={!isActivated ? "pointer-events-none opacity-50" : ""}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <History className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-foreground">
              Withdrawal History
            </h2>
            <p className="text-muted-foreground text-sm">
              Last 30 days of withdrawals
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden card-glow">
          <div className="px-6 py-4 border-b border-border">
            <p className="text-sm text-muted-foreground">
              {history.length} withdrawal{history.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No withdrawal history found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">
                      Bank / Method
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Account No.
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Holder
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Amount
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Date
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Txn ID
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((w) => (
                    <TableRow
                      key={w.id}
                      className="border-border hover:bg-secondary/50 cursor-pointer"
                      onClick={() => setSelected(w)}
                    >
                      <TableCell className="font-medium text-foreground">
                        {w.bankName ?? w.method.toUpperCase()}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-sm">
                        {w.accountNumber
                          ? `••••${w.accountNumber.slice(-4)}`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {w.holderName ?? "—"}
                      </TableCell>
                      <TableCell className="font-semibold text-primary tabular-nums">
                        {formatCurrency(w.amount)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {w.date}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={w.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">
                        {w.transactionId}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground font-display">
              Withdrawal Details
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-3 text-sm">
              {[
                {
                  label: "Transaction ID",
                  value: selected.transactionId,
                  mono: true,
                },
                { label: "Method", value: selected.method.toUpperCase() },
                { label: "Amount", value: formatCurrency(selected.amount) },
                { label: "Bank Name", value: selected.bankName ?? "—" },
                {
                  label: "Account Number",
                  value: selected.accountNumber ?? "—",
                  mono: true,
                },
                { label: "Holder Name", value: selected.holderName ?? "—" },
                {
                  label: "IFSC Code",
                  value: selected.ifscCode ?? "—",
                  mono: true,
                },
                { label: "Date", value: selected.date },
                { label: "Time", value: selected.time },
              ].map(({ label, value, mono }) => (
                <div
                  key={label}
                  className="flex justify-between items-start gap-4"
                >
                  <span className="text-muted-foreground shrink-0">
                    {label}:
                  </span>
                  <span
                    className={`text-foreground font-medium text-right ${mono ? "font-mono" : ""}`}
                  >
                    {value}
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-1">
                <span className="text-muted-foreground">Status:</span>
                <StatusBadge status={selected.status} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
