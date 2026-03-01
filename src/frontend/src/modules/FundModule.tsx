import { BankAccountForm } from "@/components/BankAccountForm";
import { StatusBadge } from "@/components/StatusBadge";
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
} from "@/lib/storage";
import { Lock, TrendingUp } from "lucide-react";
import { useState } from "react";

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
  void refreshKey;

  const userAccounts = getBankAccounts().filter(
    (a) => a.userId === session?.userId && a.fundType === fundType,
  );

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
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((acc) => (
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
              </TableRow>
            ))}
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
                {config.percentage}% Returns
              </span>
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              Submit bank details to start earning {config.percentage}% returns
            </p>
          </div>
        </div>

        {/* Fund Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Return Rate", value: `${config.percentage}%` },
            { label: "Processing", value: "24-48 hrs" },
            { label: "Min. Deposit", value: "₹5,000" },
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
              Submitted Accounts
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {config.label} bank account history
            </p>
          </div>
          <AccountTable accounts={userAccounts} />
        </div>
      </div>
    </div>
  );
}
