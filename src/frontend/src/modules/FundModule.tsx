import { BankAccountForm } from "@/components/BankAccountForm";
import { StatusBadge } from "@/components/StatusBadge";
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
  type BankAccount,
  FUND_CONFIG,
  formatDate,
  getBankAccounts,
  getSession,
  setBankAccounts,
} from "@/lib/storage";
import { Lock, Power, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type FundType = "gaming" | "stock" | "political" | "mix";

interface FundModuleProps {
  fundType: FundType;
  isActivated: boolean;
}

const FUND_ICONS: Record<FundType, string> = {
  gaming: "🎮",
  stock: "📈",
  political: "🏛️",
  mix: "🔀",
};

export function FundModule({ fundType, isActivated }: FundModuleProps) {
  const session = getSession();
  const config = FUND_CONFIG[fundType];
  const [refreshKey, setRefreshKey] = useState(0);

  const userAccounts = getBankAccounts().filter(
    (a) => a.userId === session?.userId && a.fundType === fundType,
  );

  // Toggle transaction on/off for a bank account
  const toggleTransaction = (accountId: string, currentEnabled: boolean) => {
    const allAccounts = getBankAccounts();

    // If turning ON, turn OFF all other accounts in same fund for this user
    const updated = allAccounts.map((acc) => {
      if (acc.userId === session?.userId && acc.fundType === fundType) {
        if (acc.id === accountId) {
          return { ...acc, transactionEnabled: !currentEnabled };
        }
        // Turn off all others in same fund
        return { ...acc, transactionEnabled: false };
      }
      return acc;
    });

    setBankAccounts(updated);
    setRefreshKey((k) => k + 1);

    if (!currentEnabled) {
      toast.success(
        `Transaction ON - ${config.label} ab Live Fund Activity mein run hoga!`,
      );
    } else {
      toast.info(`Transaction OFF - ${config.label} band kar diya gaya.`);
    }
  };

  const AccountTable = ({ accounts }: { accounts: BankAccount[] }) => {
    if (accounts.length === 0) {
      return (
        <div className="text-center py-10 text-muted-foreground">
          <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No bank accounts for this fund yet.</p>
        </div>
      );
    }
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Bank Name</TableHead>
              <TableHead className="text-muted-foreground">
                Account No.
              </TableHead>
              <TableHead className="text-muted-foreground">IFSC</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Date</TableHead>
              <TableHead className="text-muted-foreground text-center">
                Transaction
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((acc) => {
              const isEnabled = acc.transactionEnabled === true;
              const isApproved = acc.status === "approved";
              return (
                <TableRow
                  key={acc.id}
                  className="border-border hover:bg-secondary/50"
                >
                  <TableCell className="font-medium text-foreground">
                    {acc.bankName}
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-sm">
                    ••••{acc.accountNumber.slice(-4)}
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-sm">
                    {acc.ifscCode}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={acc.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(acc.submittedAt)}
                  </TableCell>
                  <TableCell className="text-center">
                    {isApproved ? (
                      <Button
                        size="sm"
                        variant={isEnabled ? "default" : "outline"}
                        onClick={() => toggleTransaction(acc.id, isEnabled)}
                        className={`gap-1.5 text-xs h-7 px-3 font-semibold transition-all ${
                          isEnabled
                            ? "bg-green-500 hover:bg-green-600 text-white border-green-500"
                            : "border-muted-foreground/40 text-muted-foreground hover:border-green-500 hover:text-green-400"
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        {isEnabled ? "ON" : "OFF"}
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground/50 italic">
                        {acc.status === "pending"
                          ? "Pending approval"
                          : "Rejected"}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="relative space-y-6 animate-fade-in-up">
      {/* Lock overlay for unactivated users */}
      {!isActivated && (
        <div className="absolute inset-0 z-20 lock-overlay rounded-xl flex flex-col items-center justify-center gap-4">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-card border-2 border-border flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-lg font-display font-bold text-foreground mb-2">
              Fund Locked
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Activate your panel to access the {config.label}
            </p>
          </div>
        </div>
      )}

      <div className={!isActivated ? "pointer-events-none opacity-50" : ""}>
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-2xl">
            {FUND_ICONS[fundType]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-display font-bold text-foreground">
                {config.label}
              </h2>
              <span className="inline-flex items-center gap-1 bg-primary/20 text-primary border border-primary/30 text-sm font-bold px-3 py-0.5 rounded-full">
                {config.percentage}% Commission
              </span>
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              Submit bank details to start earning {config.percentage}%
              commission
            </p>
          </div>
        </div>

        {/* Fund Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Commission Rate", value: `${config.percentage}%` },
            { label: "Activation Bank Account", value: "10 min" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-lg p-3 text-center"
            >
              <p className="text-lg font-display font-bold text-primary">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="bg-card border border-border rounded-xl p-6 card-glow">
          <h3 className="text-base font-semibold text-foreground mb-4">
            Link Bank Account to {config.label}
          </h3>
          <BankAccountForm
            fundType={fundType}
            onSuccess={() => setRefreshKey((k) => k + 1)}
          />
        </div>

        {/* History */}
        <div className="bg-card border border-border rounded-xl overflow-hidden card-glow">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-base font-semibold text-foreground">
              Fund Account History
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {config.label} - Approved accounts mein Transaction ON karo Live
              Fund Activity ke liye
            </p>
          </div>
          <AccountTable accounts={userAccounts} key={refreshKey} />
        </div>
      </div>
    </div>
  );
}
