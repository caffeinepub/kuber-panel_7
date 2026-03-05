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
import { syncActivateUser, syncDeactivateUser } from "@/lib/backend-sync";
import {
  type BankAccount,
  type User,
  getBankAccounts,
  getUsers,
} from "@/lib/storage";
import { CheckCircle2, Eye, Users, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function UserManagement() {
  const [users, setUsersState] = useState<User[]>(getUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleActivate = (userId: string) => {
    const allUsers = getUsers();
    const targetUser = allUsers.find((u) => u.id === userId);
    if (targetUser) {
      syncActivateUser(targetUser.email);
    }
    setUsersState(getUsers());
    toast.success("User activated successfully!");
  };

  const handleDeactivate = (userId: string) => {
    const allUsers = getUsers();
    const targetUser = allUsers.find((u) => u.id === userId);
    if (targetUser) {
      syncDeactivateUser(targetUser.email);
    }
    setUsersState(getUsers());
    toast.success("User panel deactivated.");
  };

  const getUserBankAccounts = (userId: string): BankAccount[] =>
    getBankAccounts().filter((a) => a.userId === userId);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">
            User Management
          </h2>
          <p className="text-muted-foreground text-sm">
            Manage registered users and their access
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Users", value: users.length },
          {
            label: "Active",
            value: users.filter((u) => u.isActivated).length,
          },
          {
            label: "Inactive",
            value: users.filter((u) => !u.isActivated).length,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-card border border-border rounded-xl p-4 text-center"
          >
            <p className="text-2xl font-display font-bold text-primary">
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden card-glow">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-base font-semibold text-foreground">
            Registered Users
          </h3>
        </div>

        {users.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No users registered yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Name</TableHead>
                  <TableHead className="text-muted-foreground">Email</TableHead>
                  <TableHead className="text-muted-foreground">
                    Panel Status
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Bank Accounts
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow
                    key={user.id}
                    className="border-border hover:bg-secondary/50"
                  >
                    <TableCell className="font-medium text-foreground">
                      {user.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      {user.isActivated ? (
                        <span className="status-approved inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-400">
                          <XCircle className="w-3 h-3" /> Inactive
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {getUserBankAccounts(user.id).length}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {!user.isActivated ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleActivate(user.id)}
                            className="text-primary hover:text-primary hover:bg-primary/10 h-7 px-2 text-xs"
                            data-ocid="user_management.activate_button"
                          >
                            Activate
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeactivate(user.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7 px-2 text-xs"
                            data-ocid="user_management.deactivate_button"
                          >
                            Deactivate
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedUser(user)}
                          className="text-muted-foreground hover:text-foreground h-7 px-2"
                          data-ocid="user_management.view_button"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* User detail dialog */}
      <Dialog
        open={!!selectedUser}
        onOpenChange={(open) => !open && setSelectedUser(null)}
      >
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground font-display">
              User Details
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Name</p>
                  <p className="text-foreground font-medium">
                    {selectedUser.name}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Email</p>
                  <p className="text-foreground font-medium">
                    {selectedUser.email}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">
                    Panel Status
                  </p>
                  <p
                    className={`font-medium text-sm ${selectedUser.isActivated ? "text-green-400" : "text-red-400"}`}
                  >
                    {selectedUser.isActivated ? "✓ Active" : "✕ Inactive"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">
                    Activation Code
                  </p>
                  <p className="text-foreground font-mono text-xs">
                    {selectedUser.activationCode ?? "—"}
                  </p>
                </div>
              </div>

              {/* Bank accounts */}
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">
                  Bank Accounts
                </p>
                {getUserBankAccounts(selectedUser.id).length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No bank accounts submitted.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {getUserBankAccounts(selectedUser.id).map(
                      (acc: BankAccount) => (
                        <div
                          key={acc.id}
                          className="flex items-center justify-between text-sm bg-secondary rounded-lg px-3 py-2"
                        >
                          <div>
                            <p className="text-foreground font-medium">
                              {acc.bankName}
                            </p>
                            <p className="text-muted-foreground text-xs font-mono">
                              ••••{acc.accountNumber.slice(-4)} · {acc.fundType}
                            </p>
                          </div>
                          <StatusBadge status={acc.status} />
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>

              {/* Admin actions */}
              <div className="flex gap-2">
                {!selectedUser.isActivated ? (
                  <Button
                    onClick={() => {
                      handleActivate(selectedUser.id);
                      setSelectedUser(null);
                    }}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                    data-ocid="user_detail.activate_button"
                  >
                    <CheckCircle2 className="mr-2 w-4 h-4" />
                    Activate Panel
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      handleDeactivate(selectedUser.id);
                      setSelectedUser(null);
                    }}
                    variant="destructive"
                    className="flex-1 font-semibold"
                    data-ocid="user_detail.deactivate_button"
                  >
                    <XCircle className="mr-2 w-4 h-4" />
                    Deactivate Panel
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
