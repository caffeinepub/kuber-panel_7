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
  formatDate,
  getBankAccounts,
  getSession,
} from "@/lib/storage";
import { Building2 } from "lucide-react";
import { useState } from "react";

export function AddBankAccount() {
  const session = getSession();
  const [refreshKey, setRefreshKey] = useState(0);

  const userAccounts = getBankAccounts().filter(
    (a) => a.userId === session?.userId && a.fundType === "general",
  );

  const handleSuccess = () => setRefreshKey((k) => k + 1);

  // suppress unused var warning - refreshKey is used as key
  void refreshKey;

  const AccountTable = ({ accounts }: { accounts: BankAccount[] }) => {
    if (accounts.length === 0) {
      return (
        <div className="text-center py-10 text-muted-foreground">
          <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No bank accounts submitted yet.</p>
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
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">
            Add Bank Account
          </h2>
          <p className="text-muted-foreground text-sm">
            Submit your bank details for approval
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 card-glow">
        <h3 className="text-base font-semibold text-foreground mb-4">
          Bank Account Details
        </h3>
        <BankAccountForm fundType="general" onSuccess={handleSuccess} />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden card-glow">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-base font-semibold text-foreground">
            Submitted Accounts
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            History of your submitted bank accounts
          </p>
        </div>
        <AccountTable accounts={userAccounts} />
      </div>
    </div>
  );
}
