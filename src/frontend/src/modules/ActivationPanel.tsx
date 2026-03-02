import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { syncActivateUser, syncUseActivationCode } from "@/lib/backend-sync";
import {
  getActivationCodes,
  getSession,
  getUsers,
  setActivationCodes,
  setSession,
  setUsers,
} from "@/lib/storage";
import { CheckCircle2, Loader2, Lock, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ActivationPanelProps {
  isActivated: boolean;
  onActivated: () => void;
}

export function ActivationPanel({
  isActivated,
  onActivated,
}: ActivationPanelProps) {
  const session = getSession();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  // Get current activation code used
  const users = getUsers();
  const currentUser = users.find((u) => u.id === session?.userId);

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

    // Mark code as used in localStorage
    codes[codeIndex].isUsed = true;
    codes[codeIndex].usedBy = session?.userId;
    setActivationCodes(codes);

    // Activate user in localStorage
    const updatedUsers = getUsers();
    const userIndex = updatedUsers.findIndex((u) => u.id === session?.userId);
    if (userIndex !== -1) {
      updatedUsers[userIndex].isActivated = true;
      updatedUsers[userIndex].activationCode = codes[codeIndex].code;
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

    toast.success("Panel activated successfully! All features unlocked.");
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
            Unlock all features with your activation code
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
                All features are unlocked and accessible.
              </p>
              {currentUser?.activationCode && (
                <div className="mt-3 inline-flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-lg">
                  <span className="text-xs text-muted-foreground">
                    Code used:
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
                Enter your activation code below to unlock all fund features.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Activation form */}
      {!isActivated && (
        <div className="bg-card border border-border rounded-xl p-6 card-glow">
          <h3 className="text-base font-semibold text-foreground mb-4">
            Enter Activation Code
          </h3>
          <form onSubmit={handleActivate} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm">
                Activation Code <span className="text-destructive">*</span>
              </Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g., ABCD-1234-EFGH"
                className="bg-secondary border-border focus:border-primary h-11 text-foreground font-mono text-lg tracking-widest placeholder:text-muted-foreground/50 placeholder:tracking-normal placeholder:font-sans placeholder:text-sm text-center"
              />
              <p className="text-xs text-muted-foreground">
                Contact your administrator to obtain an activation code.
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-semibold gold-glow"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Activating...
                </>
              ) : (
                <>
                  <Shield className="mr-2 w-4 h-4" />
                  Activate Panel
                </>
              )}
            </Button>
          </form>
        </div>
      )}

      {/* Feature list */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-base font-semibold text-foreground mb-4">
          Features Unlocked After Activation
        </h3>
        <div className="space-y-2">
          {[
            "Gaming Fund (15% returns)",
            "Stock Fund (30% returns)",
            "Political Fund (30% returns)",
            "Mix Fund (25% returns)",
            "Commission tracking & withdrawal",
            "Live activity feed",
            "Withdrawal requests",
            "Withdrawal history",
          ].map((feature) => (
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
