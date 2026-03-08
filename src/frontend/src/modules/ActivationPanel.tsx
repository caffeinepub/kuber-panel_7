import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { syncActivateUser, syncUseActivationCode } from "@/lib/backend-sync";
import {
  type User,
  getActivationCodes,
  getSession,
  getUsers,
  setActivationCodes,
  setSession,
  setUsers,
} from "@/lib/storage";
import {
  CheckCircle2,
  Gamepad2,
  Landmark,
  Loader2,
  Lock,
  Shield,
  Shuffle,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ActivationPanelProps {
  isActivated: boolean;
  onActivated: () => void;
  activatedFunds?: User["activatedFunds"];
}

const FUND_FEATURES = [
  {
    key: "gaming" as const,
    label: "Gaming Fund",
    sub: "15% commission",
    icon: Gamepad2,
    iconColor: "text-purple-400",
  },
  {
    key: "stock" as const,
    label: "Stock Fund",
    sub: "30% commission",
    icon: TrendingUp,
    iconColor: "text-blue-400",
  },
  {
    key: "political" as const,
    label: "Political Fund",
    sub: "30% commission",
    icon: Landmark,
    iconColor: "text-red-400",
  },
  {
    key: "mix" as const,
    label: "Mix Fund",
    sub: "25% commission",
    icon: Shuffle,
    iconColor: "text-green-400",
  },
];

const OTHER_FEATURES = [
  "Commission tracking & withdrawal",
  "Live activity feed",
  "Withdrawal requests",
  "Withdrawal history",
];

function isFundKey(
  key: string,
): key is "gaming" | "stock" | "political" | "mix" {
  return ["gaming", "stock", "political", "mix"].includes(key);
}

export function ActivationPanel({
  isActivated,
  onActivated,
  activatedFunds,
}: ActivationPanelProps) {
  const session = getSession();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const users = getUsers();
  const currentUser = users.find((u) => u.id === session?.userId);

  // Check if all funds are activated
  const allFundsActivated =
    activatedFunds?.gaming &&
    activatedFunds?.stock &&
    activatedFunds?.political &&
    activatedFunds?.mix;

  // Show form if not activated OR if activated but not all funds are unlocked
  const showForm = !isActivated || (isActivated && !allFundsActivated);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error("Please enter an activation code.");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    const codes = getActivationCodes();
    const codeIndex = codes.findIndex(
      (c) =>
        c.code.replace(/-/g, "").toLowerCase() ===
          code.replace(/-/g, "").toLowerCase() && !c.isUsed,
    );

    if (codeIndex === -1) {
      toast.error("Invalid or already used activation code.");
      setLoading(false);
      return;
    }

    const codeEntry = codes[codeIndex];
    const fundType = codeEntry.fundType ?? "all";

    // Mark code as used
    codes[codeIndex].isUsed = true;
    codes[codeIndex].usedBy = session?.userId;
    setActivationCodes(codes);

    // Update user with fund activation
    const updatedUsers = getUsers();
    const userIndex = updatedUsers.findIndex((u) => u.id === session?.userId);
    if (userIndex !== -1) {
      const user = updatedUsers[userIndex];
      const newFunds = { ...(user.activatedFunds ?? {}) };

      if (fundType === "all") {
        newFunds.gaming = true;
        newFunds.stock = true;
        newFunds.political = true;
        newFunds.mix = true;
      } else if (isFundKey(fundType)) {
        newFunds[fundType] = true;
      }

      updatedUsers[userIndex] = {
        ...user,
        isActivated: true,
        activationCode: codes[codeIndex].code,
        activatedFunds: newFunds,
      };
      setUsers(updatedUsers);
    }

    // Sync to backend (fire-and-forget)
    syncUseActivationCode(codes[codeIndex].code, session?.userId ?? "");
    if (session) {
      const targetUser = updatedUsers.find((u) => u.id === session.userId);
      if (targetUser) {
        syncActivateUser(targetUser.email);
      }
    }

    // Update session
    if (session) {
      setSession({ ...session });
    }

    // Success message based on fund type
    const fundLabels: Record<string, string> = {
      gaming: "Gaming Fund",
      stock: "Stock Fund",
      political: "Political Fund",
      mix: "Mix Fund",
      all: "All Funds",
    };
    const label = fundLabels[fundType] ?? "Panel";
    toast.success(`${label} activated successfully!`);
    setCode("");
    setLoading(false);
    onActivated();
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">
            Activation Panel
          </h2>
          <p className="text-muted-foreground text-sm">
            Unlock fund features with activation codes
          </p>
        </div>
      </div>

      {/* Status banner */}
      <div
        className={`rounded-xl p-6 border text-center ${
          isActivated
            ? "bg-success/10 border-success/30"
            : "bg-warning/10 border-warning/30"
        }`}
      >
        {isActivated ? (
          <div className="flex flex-col items-center gap-3">
            <CheckCircle2 className="w-12 h-12 text-success" />
            <div>
              <p className="text-lg font-display font-bold text-foreground">
                Panel Activated
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {allFundsActivated
                  ? "All funds are unlocked and accessible."
                  : "Some funds are active. Enter more codes to unlock additional funds."}
              </p>
              {currentUser?.activationCode && (
                <div className="mt-3 inline-flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-lg">
                  <span className="text-xs text-muted-foreground">
                    Last code used:
                  </span>
                  <span className="font-mono text-sm font-bold text-primary">
                    {currentUser.activationCode}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Lock className="w-12 h-12 text-warning" />
            <div>
              <p className="text-lg font-display font-bold text-foreground">
                Panel Not Activated
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Enter your activation code below to unlock fund features.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Activation form */}
      {showForm && (
        <div className="bg-card border border-border rounded-xl p-6 card-glow">
          <h3 className="text-base font-semibold text-foreground mb-1">
            {isActivated ? "Activate Additional Fund" : "Enter Activation Code"}
          </h3>
          {isActivated && (
            <p className="text-xs text-muted-foreground mb-4">
              Enter a new code to unlock more fund options.
            </p>
          )}
          <form onSubmit={handleActivate} className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm">
                Activation Code <span className="text-destructive">*</span>
              </Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g., ABCD-1234-EFGH"
                className="bg-secondary border-border focus:border-primary h-11 text-foreground font-mono text-lg tracking-widest placeholder:text-muted-foreground/50 placeholder:tracking-normal placeholder:font-sans placeholder:text-sm text-center"
                data-ocid="activation.code_input"
              />
              <p className="text-xs text-muted-foreground">
                Contact your administrator to obtain an activation code for a
                specific fund.
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-semibold gold-glow"
              data-ocid="activation.submit_button"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Activating...
                </>
              ) : (
                <>
                  <Shield className="mr-2 w-4 h-4" />
                  {isActivated ? "Activate Fund" : "Activate Panel"}
                </>
              )}
            </Button>
          </form>
        </div>
      )}

      {/* Fund activation status */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          Fund Activation Status
        </h3>
        <div className="space-y-2.5 mb-4">
          {FUND_FEATURES.map((feat) => {
            const isFundActivated =
              isActivated && (activatedFunds?.[feat.key] ?? false);
            return (
              <div key={feat.key} className="flex items-center gap-3">
                {isFundActivated ? (
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                ) : (
                  <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
                <feat.icon className={`w-4 h-4 shrink-0 ${feat.iconColor}`} />
                <span
                  className={`text-sm flex-1 ${isFundActivated ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {feat.label}
                  <span className="text-xs ml-1 text-muted-foreground/60">
                    ({feat.sub})
                  </span>
                </span>
                {isFundActivated && (
                  <span className="text-[10px] text-success font-semibold uppercase tracking-widest">
                    Active
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div className="border-t border-border pt-3 space-y-2">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">
            Unlocked with any activation
          </p>
          {OTHER_FEATURES.map((feature) => (
            <div key={feature} className="flex items-center gap-2.5">
              {isActivated ? (
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              ) : (
                <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
              )}
              <span
                className={`text-sm ${isActivated ? "text-foreground" : "text-muted-foreground"}`}
              >
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
