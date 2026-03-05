import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
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
import { CheckCircle2, Copy, Download, History, Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface WithdrawalHistoryProps {
  isActivated: boolean;
}

function MethodBadge({ method }: { method: Withdrawal["method"] }) {
  const config = {
    upi: {
      label: "UPI",
      className: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    },
    bank: {
      label: "BANK",
      className: "bg-green-500/20 text-green-400 border border-green-500/30",
    },
    usdt: {
      label: "USDT",
      className: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
    },
  };

  const c = config[method] ?? config.bank;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold font-mono ${c.className}`}
    >
      {c.label}
    </span>
  );
}

function copyToClipboard(text: string, label: string) {
  navigator.clipboard.writeText(text).then(() => {
    toast.success(`${label} copied to clipboard`);
  });
}

function truncateHash(hash: string, chars = 10): string {
  if (hash.length <= chars * 2 + 4) return hash;
  return `${hash.slice(0, chars)}...${hash.slice(-chars)}`;
}

function maskAccount(num: string): string {
  if (!num) return "—";
  return num;
}

function WithdrawalDetailContent({ w }: { w: Withdrawal }) {
  const transferMode =
    w.transferMode ?? (w.transactionId?.startsWith("NEFT") ? "NEFT" : "IMPS");

  if (w.method === "upi") {
    return (
      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between items-start gap-4">
          <span className="text-muted-foreground shrink-0">Transaction ID</span>
          <span className="text-foreground font-mono font-medium text-right break-all">
            {w.transactionId}
          </span>
        </div>
        {w.referenceNumber && (
          <div className="flex justify-between items-start gap-4">
            <span className="text-muted-foreground shrink-0">
              UPI Reference
            </span>
            <span className="text-foreground font-mono font-medium text-right">
              {w.referenceNumber}
            </span>
          </div>
        )}
        {w.upiVpa && (
          <div className="flex justify-between items-start gap-4">
            <span className="text-muted-foreground shrink-0">Payer VPA</span>
            <span className="text-foreground font-medium text-right">
              {w.upiVpa}
            </span>
          </div>
        )}
        <div className="flex justify-between items-start gap-4">
          <span className="text-muted-foreground shrink-0">Amount</span>
          <span className="text-primary font-bold text-right">
            {formatCurrency(w.amount)}
          </span>
        </div>
        <div className="flex justify-between items-start gap-4">
          <span className="text-muted-foreground shrink-0">Method</span>
          <span className="text-foreground font-medium text-right">
            UPI Transfer
          </span>
        </div>
        <div className="flex justify-between items-start gap-4">
          <span className="text-muted-foreground shrink-0">Date</span>
          <span className="text-foreground font-medium text-right">
            {w.date}
          </span>
        </div>
        <div className="flex justify-between items-start gap-4">
          <span className="text-muted-foreground shrink-0">Time</span>
          <span className="text-foreground font-medium text-right">
            {w.time}
          </span>
        </div>
        <div className="flex justify-between items-center pt-1 border-t border-border">
          <span className="text-muted-foreground">Status</span>
          <div className="flex items-center gap-1.5 text-green-400 font-semibold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            Transfer Successful
          </div>
        </div>
      </div>
    );
  }

  if (w.method === "bank") {
    return (
      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between items-start gap-4">
          <span className="text-muted-foreground shrink-0">Transaction ID</span>
          <span className="text-foreground font-mono font-medium text-right break-all">
            {w.transactionId}
          </span>
        </div>
        {w.referenceNumber && (
          <div className="flex justify-between items-start gap-4">
            <span className="text-muted-foreground shrink-0">
              RRN (Reference)
            </span>
            <span className="text-foreground font-mono font-medium text-right">
              {w.referenceNumber}
            </span>
          </div>
        )}
        {w.utrNumber && (
          <div className="flex justify-between items-start gap-4">
            <span className="text-muted-foreground shrink-0">UTR Number</span>
            <span className="text-foreground font-mono font-medium text-right">
              {w.utrNumber}
            </span>
          </div>
        )}
        {w.bankName && (
          <div className="flex justify-between items-start gap-4">
            <span className="text-muted-foreground shrink-0">Bank Name</span>
            <span className="text-foreground font-medium text-right">
              {w.bankName}
            </span>
          </div>
        )}
        {w.accountNumber && (
          <div className="flex justify-between items-start gap-4">
            <span className="text-muted-foreground shrink-0">Account No.</span>
            <span className="text-foreground font-mono font-medium text-right">
              {maskAccount(w.accountNumber)}
            </span>
          </div>
        )}
        {w.holderName && (
          <div className="flex justify-between items-start gap-4">
            <span className="text-muted-foreground shrink-0">Holder Name</span>
            <span className="text-foreground font-medium text-right">
              {w.holderName}
            </span>
          </div>
        )}
        {w.ifscCode && (
          <div className="flex justify-between items-start gap-4">
            <span className="text-muted-foreground shrink-0">IFSC Code</span>
            <span className="text-foreground font-mono font-medium text-right">
              {w.ifscCode}
            </span>
          </div>
        )}
        {w.bankBranch && (
          <div className="flex justify-between items-start gap-4">
            <span className="text-muted-foreground shrink-0">Branch</span>
            <span className="text-foreground font-medium text-right">
              {w.bankBranch}
            </span>
          </div>
        )}
        <div className="flex justify-between items-start gap-4">
          <span className="text-muted-foreground shrink-0">Transfer Mode</span>
          <span className="text-foreground font-semibold text-right">
            {transferMode}
          </span>
        </div>
        <div className="flex justify-between items-start gap-4">
          <span className="text-muted-foreground shrink-0">Amount</span>
          <span className="text-primary font-bold text-right">
            {formatCurrency(w.amount)}
          </span>
        </div>
        <div className="flex justify-between items-start gap-4">
          <span className="text-muted-foreground shrink-0">Date</span>
          <span className="text-foreground font-medium text-right">
            {w.date}
          </span>
        </div>
        <div className="flex justify-between items-start gap-4">
          <span className="text-muted-foreground shrink-0">Time</span>
          <span className="text-foreground font-medium text-right">
            {w.time}
          </span>
        </div>
        <div className="flex justify-between items-center pt-1 border-t border-border">
          <span className="text-muted-foreground">Status</span>
          <div className="flex items-center gap-1.5 text-green-400 font-semibold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            Transfer Successful
          </div>
        </div>
      </div>
    );
  }

  if (w.method === "usdt") {
    const approxInr = Math.round(w.amount * 83.5);
    return (
      <div className="space-y-2.5 text-sm">
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/30 mb-1">
          <span className="text-purple-400 font-bold text-lg">₮</span>
          <span className="text-purple-400 font-semibold text-sm">
            USDT TRC20 Transfer
          </span>
        </div>
        <div className="flex justify-between items-start gap-4">
          <span className="text-muted-foreground shrink-0">TxHash</span>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-foreground font-mono text-xs break-all">
              {truncateHash(w.txHash ?? w.transactionId)}
            </span>
            {w.txHash && (
              <button
                type="button"
                onClick={() => copyToClipboard(w.txHash!, "TxHash")}
                className="text-muted-foreground hover:text-primary transition-colors shrink-0"
              >
                <Copy className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
        {w.bankDetails && (
          <div className="flex justify-between items-start gap-4">
            <span className="text-muted-foreground shrink-0">
              Wallet Address
            </span>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-foreground font-mono text-xs break-all">
                {truncateHash(w.bankDetails)}
              </span>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(w.bankDetails!, "Wallet address")
                }
                className="text-muted-foreground hover:text-primary transition-colors shrink-0"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
        <div className="flex justify-between items-start gap-4">
          <span className="text-muted-foreground shrink-0">Amount</span>
          <span className="text-primary font-bold text-right">
            {w.amount} USDT
            <span className="text-muted-foreground font-normal text-xs ml-1">
              (≈ ₹{approxInr.toLocaleString("en-IN")})
            </span>
          </span>
        </div>
        {w.networkFee !== undefined && (
          <div className="flex justify-between items-start gap-4">
            <span className="text-muted-foreground shrink-0">Network Fee</span>
            <span className="text-foreground font-medium text-right">
              {w.networkFee} USDT
            </span>
          </div>
        )}
        <div className="flex justify-between items-start gap-4">
          <span className="text-muted-foreground shrink-0">Network</span>
          <span className="text-foreground font-medium text-right">
            TRON (TRC20)
          </span>
        </div>
        <div className="flex justify-between items-start gap-4">
          <span className="text-muted-foreground shrink-0">Confirmations</span>
          <span className="text-green-400 font-semibold text-right">19</span>
        </div>
        <div className="flex justify-between items-start gap-4">
          <span className="text-muted-foreground shrink-0">Date</span>
          <span className="text-foreground font-medium text-right">
            {w.date}
          </span>
        </div>
        <div className="flex justify-between items-start gap-4">
          <span className="text-muted-foreground shrink-0">Time</span>
          <span className="text-foreground font-medium text-right">
            {w.time}
          </span>
        </div>
        <div className="flex justify-between items-center pt-1 border-t border-border">
          <span className="text-muted-foreground">Status</span>
          <div className="flex items-center gap-1.5 text-green-400 font-semibold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            Transfer Successful
          </div>
        </div>
      </div>
    );
  }

  // fallback (should not be reached, but satisfies TypeScript)
  const fw = w as Withdrawal;
  return (
    <div className="space-y-2.5 text-sm">
      {[
        { label: "Transaction ID", value: fw.transactionId, mono: true },
        { label: "Method", value: String(fw.method).toUpperCase() },
        { label: "Amount", value: formatCurrency(fw.amount) },
        { label: "Bank Name", value: fw.bankName ?? "—" },
        {
          label: "Account Number",
          value: fw.accountNumber ? maskAccount(fw.accountNumber) : "—",
          mono: true,
        },
        { label: "Holder Name", value: fw.holderName ?? "—" },
        { label: "IFSC Code", value: fw.ifscCode ?? "—", mono: true },
        { label: "Date", value: fw.date },
        { label: "Time", value: fw.time },
      ].map(({ label, value, mono }) => (
        <div key={label} className="flex justify-between items-start gap-4">
          <span className="text-muted-foreground shrink-0">{label}:</span>
          <span
            className={`text-foreground font-medium text-right ${mono ? "font-mono" : ""}`}
          >
            {value}
          </span>
        </div>
      ))}
      <div className="flex justify-between items-center pt-1">
        <span className="text-muted-foreground">Status:</span>
        <StatusBadge status={fw.status} />
      </div>
    </div>
  );
}

function downloadReceipt(w: Withdrawal) {
  const transferMode =
    w.transferMode ?? (w.transactionId?.startsWith("NEFT") ? "NEFT" : "IMPS");

  const maskAccount = (num: string) => num ?? "—";

  const methodRows = () => {
    if (w.method === "upi") {
      return `
        <tr><td>Transaction ID</td><td>${w.transactionId}</td></tr>
        ${w.referenceNumber ? `<tr><td>UPI Reference</td><td>${w.referenceNumber}</td></tr>` : ""}
        ${w.upiVpa ? `<tr><td>Payer VPA</td><td>${w.upiVpa}</td></tr>` : ""}
        <tr><td>Transfer Method</td><td>UPI Transfer</td></tr>
      `;
    }
    if (w.method === "bank") {
      return `
        <tr><td>Transaction ID</td><td>${w.transactionId}</td></tr>
        ${w.referenceNumber ? `<tr><td>RRN (Reference)</td><td>${w.referenceNumber}</td></tr>` : ""}
        ${w.utrNumber ? `<tr><td>UTR Number</td><td>${w.utrNumber}</td></tr>` : ""}
        ${w.bankName ? `<tr><td>Bank Name</td><td>${w.bankName}</td></tr>` : ""}
        ${w.accountNumber ? `<tr><td>Account Number</td><td>${maskAccount(w.accountNumber)}</td></tr>` : ""}
        ${w.holderName ? `<tr><td>Account Holder</td><td>${w.holderName}</td></tr>` : ""}
        ${w.ifscCode ? `<tr><td>IFSC Code</td><td>${w.ifscCode}</td></tr>` : ""}
        ${w.bankBranch ? `<tr><td>Branch</td><td>${w.bankBranch}</td></tr>` : ""}
        <tr><td>Transfer Mode</td><td>${transferMode}</td></tr>
      `;
    }
    if (w.method === "usdt") {
      return `
        <tr><td>Network</td><td>TRON (TRC20)</td></tr>
        ${w.txHash ? `<tr><td>TxHash</td><td style="word-break:break-all;font-size:11px">${w.txHash}</td></tr>` : ""}
        ${w.bankDetails ? `<tr><td>Wallet Address</td><td style="word-break:break-all;font-size:11px">${w.bankDetails}</td></tr>` : ""}
        ${w.networkFee !== undefined ? `<tr><td>Network Fee</td><td>${w.networkFee} USDT</td></tr>` : ""}
        <tr><td>Confirmations</td><td>19</td></tr>
      `;
    }
    return "";
  };

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Withdrawal Receipt - Kuber Panel</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Arial', sans-serif; background: #fff; color: #111; padding: 40px; max-width: 600px; margin: 0 auto; }
    .header { text-align: center; border-bottom: 2px solid #c8940a; padding-bottom: 20px; margin-bottom: 24px; }
    .header h1 { font-size: 24px; font-weight: 800; color: #c8940a; letter-spacing: 3px; }
    .header p { font-size: 12px; color: #666; margin-top: 4px; }
    .stamp { text-align: center; margin: 20px 0; }
    .stamp span { display: inline-block; border: 3px solid #16a34a; color: #16a34a; padding: 6px 24px; font-size: 20px; font-weight: 900; letter-spacing: 4px; transform: rotate(-3deg); }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    tr:nth-child(even) { background: #f9f9f9; }
    td { padding: 9px 14px; font-size: 13px; border-bottom: 1px solid #eee; }
    td:first-child { color: #666; font-weight: 600; width: 45%; }
    td:last-child { font-weight: 500; }
    .amount-row td:last-child { font-size: 18px; font-weight: 800; color: #c8940a; }
    .footer { margin-top: 24px; border-top: 1px solid #eee; padding-top: 16px; text-align: center; font-size: 11px; color: #999; }
    .badge { display: inline-block; background: #c8940a; color: #fff; padding: 2px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; margin-top: 4px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>KUBER PANEL</h1>
    <p>Financial Management Platform</p>
    <span class="badge">WITHDRAWAL RECEIPT</span>
  </div>
  <div class="stamp"><span>TRANSFER SUCCESSFUL</span></div>
  <table>
    ${methodRows()}
    <tr class="amount-row"><td>Amount</td><td>${w.method === "usdt" ? `${w.amount} USDT` : formatCurrency(w.amount)}</td></tr>
    <tr><td>Date</td><td>${w.date}</td></tr>
    <tr><td>Time</td><td>${w.time}</td></tr>
    <tr><td>Status</td><td style="color:#16a34a;font-weight:700">Transfer Successful ✓</td></tr>
  </table>
  <div class="footer">
    <p>This is a computer-generated receipt. No signature required.</p>
    <p>© ${new Date().getFullYear()} Kuber Panel. All rights reserved.</p>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (win) {
    win.onload = () => {
      setTimeout(() => {
        win.print();
        URL.revokeObjectURL(url);
      }, 500);
    };
  }
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
            <div
              className="text-center py-12 text-muted-foreground"
              data-ocid="withdrawal_history.empty_state"
            >
              <History className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No withdrawal history found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <Table data-ocid="withdrawal_history.table">
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">
                      Type
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Bank / Method
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Account No.
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
                  {history.map((w, idx) => (
                    <TableRow
                      key={w.id}
                      className="border-border hover:bg-secondary/50 cursor-pointer"
                      onClick={() => setSelected(w)}
                      data-ocid={`withdrawal_history.item.${idx + 1}`}
                    >
                      <TableCell>
                        <MethodBadge method={w.method} />
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {w.method === "usdt"
                          ? "USDT TRC20"
                          : w.method === "upi"
                            ? (w.bankDetails ?? "UPI")
                            : (w.bankName ?? "Bank")}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-sm tracking-wider">
                        {w.accountNumber ?? "—"}
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
                      <TableCell className="text-muted-foreground font-mono text-xs max-w-[120px] truncate">
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
        <DialogContent
          className="bg-card border-border max-w-md max-h-[90vh] overflow-y-auto"
          data-ocid="withdrawal_history.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-foreground font-display flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              Withdrawal Details
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <>
              <WithdrawalDetailContent w={selected} />
              <div className="pt-3 border-t border-border">
                <Button
                  onClick={() => downloadReceipt(selected)}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                  data-ocid="withdrawal_history.download_button"
                >
                  <Download className="w-4 h-4" />
                  Download Receipt
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
