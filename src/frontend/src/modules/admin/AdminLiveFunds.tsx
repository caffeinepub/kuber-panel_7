import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FUND_CONFIG,
  type LiveTransaction,
  formatCurrency,
  getLiveTransactions,
} from "@/lib/storage";
import { Activity } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

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
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm text-green-400 font-medium">Live</span>
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
