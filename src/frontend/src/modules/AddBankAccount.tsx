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
  formatDate,
  getBankAccounts,
  getSession,
  setBankAccounts,
} from "@/lib/storage";
import { Building2, Power } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function AddBankAccount() {
  const session = getSession();
  const [refreshKey, setRefreshKey] = useState(0);

  const userAccounts = getBankAccounts().filter(
    (a) => a.userId === session?.userId && a.fundType === "general",
  );

  const handleSuccess = () => setRefreshKey((k) => k + 1);

  const toggleTransaction = (accountId: string, currentEnabled: boolean) => {
    const allAccounts = getBankAccounts();
    const updated = allAccounts.map((acc) => {
      if (acc.userId === session?.userId && acc.fundType === "general") {
        if (acc.id === accountId) {
          return { ...acc, transactionEnabled: !currentEnabled };
        }
        return { ...acc, transactionEnabled: false };
      }
      return acc;
    });
    setBankAccounts(updated);
    setRefreshKey((k) => k + 1);
    if (!currentEnabled) {
      toast.success(
        "Transaction ON - yeh bank account Live Fund Activity mein active hoga!",
      );
    } else {
      toast.info("Transaction OFF - bank account band kar diya gaya.");
    }
  };

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
            History - Approved accounts mein Transaction ON karo Live Fund
            Activity ke liye
          </p>
        </div>
        <AccountTable accounts={userAccounts} key={refreshKey} />
      </div>
    </div>
  );
}
