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
  FUND_CONFIG,
  formatDate,
  getBankAccounts,
  getUsers,
  setBankAccounts,
} from "@/lib/storage";
import { Building2, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function BankApproval() {
  const [refreshKey, setRefreshKey] = useState(0);
  void refreshKey;

  const accounts = getBankAccounts();
  const users = getUsers();

  const getUserEmail = (userId: string) => {
    const u = users.find((u) => u.id === userId);
    return u?.email ?? userId;
  };

  const getFundLabel = (fundType: string) => {
    if (fundType === "general") return "General";
    return FUND_CONFIG[fundType as keyof typeof FUND_CONFIG]?.label ?? fundType;
  };

  const handleApprove = (id: string) => {
    const updated = getBankAccounts().map((a) =>
      a.id === id ? { ...a, status: "approved" as const } : a,
    );
    setBankAccounts(updated);
    setRefreshKey((k) => k + 1);
    toast.success("Bank account approved!");
  };

  const handleReject = (id: string) => {
    const updated = getBankAccounts().map((a) =>
      a.id === id ? { ...a, status: "rejected" as const } : a,
    );
    setBankAccounts(updated);
    setRefreshKey((k) => k + 1);
    toast.error("Bank account rejected.");
  };

  const pending = accounts.filter((a) => a.status === "pending");
  const all = [...accounts].reverse();

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">
            Bank Account Approval
          </h2>
          <p className="text-muted-foreground text-sm">
            Review and approve user bank accounts
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Pending",
            value: accounts.filter((a) => a.status === "pending").length,
            cls: "text-warning",
          },
          {
            label: "Approved",
            value: accounts.filter((a) => a.status === "approved").length,
            cls: "text-success",
          },
          {
            label: "Rejected",
            value: accounts.filter((a) => a.status === "rejected").length,
            cls: "text-destructive",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-card border border-border rounded-xl p-4 text-center"
          >
            <p className={`text-2xl font-display font-bold ${s.cls}`}>
              {s.value}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pending section */}
      {pending.length > 0 && (
        <div className="bg-card border border-warning/30 rounded-xl overflow-hidden card-glow">
          <div className="px-6 py-4 border-b border-warning/30 bg-warning/5">
            <h3 className="text-base font-semibold text-warning">
              Pending Approvals ({pending.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">User</TableHead>
                  <TableHead className="text-muted-foreground">Bank</TableHead>
                  <TableHead className="text-muted-foreground">
                    Account
                  </TableHead>
                  <TableHead className="text-muted-foreground">Fund</TableHead>
                  <TableHead className="text-muted-foreground">Date</TableHead>
                  <TableHead className="text-muted-foreground">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.map((acc) => (
                  <TableRow
                    key={acc.id}
                    className="border-border hover:bg-secondary/50"
                  >
                    <TableCell className="text-muted-foreground text-sm">
                      {getUserEmail(acc.userId)}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {acc.bankName}
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-sm">
                      ••••{acc.accountNumber.slice(-4)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {getFundLabel(acc.fundType)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(acc.submittedAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleApprove(acc.id)}
                          className="text-success hover:bg-success/10 h-7 px-2"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReject(acc.id)}
                          className="text-destructive hover:bg-destructive/10 h-7 px-2"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* All accounts */}
      <div className="bg-card border border-border rounded-xl overflow-hidden card-glow">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-base font-semibold text-foreground">
            All Bank Accounts
          </h3>
        </div>
        {all.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No bank accounts submitted yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">User</TableHead>
                  <TableHead className="text-muted-foreground">Bank</TableHead>
                  <TableHead className="text-muted-foreground">
                    Holder
                  </TableHead>
                  <TableHead className="text-muted-foreground">Fund</TableHead>
                  <TableHead className="text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="text-muted-foreground">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {all.map((acc) => (
                  <TableRow
                    key={acc.id}
                    className="border-border hover:bg-secondary/50"
                  >
                    <TableCell className="text-muted-foreground text-sm">
                      {getUserEmail(acc.userId)}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {acc.bankName}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {acc.holderName}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {getFundLabel(acc.fundType)}
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
        )}
      </div>
    </div>
  );
}
