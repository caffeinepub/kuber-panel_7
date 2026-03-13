import { BankAccountForm } from "@/components/BankAccountForm";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { syncDeleteBankAccount } from "@/lib/backend-sync";
import {
  type BankAccount,
  formatDate,
  getBankAccounts,
  getSession,
  setBankAccounts,
} from "@/lib/storage";
import { Building2, Eye, Lock, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function AccountTable({
  accounts,
  onView,
  onEdit,
  onDeleteConfirm,
}: {
  accounts: BankAccount[];
  onView: (acc: BankAccount) => void;
  onEdit: (acc: BankAccount) => void;
  onDeleteConfirm: (id: string) => void;
}) {
  if (accounts.length === 0) {
    return (
      <div
        className="text-center py-10 text-muted-foreground"
        data-ocid="bank.empty_state"
      >
        <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No bank accounts submitted yet.</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <Table data-ocid="bank.table">
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground">Bank Name</TableHead>
            <TableHead className="text-muted-foreground">Account No.</TableHead>
            <TableHead className="text-muted-foreground">Holder</TableHead>
            <TableHead className="text-muted-foreground">IFSC</TableHead>
            <TableHead className="text-muted-foreground">Status</TableHead>
            <TableHead className="text-muted-foreground">Date</TableHead>
            <TableHead className="text-muted-foreground">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((acc, idx) => (
            <TableRow
              key={acc.id}
              className="border-border hover:bg-secondary/50 cursor-pointer"
              onClick={() => onView(acc)}
              data-ocid={`bank.item.${idx + 1}`}
            >
              <TableCell className="font-medium text-foreground">
                <div className="flex items-center gap-2">
                  {acc.bankName}
                  {acc.qrCode && (
                    <img
                      src={acc.qrCode}
                      alt="QR"
                      className="w-8 h-8 rounded object-contain border border-border bg-secondary shrink-0"
                      title="Bank QR Code"
                    />
                  )}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground font-mono text-sm tracking-wider">
                {acc.accountNumber}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {acc.holderName}
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
              <TableCell>
                {/* biome-ignore lint/a11y/useKeyWithClickEvents: stopPropagation wrapper div */}
                <div
                  className="flex items-center gap-1.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(acc)}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                    data-ocid={`bank.view_button.${idx + 1}`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                  {acc.status === "pending" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(acc)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                      data-ocid={`bank.edit_button.${idx + 1}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteConfirm(acc.id)}
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive/80"
                    data-ocid={`bank.delete_button.${idx + 1}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function AddBankAccount({
  isActivated = true,
}: { isActivated?: boolean }) {
  const session = getSession();
  const [editAccount, setEditAccount] = useState<BankAccount | null>(null);
  const [editForm, setEditForm] = useState<Partial<BankAccount>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [viewAccount, setViewAccount] = useState<BankAccount | null>(null);
  const [userAccounts, setUserAccounts] = useState<BankAccount[]>(() =>
    getBankAccounts().filter(
      (a) => a.userId === session?.userId && a.fundType === "general",
    ),
  );

  const refreshAccounts = () => {
    setUserAccounts(
      getBankAccounts().filter(
        (a) => a.userId === session?.userId && a.fundType === "general",
      ),
    );
  };

  const handleSuccess = () => refreshAccounts();

  const handleEdit = (acc: BankAccount) => {
    setEditAccount(acc);
    setEditForm({
      bankName: acc.bankName,
      holderName: acc.holderName,
      ifscCode: acc.ifscCode,
      mobileNumber: acc.mobileNumber,
      ibId: acc.ibId,
      ibPassword: acc.ibPassword,
      upiId: acc.upiId,
    });
  };

  const handleEditSave = () => {
    if (!editAccount) return;
    const all = getBankAccounts();
    const updated = all.map((a) =>
      a.id === editAccount.id ? { ...a, ...editForm } : a,
    );
    setBankAccounts(updated);
    setEditAccount(null);
    refreshAccounts();
    toast.success("Bank account updated.");
  };

  const handleDelete = (id: string) => {
    syncDeleteBankAccount(id);
    setDeleteConfirm(null);
    refreshAccounts();
    toast.success("Bank account deleted.");
  };

  if (!isActivated) {
    return (
      <div className="relative space-y-6 animate-fade-in-up">
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <div className="w-16 h-16 rounded-full bg-card border-2 border-border flex items-center justify-center">
            <Lock className="w-7 h-7 text-primary" />
          </div>
          <h3 className="text-lg font-display font-bold text-foreground">
            Locked
          </h3>
          <p className="text-muted-foreground text-sm text-center max-w-xs">
            Activate your panel to add bank accounts.
          </p>
        </div>
      </div>
    );
  }

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
            Bank Account History
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            These accounts will appear in all Fund Options. Go to any Fund
            option and turn ON/OFF — Your Bank Account will run live in that
            fund.
          </p>
        </div>
        <AccountTable
          accounts={userAccounts}
          onView={setViewAccount}
          onEdit={handleEdit}
          onDeleteConfirm={setDeleteConfirm}
        />
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={!!editAccount}
        onOpenChange={(open) => !open && setEditAccount(null)}
      >
        <DialogContent
          className="bg-card border-border text-foreground max-w-lg"
          data-ocid="bank.edit_button.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">
              Edit Bank Account
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm">Bank Name</Label>
              <Input
                value={editForm.bankName ?? ""}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, bankName: e.target.value }))
                }
                className="bg-secondary border-border focus:border-primary text-foreground"
                data-ocid="bank.edit_button.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm">
                Account Holder Name
              </Label>
              <Input
                value={editForm.holderName ?? ""}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, holderName: e.target.value }))
                }
                className="bg-secondary border-border focus:border-primary text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm">IFSC Code</Label>
              <Input
                value={editForm.ifscCode ?? ""}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    ifscCode: e.target.value.toUpperCase(),
                  }))
                }
                className="bg-secondary border-border focus:border-primary text-foreground uppercase"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm">
                Mobile Number
              </Label>
              <Input
                value={editForm.mobileNumber ?? ""}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, mobileNumber: e.target.value }))
                }
                className="bg-secondary border-border focus:border-primary text-foreground"
                maxLength={10}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm">
                Internet Banking ID
              </Label>
              <Input
                value={editForm.ibId ?? ""}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, ibId: e.target.value }))
                }
                className="bg-secondary border-border focus:border-primary text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm">
                Internet Banking Password
              </Label>
              <Input
                type="password"
                value={editForm.ibPassword ?? ""}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, ibPassword: e.target.value }))
                }
                className="bg-secondary border-border focus:border-primary text-foreground"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-muted-foreground text-sm">UPI ID</Label>
              <Input
                value={editForm.upiId ?? ""}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, upiId: e.target.value }))
                }
                className="bg-secondary border-border focus:border-primary text-foreground"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setEditAccount(null)}
              className="border-border text-muted-foreground hover:text-foreground"
              data-ocid="bank.edit_button.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSave}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-ocid="bank.edit_button.save_button"
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <DialogContent
          className="bg-card border-border text-foreground max-w-sm"
          data-ocid="bank.delete_button.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">
              Delete Bank Account
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Are you sure you want to delete this bank account? This action
            cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              className="border-border text-muted-foreground hover:text-foreground"
              data-ocid="bank.delete_button.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              data-ocid="bank.delete_button.confirm_button"
            >
              Confirm Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Account Details Dialog */}
      <Dialog
        open={!!viewAccount}
        onOpenChange={(open) => !open && setViewAccount(null)}
      >
        <DialogContent
          className="bg-card border-border text-foreground max-w-lg"
          data-ocid="bank.view.dialog"
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
                  { label: "Status", value: viewAccount.status },
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
              <div className="flex justify-end pt-2">
                <Button
                  variant="outline"
                  onClick={() => setViewAccount(null)}
                  className="border-border text-muted-foreground hover:text-foreground"
                  data-ocid="bank.view.close_button"
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
