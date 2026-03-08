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
import { syncUpdateBankAccountStatus } from "@/lib/backend-sync";
import {
  type BankAccount,
  FUND_CONFIG,
  formatDate,
  getBankAccounts,
  getUsers,
} from "@/lib/storage";
import { Building2, CheckCircle2, Clock, Eye, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function BankApproval() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewAccount, setViewAccount] = useState<BankAccount | null>(null);
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
    syncUpdateBankAccountStatus(id, "approved");
    setRefreshKey((k) => k + 1);
    toast.success("Bank account approved!");
  };

  const handleReject = (id: string) => {
    syncUpdateBankAccountStatus(id, "rejected");
    setRefreshKey((k) => k + 1);
    toast.error("Bank account rejected.");
  };

  const pending = accounts.filter((a) => a.status === "pending");
  const approved = accounts.filter((a) => a.status === "approved");
  const rejected = accounts.filter((a) => a.status === "rejected");

  const AccountTable = ({
    list,
    showActions,
  }: { list: BankAccount[]; showActions?: boolean }) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground">User</TableHead>
            <TableHead className="text-muted-foreground">Bank</TableHead>
            <TableHead className="text-muted-foreground">Account</TableHead>
            <TableHead className="text-muted-foreground">Holder</TableHead>
            <TableHead className="text-muted-foreground">Fund</TableHead>
            <TableHead className="text-muted-foreground">Date</TableHead>
            <TableHead className="text-muted-foreground">View</TableHead>
            {showActions && (
              <TableHead className="text-muted-foreground">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.map((acc) => (
            <TableRow
              key={acc.id}
              className="border-border hover:bg-secondary/50 cursor-pointer"
              onClick={() => setViewAccount(acc)}
            >
              <TableCell className="text-muted-foreground text-sm">
                {getUserEmail(acc.userId)}
              </TableCell>
              <TableCell className="font-medium text-foreground">
                {acc.bankName}
              </TableCell>
              <TableCell className="text-muted-foreground font-mono text-sm">
                {acc.accountNumber}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {acc.holderName}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {getFundLabel(acc.fundType)}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatDate(acc.submittedAt)}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewAccount(acc);
                  }}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                >
                  <Eye className="w-3.5 h-3.5" />
                </Button>
              </TableCell>
              {showActions && (
                <TableCell>
                  {/* biome-ignore lint/a11y/useKeyWithClickEvents: stopPropagation wrapper div */}
                  <div
                    className="flex items-center gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
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
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

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
            value: pending.length,
            cls: "text-warning",
          },
          {
            label: "Approved",
            value: approved.length,
            cls: "text-success",
          },
          {
            label: "Rejected",
            value: rejected.length,
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
      <div className="bg-card border border-warning/30 rounded-xl overflow-hidden card-glow">
        <div className="px-6 py-4 border-b border-warning/30 bg-warning/5 flex items-center gap-2">
          <Clock className="w-4 h-4 text-warning" />
          <h3 className="text-base font-semibold text-warning">
            Pending Approval
          </h3>
          <span className="ml-auto text-xs bg-warning/10 text-warning px-2 py-0.5 rounded-full">
            {pending.length}
          </span>
        </div>
        {pending.length === 0 ? (
          <div
            className="text-center py-8 text-muted-foreground"
            data-ocid="bank_approval.pending.empty_state"
          >
            <p className="text-sm">No pending approvals</p>
          </div>
        ) : (
          <AccountTable list={pending} showActions />
        )}
      </div>

      {/* Approved section */}
      <div className="bg-card border border-success/30 rounded-xl overflow-hidden card-glow">
        <div className="px-6 py-4 border-b border-success/30 bg-success/5 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-success" />
          <h3 className="text-base font-semibold text-success">
            Approved Accounts
          </h3>
          <span className="ml-auto text-xs bg-success/10 text-success px-2 py-0.5 rounded-full">
            {approved.length}
          </span>
        </div>
        {approved.length === 0 ? (
          <div
            className="text-center py-8 text-muted-foreground"
            data-ocid="bank_approval.approved.empty_state"
          >
            <p className="text-sm">No approved accounts</p>
          </div>
        ) : (
          <AccountTable list={[...approved].reverse()} />
        )}
      </div>

      {/* Rejected section */}
      <div className="bg-card border border-destructive/30 rounded-xl overflow-hidden card-glow">
        <div className="px-6 py-4 border-b border-destructive/30 bg-destructive/5 flex items-center gap-2">
          <XCircle className="w-4 h-4 text-destructive" />
          <h3 className="text-base font-semibold text-destructive">
            Rejected Accounts
          </h3>
          <span className="ml-auto text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
            {rejected.length}
          </span>
        </div>
        {rejected.length === 0 ? (
          <div
            className="text-center py-8 text-muted-foreground"
            data-ocid="bank_approval.rejected.empty_state"
          >
            <p className="text-sm">No rejected accounts</p>
          </div>
        ) : (
          <AccountTable list={[...rejected].reverse()} />
        )}
      </div>

      {/* View Bank Account Details Dialog */}
      <Dialog
        open={!!viewAccount}
        onOpenChange={(open) => !open && setViewAccount(null)}
      >
        <DialogContent
          className="bg-card border-border text-foreground max-w-lg"
          data-ocid="bank_approval.view.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Bank Account Details
            </DialogTitle>
          </DialogHeader>
          {viewAccount && (
            <div className="space-y-3 py-1">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: "User", value: getUserEmail(viewAccount.userId) },
                  { label: "Bank Name", value: viewAccount.bankName },
                  {
                    label: "Account Number",
                    value: viewAccount.accountNumber,
                    mono: true,
                  },
                  { label: "Holder Name", value: viewAccount.holderName },
                  {
                    label: "IFSC Code",
                    value: viewAccount.ifscCode,
                    mono: true,
                  },
                  { label: "Mobile Number", value: viewAccount.mobileNumber },
                  {
                    label: "Internet Banking ID",
                    value: viewAccount.ibId || "—",
                  },
                  { label: "UPI ID", value: viewAccount.upiId || "—" },
                  {
                    label: "Fund Type",
                    value: getFundLabel(viewAccount.fundType),
                  },
                  {
                    label: "Status",
                    value: viewAccount.status.toUpperCase(),
                  },
                  {
                    label: "Submitted",
                    value: formatDate(viewAccount.submittedAt),
                  },
                ].map(({ label, value, mono }) => (
                  <div key={label}>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      {label}
                    </p>
                    <p
                      className={`text-foreground font-medium text-sm ${mono ? "font-mono tracking-wider" : ""}`}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>
              {viewAccount.ibPassword && (
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">
                    Internet Banking Password
                  </p>
                  <p className="text-foreground font-mono text-sm">••••••••</p>
                </div>
              )}
              {viewAccount.qrCode && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">
                    Bank QR Code
                  </p>
                  <img
                    src={viewAccount.qrCode}
                    alt="Bank QR Code"
                    className="w-32 h-32 rounded-lg object-contain border border-border bg-white p-1"
                  />
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                {viewAccount.status === "pending" && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => {
                        handleApprove(viewAccount.id);
                        setViewAccount(null);
                      }}
                      className="bg-success/20 text-success hover:bg-success/30 border border-success/40 gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        handleReject(viewAccount.id);
                        setViewAccount(null);
                      }}
                      className="gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  onClick={() => setViewAccount(null)}
                  className="border-border text-muted-foreground hover:text-foreground"
                  data-ocid="bank_approval.view.close_button"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
