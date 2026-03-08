import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { syncActivateUserFund, syncDeactivateUser } from "@/lib/backend-sync";
import {
  type BankAccount,
  type User,
  getBankAccounts,
  getUsers,
  setUsers,
} from "@/lib/storage";
import {
  CheckCircle2,
  ChevronDown,
  Eye,
  Gamepad2,
  Landmark,
  Shuffle,
  Trash2,
  TrendingUp,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type FundType = "gaming" | "stock" | "political" | "mix" | "all";

const FUND_ACTIVATE_OPTIONS: {
  value: FundType;
  label: string;
  icon: React.ElementType;
  color: string;
}[] = [
  {
    value: "gaming",
    label: "Gaming Fund",
    icon: Gamepad2,
    color: "text-purple-400",
  },
  {
    value: "stock",
    label: "Stock Fund",
    icon: TrendingUp,
    color: "text-blue-400",
  },
  {
    value: "political",
    label: "Political Fund",
    icon: Landmark,
    color: "text-red-400",
  },
  { value: "mix", label: "Mix Fund", icon: Shuffle, color: "text-green-400" },
  { value: "all", label: "All Funds", icon: Zap, color: "text-primary" },
];

const FUND_BADGE_CONFIG: Record<string, { label: string; color: string }> = {
  gaming: {
    label: "G",
    color: "bg-purple-500/20 text-purple-400 border-purple-500/40",
  },
  stock: {
    label: "S",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/40",
  },
  political: {
    label: "P",
    color: "bg-red-500/20 text-red-400 border-red-500/40",
  },
  mix: {
    label: "M",
    color: "bg-green-500/20 text-green-400 border-green-500/40",
  },
};

function UserRow({
  user,
  idx,
  onActivateFund,
  onDeactivate,
  onView,
  onDeleteConfirm,
  bankCount,
  activeFunds,
  sectionPrefix,
}: {
  user: User;
  idx: number;
  onActivateFund: (userId: string, fundType: FundType) => void;
  onDeactivate: (userId: string) => void;
  onView: (user: User) => void;
  onDeleteConfirm: (user: User) => void;
  bankCount: number;
  activeFunds: string[];
  sectionPrefix: string;
}) {
  return (
    <TableRow
      className="border-border hover:bg-secondary/50"
      data-ocid={`user_management.${sectionPrefix}.item.${idx + 1}`}
    >
      <TableCell className="font-medium text-foreground">{user.name}</TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {user.email}
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {activeFunds.length === 0 ? (
            <span className="text-xs text-muted-foreground/60">—</span>
          ) : (
            activeFunds.map((f) => {
              const cfg = FUND_BADGE_CONFIG[f];
              return (
                <span
                  key={f}
                  title={`${f.charAt(0).toUpperCase()}${f.slice(1)} Fund`}
                  className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-black border ${cfg?.color ?? "bg-secondary text-muted-foreground"}`}
                >
                  {cfg?.label ?? f[0].toUpperCase()}
                </span>
              );
            })
          )}
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {bankCount}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          {!user.isActivated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary hover:bg-primary/10 h-7 px-2 text-xs gap-1"
                  data-ocid="user_management.activate_button"
                >
                  Activate
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-card border-border min-w-[180px]"
              >
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Select Fund to Activate
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                {FUND_ACTIVATE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <DropdownMenuItem
                      key={opt.value}
                      onClick={() => onActivateFund(user.id, opt.value)}
                      className="cursor-pointer hover:bg-secondary gap-2"
                    >
                      <Icon className={`w-3.5 h-3.5 ${opt.color}`} />
                      <span className="text-foreground text-sm">
                        {opt.label}
                      </span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary hover:bg-primary/10 h-7 px-2 text-xs gap-1"
                    data-ocid="user_management.add_fund_button"
                  >
                    +Fund
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-card border-border min-w-[180px]"
                >
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Activate Fund
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border" />
                  {FUND_ACTIVATE_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isActive =
                      opt.value === "all"
                        ? false
                        : (user.activatedFunds?.[
                            opt.value as
                              | "gaming"
                              | "stock"
                              | "political"
                              | "mix"
                          ] ?? false);
                    return (
                      <DropdownMenuItem
                        key={opt.value}
                        onClick={() => onActivateFund(user.id, opt.value)}
                        className="cursor-pointer hover:bg-secondary gap-2"
                        disabled={isActive}
                      >
                        <Icon className={`w-3.5 h-3.5 ${opt.color}`} />
                        <span
                          className={`text-sm ${isActive ? "text-muted-foreground line-through" : "text-foreground"}`}
                        >
                          {opt.label}
                        </span>
                        {isActive && (
                          <CheckCircle2 className="w-3 h-3 text-success ml-auto" />
                        )}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeactivate(user.id)}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7 px-2 text-xs"
                data-ocid="user_management.deactivate_button"
              >
                Deactivate
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(user)}
            className="text-muted-foreground hover:text-foreground h-7 px-2"
            data-ocid="user_management.view_button"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeleteConfirm(user)}
            className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 h-7 w-7 p-0"
            data-ocid="user_management.delete_button"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function UserManagement() {
  const [users, setUsersState] = useState<User[]>(getUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<User | null>(null);

  const handleActivateFund = (userId: string, fundType: FundType) => {
    const allUsers = getUsers();
    const targetUser = allUsers.find((u) => u.id === userId);
    if (targetUser) {
      syncActivateUserFund(targetUser.email, fundType);
    }
    setUsersState(getUsers());
    const label =
      fundType === "all"
        ? "All Funds"
        : (FUND_ACTIVATE_OPTIONS.find((o) => o.value === fundType)?.label ??
          fundType);
    toast.success(`${label} activated for user!`);
  };

  const handleDeactivate = (userId: string) => {
    const allUsers = getUsers();
    const targetUser = allUsers.find((u) => u.id === userId);
    if (targetUser) {
      syncDeactivateUser(targetUser.email);
    }
    // Force-logout if this user is currently logged in
    const forceIds = JSON.parse(
      localStorage.getItem("kuber_force_logout_ids") ?? "[]",
    ) as string[];
    if (!forceIds.includes(userId)) {
      localStorage.setItem(
        "kuber_force_logout_ids",
        JSON.stringify([...forceIds, userId]),
      );
    }
    setUsersState(getUsers());
    toast.success("User panel deactivated.");
  };

  const handleDeleteUser = (userId: string) => {
    const allUsers = getUsers();
    const updated = allUsers.filter((u) => u.id !== userId);
    setUsers(updated);
    setUsersState(updated);
    setDeleteConfirmUser(null);
    setSelectedUser(null);
    // Force-logout if this user is currently logged in
    const forceIds = JSON.parse(
      localStorage.getItem("kuber_force_logout_ids") ?? "[]",
    ) as string[];
    if (!forceIds.includes(userId)) {
      localStorage.setItem(
        "kuber_force_logout_ids",
        JSON.stringify([...forceIds, userId]),
      );
    }
    toast.success("User account deleted permanently.");
  };

  const getUserBankAccounts = (userId: string): BankAccount[] =>
    getBankAccounts().filter((a) => a.userId === userId);

  const getUserActiveFunds = (user: User): string[] => {
    if (!user.isActivated) return [];
    const funds = ["gaming", "stock", "political", "mix"] as const;
    if (!user.activatedFunds) return [];
    return funds.filter((f) => user.activatedFunds?.[f]);
  };

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

      {/* Active Users Table */}
      {users.filter((u) => u.isActivated).length > 0 && (
        <div className="bg-card border border-success/30 rounded-xl overflow-hidden card-glow">
          <div className="px-6 py-4 border-b border-success/20 bg-success/5 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <h3 className="text-base font-semibold text-success">
              Active Users
            </h3>
            <span className="ml-auto text-xs text-muted-foreground bg-success/10 px-2 py-0.5 rounded-full">
              {users.filter((u) => u.isActivated).length}
            </span>
          </div>
          <div className="overflow-x-auto">
            <Table data-ocid="user_management.active.table">
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Name</TableHead>
                  <TableHead className="text-muted-foreground">Email</TableHead>
                  <TableHead className="text-muted-foreground">
                    Active Funds
                  </TableHead>
                  <TableHead className="text-muted-foreground">Banks</TableHead>
                  <TableHead className="text-muted-foreground">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users
                  .filter((u) => u.isActivated)
                  .map((user, idx) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      idx={idx}
                      onActivateFund={handleActivateFund}
                      onDeactivate={handleDeactivate}
                      onView={setSelectedUser}
                      onDeleteConfirm={setDeleteConfirmUser}
                      bankCount={getUserBankAccounts(user.id).length}
                      activeFunds={getUserActiveFunds(user)}
                      sectionPrefix="active"
                    />
                  ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Inactive Users Table */}
      {users.filter((u) => !u.isActivated).length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden card-glow">
          <div className="px-6 py-4 border-b border-border flex items-center gap-2">
            <XCircle className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-base font-semibold text-foreground">
              Inactive Users
            </h3>
            <span className="ml-auto text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
              {users.filter((u) => !u.isActivated).length}
            </span>
          </div>
          <div className="overflow-x-auto">
            <Table data-ocid="user_management.inactive.table">
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Name</TableHead>
                  <TableHead className="text-muted-foreground">Email</TableHead>
                  <TableHead className="text-muted-foreground">
                    Active Funds
                  </TableHead>
                  <TableHead className="text-muted-foreground">Banks</TableHead>
                  <TableHead className="text-muted-foreground">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users
                  .filter((u) => !u.isActivated)
                  .map((user, idx) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      idx={idx}
                      onActivateFund={handleActivateFund}
                      onDeactivate={handleDeactivate}
                      onView={setSelectedUser}
                      onDeleteConfirm={setDeleteConfirmUser}
                      bankCount={getUserBankAccounts(user.id).length}
                      activeFunds={getUserActiveFunds(user)}
                      sectionPrefix="inactive"
                    />
                  ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {users.length === 0 && (
        <div
          className="text-center py-12 text-muted-foreground bg-card border border-border rounded-xl"
          data-ocid="user_management.empty_state"
        >
          <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No users registered yet.</p>
        </div>
      )}

      {/* User detail dialog */}
      <Dialog
        open={!!selectedUser}
        onOpenChange={(open) => !open && setSelectedUser(null)}
      >
        <DialogContent
          className="bg-card border-border max-w-lg"
          data-ocid="user_management.dialog"
        >
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

              {/* Activated funds */}
              {selectedUser.isActivated && (
                <div>
                  <p className="text-sm font-semibold text-foreground mb-2">
                    Activated Funds
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(["gaming", "stock", "political", "mix"] as const).map(
                      (f) => {
                        const opt = FUND_ACTIVATE_OPTIONS.find(
                          (o) => o.value === f,
                        );
                        const active =
                          selectedUser.activatedFunds?.[f] ?? false;
                        const Icon = opt?.icon ?? Zap;
                        return (
                          <span
                            key={f}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border ${
                              active
                                ? "bg-success/15 border-success/40 text-success"
                                : "bg-secondary border-border text-muted-foreground"
                            }`}
                          >
                            <Icon className="w-3 h-3" />
                            {opt?.label.replace(" Fund", "") ?? f}
                          </span>
                        );
                      },
                    )}
                  </div>
                </div>
              )}

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
                              {acc.accountNumber} · {acc.fundType}
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
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">
                  Activate Fund
                </p>
                <div className="flex flex-wrap gap-2">
                  {FUND_ACTIVATE_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isActive =
                      opt.value === "all"
                        ? false
                        : (selectedUser.activatedFunds?.[
                            opt.value as
                              | "gaming"
                              | "stock"
                              | "political"
                              | "mix"
                          ] ?? false);
                    return (
                      <Button
                        key={opt.value}
                        size="sm"
                        variant="outline"
                        disabled={isActive}
                        onClick={() => {
                          handleActivateFund(selectedUser.id, opt.value);
                          setSelectedUser(null);
                        }}
                        className={`gap-1.5 text-xs h-8 border-border hover:border-primary/50 ${isActive ? "opacity-50" : ""}`}
                        data-ocid={`user_detail.activate_${opt.value}_button`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${opt.color}`} />
                        {opt.label}
                        {isActive && (
                          <CheckCircle2 className="w-3 h-3 text-success ml-1" />
                        )}
                      </Button>
                    );
                  })}
                </div>
                {selectedUser.isActivated && (
                  <Button
                    onClick={() => {
                      handleDeactivate(selectedUser.id);
                      setSelectedUser(null);
                    }}
                    variant="destructive"
                    size="sm"
                    className="w-full font-semibold mt-2"
                    data-ocid="user_detail.deactivate_button"
                  >
                    <XCircle className="mr-2 w-4 h-4" />
                    Deactivate Panel
                  </Button>
                )}
                <Button
                  onClick={() => {
                    setDeleteConfirmUser(selectedUser);
                    setSelectedUser(null);
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full font-semibold mt-1 border-destructive/40 text-destructive hover:bg-destructive/10"
                  data-ocid="user_detail.delete_button"
                >
                  <Trash2 className="mr-2 w-4 h-4" />
                  Delete Account
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete User Confirm Dialog */}
      <Dialog
        open={!!deleteConfirmUser}
        onOpenChange={(open) => !open && setDeleteConfirmUser(null)}
      >
        <DialogContent
          className="bg-card border-border text-foreground max-w-sm"
          data-ocid="user_management.delete.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">
              Delete User Account
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Are you sure you want to permanently delete{" "}
            <span className="font-semibold text-foreground">
              {deleteConfirmUser?.name}
            </span>
            ? All their data will be removed. This cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmUser(null)}
              className="border-border text-muted-foreground hover:text-foreground"
              data-ocid="user_management.delete.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteConfirmUser && handleDeleteUser(deleteConfirmUser.id)
              }
              data-ocid="user_management.delete.confirm_button"
            >
              <Trash2 className="mr-2 w-4 h-4" />
              Delete Permanently
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
