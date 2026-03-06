import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FUND_CONFIG,
  type LiveTransaction,
  formatCurrency,
  getLiveTransactions,
} from "@/lib/storage";
import { Activity, Download } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type FundKey = "gaming" | "stock" | "political" | "mix";

function FundTransactionFeed({ fundType }: { fundType: FundKey }) {
  const [transactions, setTransactions] = useState<LiveTransaction[]>([]);
  const [pulse, setPulse] = useState(false);

  const fetch = useCallback(() => {
    const all = getLiveTransactions();
    setTransactions(
      all
        .filter((t) => t.fundType === fundType)
        .slice(-100)
        .reverse(),
    );
  }, [fundType]);

  useEffect(() => {
    fetch();
    const interval = setInterval(() => {
      fetch();
      setPulse(true);
      setTimeout(() => setPulse(false), 500);
    }, 2500);
    return () => clearInterval(interval);
  }, [fetch]);

  return (
    <div className="max-h-[450px] overflow-y-auto">
      {transactions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Waiting for transactions...</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {transactions.map((txn, i) => (
            <div
              key={txn.id}
              className={`flex items-center justify-between px-4 py-3 hover:bg-secondary/20 transition-colors ${i === 0 ? "animate-slide-in" : ""}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${txn.type === "credit" ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}
                >
                  {txn.type === "credit" ? "C" : "D"}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {txn.type === "credit"
                      ? "Amount Credited"
                      : "Amount Debited"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(txn.timestamp).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true,
                    })}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-3">
                <p
                  className={`font-bold tabular-nums text-sm ${txn.type === "credit" ? "text-green-400" : "text-red-400"}`}
                >
                  {txn.type === "credit" ? "+" : "-"}
                  {formatCurrency(txn.amount)}
                </p>
                <p
                  className={`text-xs font-medium mt-0.5 ${txn.type === "credit" ? "text-green-500/70" : "text-red-500/70"}`}
                >
                  {txn.type === "credit" ? "CREDITED" : "DEBITED"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* suppress pulse warning */}
      <span className="hidden">{pulse ? "p" : ""}</span>
    </div>
  );
}

function downloadBankStatement() {
  const allTxns = getLiveTransactions()
    .slice()
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  let totalCredit = 0;
  let totalDebit = 0;

  const rows = allTxns
    .map((txn, i) => {
      const d = new Date(txn.timestamp);
      const txnDate = d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      const txnTime = d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      const refNum = txn.id.toUpperCase().replace(/-/g, "").slice(0, 16);
      const fundLabel = FUND_CONFIG[txn.fundType]?.label ?? txn.fundType;
      const amtStr = formatCurrency(txn.amount);
      const isCredit = txn.type === "credit";
      if (isCredit) totalCredit += txn.amount;
      else totalDebit += txn.amount;

      return `<tr style="background:${i % 2 === 0 ? "#fff" : "#f9fafb"}">
        <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:center;color:#6b7280;font-size:12px">${i + 1}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;font-size:12px">${txnDate}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;font-size:12px">${txnTime}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;font-size:12px">${fundLabel} — ${isCredit ? "Amount Credited" : "Amount Debited"}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:right;color:#dc2626;font-weight:600;font-size:12px">${isCredit ? "" : amtStr}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:right;color:#16a34a;font-weight:600;font-size:12px">${isCredit ? amtStr : ""}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;font-family:monospace;font-size:11px;color:#6b7280">${refNum}</td>
      </tr>`;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Kuber Panel — Account Statement</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; background: #fff; color: #111; padding: 32px; }
    .header { border-bottom: 3px solid #c8940a; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
    .header-left h1 { font-size: 22px; font-weight: 800; color: #c8940a; letter-spacing: 2px; }
    .header-left p { font-size: 12px; color: #666; margin-top: 2px; }
    .header-right { text-align: right; }
    .header-right p { font-size: 12px; color: #555; }
    .account-info { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .account-info .field { }
    .account-info .field label { font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; }
    .account-info .field p { font-size: 13px; font-weight: 600; color: #111; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { background: #1a1a1a; color: #c8940a; padding: 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; text-align: left; }
    th:nth-child(5), th:nth-child(6) { text-align: right; }
    .summary { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 18px; display: flex; justify-content: space-between; margin-bottom: 20px; }
    .summary-item label { font-size: 11px; color: #9ca3af; text-transform: uppercase; }
    .summary-item p { font-size: 16px; font-weight: 800; margin-top: 2px; }
    .summary-item.credit p { color: #16a34a; }
    .summary-item.debit p { color: #dc2626; }
    .footer { border-top: 1px solid #e5e7eb; padding-top: 14px; text-align: center; font-size: 11px; color: #9ca3af; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-left">
      <h1>KUBER PANEL</h1>
      <p>Financial Management Platform — Account Statement</p>
    </div>
    <div class="header-right">
      <p>Generated: ${dateStr} at ${timeStr}</p>
      <p>Statement Period: All Transactions</p>
    </div>
  </div>

  <div class="account-info">
    <div class="field"><label>Account Name</label><p>Kuber Panel</p></div>
    <div class="field"><label>Statement Type</label><p>Live Fund Activity</p></div>
    <div class="field"><label>Total Transactions</label><p>${allTxns.length}</p></div>
    <div class="field"><label>Currency</label><p>INR (₹)</p></div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:40px">SR</th>
        <th>Date</th>
        <th>Time</th>
        <th>Description</th>
        <th style="text-align:right">Debit (DR)</th>
        <th style="text-align:right">Credit (CR)</th>
        <th>Reference No.</th>
      </tr>
    </thead>
    <tbody>
      ${rows || '<tr><td colspan="7" style="text-align:center;padding:20px;color:#9ca3af">No transactions found</td></tr>'}
    </tbody>
  </table>

  <div class="summary">
    <div class="summary-item credit">
      <label>Total Credits</label>
      <p>${formatCurrency(totalCredit)}</p>
    </div>
    <div class="summary-item debit">
      <label>Total Debits</label>
      <p>${formatCurrency(totalDebit)}</p>
    </div>
    <div class="summary-item">
      <label>Net Amount</label>
      <p style="color:${totalCredit - totalDebit >= 0 ? "#16a34a" : "#dc2626"}">${formatCurrency(Math.abs(totalCredit - totalDebit))}</p>
    </div>
  </div>

  <div class="footer">
    <p>This is a computer-generated statement. No signature required.</p>
    <p>© ${new Date().getFullYear()} Kuber Panel. All rights reserved.</p>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `KuberPanel-Statement-${Date.now()}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast.success("Bank statement downloaded!");
}

export function AdminLiveFunds() {
  const [activeFund, setActiveFund] = useState<FundKey>("gaming");

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-foreground">
              Live Fund Activity
            </h2>
            <p className="text-muted-foreground text-sm">
              Real-time transactions across all funds
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={downloadBankStatement}
            className="gap-2 border-primary/40 text-primary hover:bg-primary/10 hover:border-primary font-semibold text-xs"
            data-ocid="admin_live_funds.download_statement_button"
          >
            <Download className="w-3.5 h-3.5" />
            Download Statement
          </Button>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-green-400 font-medium">Live</span>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden card-glow">
        <Tabs
          value={activeFund}
          onValueChange={(v) => setActiveFund(v as FundKey)}
        >
          <TabsList className="grid grid-cols-4 bg-secondary rounded-none border-b border-border">
            {(
              Object.entries(FUND_CONFIG) as [
                FundKey,
                (typeof FUND_CONFIG)[FundKey],
              ][]
            ).map(([key, config]) => (
              <TabsTrigger
                key={key}
                value={key}
                className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-none text-xs sm:text-sm"
              >
                {config.label.replace(" Fund", "")}
              </TabsTrigger>
            ))}
          </TabsList>

          {(Object.keys(FUND_CONFIG) as FundKey[]).map((key) => (
            <TabsContent key={key} value={key} className="m-0">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">
                  {FUND_CONFIG[key].label}
                </span>
                <span className="text-xs text-primary font-bold">
                  {FUND_CONFIG[key].percentage}% Commission
                </span>
              </div>
              <FundTransactionFeed fundType={key} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
