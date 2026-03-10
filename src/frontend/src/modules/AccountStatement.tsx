import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FUND_CONFIG,
  type LiveTransaction,
  type StatementSession,
  formatCurrency,
  getLiveTransactions,
  getStatementSessions,
} from "@/lib/storage";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Lock,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AccountStatementProps {
  isActivated: boolean;
  isAdmin?: boolean;
}

type FundKey = "gaming" | "stock" | "political" | "mix";

interface StatementRow {
  date: string;
  time: string;
  narration: string;
  debit: number | null;
  credit: number | null;
  balance: number;
  utr: string;
  type: "credit" | "debit";
  txnId: string;
}

function buildStatementRows(
  transactions: LiveTransaction[],
  bankName: string,
): StatementRow[] {
  const sorted = [...transactions].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  let balance = 0;
  return sorted.map((t) => {
    const txnTime = new Date(t.timestamp);
    const dateStr = txnTime.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const timeStr = txnTime.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    const rawUtr = t.utr ?? t.id.replace(/-/g, "").slice(0, 12);
    const utr = rawUtr
      .replace(/[^0-9]/g, "")
      .padStart(12, "0")
      .slice(0, 12);
    const fundLabel = FUND_CONFIG[t.fundType as FundKey]?.label ?? t.fundType;
    const isCredit = t.type === "credit";

    const narration = isCredit
      ? `${fundLabel} / ${bankName} / CR`
      : `${fundLabel} / ${bankName} / DR`;

    if (isCredit) {
      balance += t.amount;
    } else {
      balance = Math.max(0, balance - t.amount);
    }

    return {
      date: dateStr,
      time: timeStr,
      narration,
      debit: isCredit ? null : t.amount,
      credit: isCredit ? t.amount : null,
      balance,
      utr,
      type: t.type,
      txnId: t.id,
    };
  });
}

function generateStatementHtml(
  rows: StatementRow[],
  session: StatementSession,
  periodStart: string,
  periodEnd: string,
): string {
  const totalCredit = rows.reduce((s, r) => s + (r.credit ?? 0), 0);
  const totalDebit = rows.reduce((s, r) => s + (r.debit ?? 0), 0);
  const closingBalance = rows[rows.length - 1]?.balance ?? 0;

  const fmtINR = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(n);

  const rowsHtml = rows
    .map(
      (r, i) => `
    <tr style="background:${i % 2 === 0 ? "#ffffff" : "#f9fbff"}">
      <td style="padding:8px 10px;font-size:12px;border-bottom:1px solid #e8edf5">${r.date}</td>
      <td style="padding:8px 10px;font-size:11px;color:#555;border-bottom:1px solid #e8edf5">${r.time}</td>
      <td style="padding:8px 10px;font-size:12px;border-bottom:1px solid #e8edf5;max-width:260px">${r.narration}</td>
      <td style="padding:8px 10px;font-size:11px;font-family:monospace;border-bottom:1px solid #e8edf5;color:#777;letter-spacing:0.1em">${r.utr}</td>
      <td style="padding:8px 10px;font-size:12px;text-align:right;color:#c0392b;font-weight:600;border-bottom:1px solid #e8edf5">${r.debit !== null ? fmtINR(r.debit) : "—"}</td>
      <td style="padding:8px 10px;font-size:12px;text-align:right;color:#27ae60;font-weight:600;border-bottom:1px solid #e8edf5">${r.credit !== null ? fmtINR(r.credit) : "—"}</td>
      <td style="padding:8px 10px;font-size:12px;text-align:right;font-weight:700;border-bottom:1px solid #e8edf5;color:${r.balance >= 0 ? "#1a1a1a" : "#c0392b"}">${fmtINR(r.balance)}</td>
    </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>Account Statement - ${session.bankName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Arial', sans-serif; background: #f4f6fa; color: #1a1a1a; }
    .page { max-width: 960px; margin: 0 auto; background: #fff; }
    .header { background: linear-gradient(135deg, #0a2240, #1565c0); color: #fff; padding: 24px 32px; }
    .header-top { display: flex; justify-content: space-between; align-items: flex-start; }
    .bank-name { font-size: 22px; font-weight: 900; letter-spacing: 2px; }
    .bank-sub { font-size: 11px; opacity: 0.6; margin-top: 3px; letter-spacing: 1px; text-transform: uppercase; }
    .stmt-label { font-size: 10px; background: rgba(255,255,255,0.15); padding: 4px 12px; border-radius: 20px; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px; display: inline-block; }
    .acct-section { padding: 20px 32px; border-bottom: 2px solid #e8edf5; background: #f9fbff; }
    .acct-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .acct-item label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #888; display: block; margin-bottom: 3px; }
    .acct-item span { font-size: 13px; font-weight: 700; color: #1a1a1a; }
    .period { padding: 12px 32px; background: #fff; border-bottom: 1px solid #e8edf5; display: flex; gap: 24px; font-size: 12px; flex-wrap: wrap; }
    .period span { color: #555; } .period strong { color: #1a1a1a; }
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: #0a2240; }
    thead th { padding: 10px 10px; font-size: 11px; font-weight: 700; color: #fff; text-align: left; letter-spacing: 1px; text-transform: uppercase; }
    thead th:nth-child(5), thead th:nth-child(6), thead th:nth-child(7) { text-align: right; }
    .summary { padding: 20px 32px; background: #f9fbff; border-top: 2px solid #0a2240; display: flex; gap: 32px; flex-wrap: wrap; }
    .summary-item label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #888; display: block; margin-bottom: 4px; }
    .summary-item span { font-size: 15px; font-weight: 800; }
    .credit-total { color: #27ae60; } .debit-total { color: #c0392b; } .balance-total { color: #0a2240; }
    .footer { padding: 14px 32px; text-align: center; font-size: 10px; color: #aaa; border-top: 1px solid #e8edf5; background: #fff; letter-spacing: 0.5px; }
    @media print { body { background: #fff; } .page { max-width: 100%; } }
  </style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="header-top">
      <div>
        <div class="bank-name">${session.bankName.toUpperCase()}</div>
        <div class="bank-sub">Account Statement</div>
      </div>
      <div style="text-align:right">
        <div class="stmt-label">Account Statement</div>
        <div style="font-size:11px;opacity:0.6;margin-top:6px">Generated: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</div>
      </div>
    </div>
  </div>

  <div class="acct-section">
    <div class="acct-grid">
      <div class="acct-item"><label>Account Holder</label><span>${session.holderName}</span></div>
      <div class="acct-item"><label>Account Number</label><span style="font-family:monospace">${session.accountNumber}</span></div>
      <div class="acct-item"><label>IFSC Code</label><span style="font-family:monospace">${session.ifscCode}</span></div>
    </div>
  </div>

  <div class="period">
    <span>Statement Period: <strong>${periodStart}</strong> — <strong>${periodEnd}</strong></span>
    <span>Total Transactions: <strong>${rows.length}</strong></span>
    <span>Fund: <strong>${FUND_CONFIG[session.fundType]?.label ?? session.fundType}</strong></span>
  </div>

  ${
    rows.length === 0
      ? '<div style="text-align:center;padding:48px;color:#aaa;font-size:14px">No transactions in this period.</div>'
      : `<table><thead><tr><th>Date</th><th>Time</th><th>Narration</th><th>Ref No.</th><th>Debit (DR)</th><th>Credit (CR)</th><th>Balance</th></tr></thead><tbody>${rowsHtml}</tbody></table>`
  }

  <div class="summary">
    <div class="summary-item"><label>Total Credits (CR)</label><span class="credit-total">${fmtINR(totalCredit)}</span></div>
    <div class="summary-item"><label>Total Debits (DR)</label><span class="debit-total">${fmtINR(totalDebit)}</span></div>
    <div class="summary-item"><label>Closing Balance</label><span class="balance-total">${fmtINR(closingBalance)}</span></div>
  </div>

  <div class="footer">
    This is a computer-generated statement. No signature required. &nbsp;|&nbsp;
    © ${new Date().getFullYear()} Kuber Panel. All rights reserved.
  </div>
</div>
</body>
</html>`;
}

// Full statement dialog for a single session
function SessionStatementDialog({
  session,
  onClose,
}: {
  session: StatementSession;
  onClose: () => void;
}) {
  const allTxns = getLiveTransactions();
  const sessionTxns = allTxns.filter(
    (t) =>
      t.sessionId === session.id ||
      (session.transactionIds.length === 0 &&
        t.fundType === session.fundType &&
        new Date(t.timestamp).getTime() >=
          new Date(session.startedAt).getTime() &&
        (!session.endedAt ||
          new Date(t.timestamp).getTime() <=
            new Date(session.endedAt).getTime())),
  );

  const rows = buildStatementRows(sessionTxns, session.bankName);
  const totalCredit = rows.reduce((s, r) => s + (r.credit ?? 0), 0);
  const totalDebit = rows.reduce((s, r) => s + (r.debit ?? 0), 0);
  const closingBalance = rows[rows.length - 1]?.balance ?? 0;

  const periodStart = new Date(session.startedAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const periodEnd = session.endedAt
    ? new Date(session.endedAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Present";

  const handleDownload = () => {
    const html = generateStatementHtml(rows, session, periodStart, periodEnd);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Statement-${session.bankName}-${new Date(session.startedAt).toISOString().slice(0, 10)}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success("Statement downloaded successfully.");
  };

  const handlePrint = () => {
    const html = generateStatementHtml(rows, session, periodStart, periodEnd);
    const printWin = window.open("", "_blank");
    if (printWin) {
      printWin.document.write(html);
      printWin.document.close();
      printWin.focus();
      setTimeout(() => {
        printWin.print();
      }, 500);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        className="bg-card border-border max-w-4xl max-h-[90vh] overflow-y-auto"
        data-ocid="account_statement.session_detail.dialog"
      >
        <DialogHeader>
          <DialogTitle className="text-foreground font-display flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Account Statement
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Bank header */}
          <div
            className="rounded-lg overflow-hidden"
            style={{ background: "linear-gradient(135deg, #0a2240, #1565c0)" }}
          >
            <div className="p-4 text-white">
              <p className="text-lg font-black tracking-widest">
                {session.bankName.toUpperCase()}
              </p>
              <p className="text-xs opacity-60 tracking-widest uppercase mt-0.5">
                Account Statement
              </p>
            </div>
          </div>

          {/* Account info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Account Holder", value: session.holderName },
              {
                label: "Account Number",
                value: session.accountNumber,
                mono: true,
              },
              { label: "IFSC Code", value: session.ifscCode, mono: true },
              { label: "Period", value: `${periodStart} — ${periodEnd}` },
            ].map(({ label, value, mono }) => (
              <div key={label} className="bg-secondary rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
                  {label}
                </p>
                <p
                  className={`text-foreground font-semibold text-sm ${mono ? "font-mono" : ""}`}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Fund badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/30 px-3 py-1 rounded-full uppercase tracking-wider">
              {FUND_CONFIG[session.fundType]?.label ?? session.fundType}
            </span>
            {session.endedAt ? (
              <span className="text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                OFFLINE
              </span>
            ) : (
              <span className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Active
              </span>
            )}
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">
                Total Credits
              </p>
              <p className="text-emerald-400 font-bold text-sm">
                {formatCurrency(totalCredit)}
              </p>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Total Debits</p>
              <p className="text-red-400 font-bold text-sm">
                {formatCurrency(totalDebit)}
              </p>
            </div>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">
                Closing Balance
              </p>
              <p
                className={`font-bold text-sm ${closingBalance >= 0 ? "text-primary" : "text-red-400"}`}
              >
                {formatCurrency(closingBalance)}
              </p>
            </div>
          </div>

          {/* Transactions */}
          {rows.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No transactions in this session.</p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr style={{ background: "#0a2240" }}>
                      {[
                        "Date",
                        "Time",
                        "Narration",
                        "Ref No.",
                        "Debit (DR)",
                        "Credit (CR)",
                        "Balance",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-white px-3 py-2 text-left font-bold uppercase tracking-wider whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...rows].reverse().map((row, i) => (
                      <tr
                        key={row.txnId}
                        className={
                          i % 2 === 0 ? "bg-background" : "bg-secondary/30"
                        }
                      >
                        <td className="px-3 py-2 font-medium whitespace-nowrap">
                          {row.date}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                          {row.time}
                        </td>
                        <td className="px-3 py-2 max-w-[160px] truncate">
                          {row.narration}
                        </td>
                        <td className="px-3 py-2 font-mono text-muted-foreground/70 whitespace-nowrap tracking-widest">
                          {row.utr}
                        </td>
                        <td className="px-3 py-2 text-right text-red-400 font-bold tabular-nums whitespace-nowrap">
                          {row.debit !== null ? formatCurrency(row.debit) : "—"}
                        </td>
                        <td className="px-3 py-2 text-right text-emerald-400 font-bold tabular-nums whitespace-nowrap">
                          {row.credit !== null
                            ? formatCurrency(row.credit)
                            : "—"}
                        </td>
                        <td
                          className={`px-3 py-2 text-right font-black tabular-nums whitespace-nowrap ${
                            row.balance >= 0
                              ? "text-foreground"
                              : "text-red-400"
                          }`}
                        >
                          {formatCurrency(row.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
            <Button
              onClick={handlePrint}
              variant="outline"
              className="flex-1 border-primary/40 text-primary hover:bg-primary/10 gap-2"
              data-ocid="account_statement.session_detail.print_button"
            >
              <FileText className="w-4 h-4" />
              Print / Open
            </Button>
            <Button
              onClick={handleDownload}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              data-ocid="account_statement.session_detail.download_button"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="border-border text-muted-foreground hover:text-foreground"
              data-ocid="account_statement.session_detail.close_button"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AccountStatement({
  isActivated,
  isAdmin = false,
}: AccountStatementProps) {
  const [selectedSession, setSelectedSession] =
    useState<StatementSession | null>(null);

  const allSessions = getStatementSessions().sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  );

  // Keep only last 30 days; only admin can see sessions
  // Sessions remain for 30 days regardless of fund ON/OFF state
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recentSessions = isAdmin
    ? allSessions.filter(
        (s) => new Date(s.startedAt).getTime() >= thirtyDaysAgo,
      )
    : [];

  const allTxns = getLiveTransactions();

  function getSessionTxnCount(s: StatementSession): number {
    if (s.transactionIds.length > 0) return s.transactionIds.length;
    return allTxns.filter(
      (t) =>
        t.fundType === s.fundType &&
        new Date(t.timestamp).getTime() >= new Date(s.startedAt).getTime() &&
        (!s.endedAt ||
          new Date(t.timestamp).getTime() <= new Date(s.endedAt).getTime()),
    ).length;
  }

  function getSessionTotals(s: StatementSession): {
    credit: number;
    debit: number;
  } {
    const txns = allTxns.filter((t) => {
      if (s.transactionIds.length > 0) return s.transactionIds.includes(t.id);
      return (
        t.fundType === s.fundType &&
        new Date(t.timestamp).getTime() >= new Date(s.startedAt).getTime() &&
        (!s.endedAt ||
          new Date(t.timestamp).getTime() <= new Date(s.endedAt).getTime())
      );
    });
    const credit = txns
      .filter((t) => t.type === "credit")
      .reduce((s, t) => s + t.amount, 0);
    const debit = txns
      .filter((t) => t.type === "debit")
      .reduce((s, t) => s + t.amount, 0);
    return { credit, debit };
  }

  return (
    <div className="relative space-y-6 animate-fade-in-up">
      {!isActivated && !isAdmin && (
        <div className="absolute inset-0 z-20 lock-overlay rounded-xl flex flex-col items-center justify-center gap-4">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-card border-2 border-border flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-lg font-display font-bold text-foreground mb-2">
              Locked
            </h3>
            <p className="text-muted-foreground text-sm">
              Activate panel to view account statement
            </p>
          </div>
        </div>
      )}

      <div
        className={
          !isActivated && !isAdmin ? "pointer-events-none opacity-50" : ""
        }
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-foreground">
              Account Statement
            </h2>
            <p className="text-muted-foreground text-sm">
              {recentSessions.length} session
              {recentSessions.length !== 1 ? "s" : ""} — last 30 days
            </p>
          </div>
        </div>

        {/* Sessions List */}
        {!isAdmin ? (
          <div
            className="bg-card border border-border rounded-xl text-center py-16 text-muted-foreground"
            data-ocid="account_statement.empty_state"
          >
            <Lock className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium">No statements available.</p>
          </div>
        ) : recentSessions.length === 0 ? (
          <div
            className="bg-card border border-border rounded-xl text-center py-16 text-muted-foreground"
            data-ocid="account_statement.empty_state"
          >
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium">No statements yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Statements are created each time you turn a fund ON and OFF
            </p>
          </div>
        ) : (
          <div className="space-y-2" data-ocid="account_statement.list">
            {recentSessions.map((s, i) => {
              const txnCount = getSessionTxnCount(s);
              const totals = getSessionTotals(s);
              const startDate = new Date(s.startedAt).toLocaleDateString(
                "en-IN",
                { day: "2-digit", month: "short", year: "numeric" },
              );
              const startTime = new Date(s.startedAt).toLocaleTimeString(
                "en-IN",
                { hour: "2-digit", minute: "2-digit", hour12: true },
              );
              const endDate = s.endedAt
                ? new Date(s.endedAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : null;
              const endTime = s.endedAt
                ? new Date(s.endedAt).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                : null;

              return (
                <button
                  key={s.id}
                  type="button"
                  className="w-full bg-card border border-border hover:border-primary/40 rounded-xl p-4 text-left transition-all hover:bg-secondary/20 group"
                  onClick={() => setSelectedSession(s)}
                  data-ocid={`account_statement.item.${i + 1}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-foreground">
                          {s.bankName}
                        </p>
                        <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                          {s.accountNumber}
                        </span>
                        <span className="text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded uppercase tracking-wide">
                          {FUND_CONFIG[s.fundType]?.label?.replace(
                            " Fund",
                            "",
                          ) ?? s.fundType}
                        </span>
                        {s.endedAt ? (
                          <span className="text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                            OFFLINE
                          </span>
                        ) : (
                          <span className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            Active
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>
                          {startDate} {startTime}
                        </span>
                        {endDate && (
                          <>
                            <span className="text-muted-foreground/40">→</span>
                            <span>
                              {endDate} {endTime}
                            </span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-muted-foreground/70">
                          {txnCount} transactions
                        </span>
                        {totals.credit > 0 && (
                          <span className="text-xs text-emerald-400 flex items-center gap-0.5">
                            <ArrowDownLeft className="w-3 h-3" />
                            {formatCurrency(totals.credit)}
                          </span>
                        )}
                        {totals.debit > 0 && (
                          <span className="text-xs text-red-400 flex items-center gap-0.5">
                            <ArrowUpRight className="w-3 h-3" />
                            {formatCurrency(totals.debit)}
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors flex-shrink-0" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedSession && (
        <SessionStatementDialog
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  );
}
