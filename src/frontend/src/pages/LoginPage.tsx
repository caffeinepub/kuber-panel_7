import { KuberLogo } from "@/components/KuberLogo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createActorWithConfig } from "@/config";
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  getSupportLink,
  setSession,
} from "@/lib/storage";
import {
  ExternalLink,
  Eye,
  EyeOff,
  HelpCircle,
  Loader2,
  Lock,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface LoginPageProps {
  onLoginSuccess: (isAdmin: boolean, userName: string) => void;
  onNavigateRegister: () => void;
}

export function LoginPage({
  onLoginSuccess,
  onNavigateRegister,
}: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  const supportLink = getSupportLink();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));

    // Admin check
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const adminDisplayName = "Kuber";
      setSession({
        userId: "admin",
        isAdmin: true,
        userName: adminDisplayName,
        userEmail: ADMIN_EMAIL,
      });
      setLoading(false);
      onLoginSuccess(true, adminDisplayName);
      return;
    }

    // Check if user was permanently deleted first
    const deletedEmails: string[] = JSON.parse(
      localStorage.getItem("kuber_deletedEmails") ?? "[]",
    );
    if (deletedEmails.includes(email.toLowerCase())) {
      toast.error(
        "This account has been removed. Please register with a new account.",
      );
      setLoading(false);
      return;
    }

    // User check — try backend first, fall back to localStorage
    let user: { id: string; name: string; email: string } | null = null;
    try {
      const actor = await createActorWithConfig();
      const result = await (actor as any).loginUser(email, password);
      if (result && typeof result === "object") {
        const backendUser = Array.isArray(result) ? result[0] : result;
        if (backendUser?.id) {
          user = {
            id: backendUser.id,
            name: backendUser.name,
            email: backendUser.email,
          };
        }
      }
    } catch {
      // fall through to localStorage
    }

    // Always also check localStorage (in case backend is empty but local has data)
    if (!user) {
      const { getUsers } = await import("@/lib/storage");
      const users = getUsers();
      const local = users.find(
        (u) =>
          u.email.toLowerCase() === email.toLowerCase() &&
          u.password === password,
      );
      if (local) user = { id: local.id, name: local.name, email: local.email };
    }

    if (!user) {
      toast.error("Invalid email or password.");
      setLoading(false);
      return;
    }

    setSession({
      userId: user.id,
      isAdmin: false,
      userName: user.name,
      userEmail: user.email,
    });
    setLoading(false);
    onLoginSuccess(false, user.name);
  };

  return (
    <div
      className="min-h-screen flex relative overflow-hidden"
      style={{ background: "#000000" }}
    >
      {/* Top gold accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] z-50"
        style={{
          background: "linear-gradient(90deg, #c8940a, #f5d060, #c8940a)",
        }}
      />

      {/* Left decorative panel - desktop only */}
      <div
        className="hidden lg:flex lg:w-5/12 flex-col items-center justify-center relative p-12"
        style={{ background: "#0a0a0a" }}
      >
        {/* Gold vertical separator */}
        <div
          className="absolute right-0 top-0 bottom-0 w-px"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, #d4a017 25%, #f5d060 50%, #d4a017 75%, transparent 100%)",
          }}
        />

        <div className="relative z-10 flex flex-col items-center gap-10 w-full max-w-xs">
          <KuberLogo size={170} />

          <div className="text-center space-y-2">
            <h1
              className="text-3xl font-bold tracking-widest"
              style={{
                background:
                  "linear-gradient(135deg, #c8940a, #f5d060, #c8940a)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              KUBER PANEL
            </h1>
            <p
              className="text-xs tracking-[0.2em] uppercase"
              style={{ color: "#555555" }}
            >
              Financial Management Platform
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-3 w-full">
            {[
              { icon: "₹", text: "Secure Fund Management" },
              { icon: "📊", text: "Live Transaction Tracking" },
              { icon: "💰", text: "Commission & Withdrawal" },
            ].map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{
                  background: "#111111",
                  border: "1px solid #1f1f1f",
                }}
              >
                <span className="text-base w-6 text-center">{item.icon}</span>
                <span className="text-sm" style={{ color: "#888888" }}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="flex items-center gap-4">
            {["256-bit SSL", "Secure", "Verified"].map((badge) => (
              <span
                key={badge}
                className="text-[10px] px-2 py-1 rounded"
                style={{
                  background: "#111111",
                  border: "1px solid #1f1f1f",
                  color: "#555555",
                }}
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom divider */}
        <div
          className="absolute bottom-8 left-12 right-12 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, #1f1f1f, transparent)",
          }}
        />
      </div>

      {/* Right - Login form */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-5 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden flex-col items-center mb-8 gap-3">
            <KuberLogo size={90} />
            <h2
              className="text-xl font-bold tracking-widest"
              style={{
                background: "linear-gradient(135deg, #c8940a, #f5d060)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              KUBER PANEL
            </h2>
          </div>

          {/* Card */}
          <div
            className="rounded-2xl p-8"
            style={{
              background: "#111111",
              border: "1px solid #1f1f1f",
            }}
          >
            {/* Card Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                  style={{
                    background: "rgba(212,160,23,0.1)",
                    border: "1px solid rgba(212,160,23,0.2)",
                  }}
                >
                  <Lock size={11} style={{ color: "#d4a017" }} />
                  <span
                    className="text-[10px] font-semibold uppercase tracking-widest"
                    style={{ color: "#d4a017" }}
                  >
                    Secure Login
                  </span>
                </div>
              </div>
              <h2 className="text-2xl font-bold" style={{ color: "#ffffff" }}>
                Welcome Back
              </h2>
              <p className="text-sm mt-1" style={{ color: "#555555" }}>
                Sign in to your Kuber Panel account
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium"
                  style={{ color: "#888888" }}
                >
                  Login ID (Email)
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your Login ID (Email)"
                  className="h-12 rounded-lg text-white placeholder:text-[#555555] focus-visible:ring-0 focus-visible:ring-offset-0"
                  style={{
                    background: "#1a1a1a",
                    border: "1px solid #2a2a2a",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = "1px solid #d4a017";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = "1px solid #2a2a2a";
                  }}
                  autoComplete="email"
                  required
                  data-ocid="login.email_input"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium"
                    style={{ color: "#888888" }}
                  >
                    Password
                  </Label>
                  <button
                    type="button"
                    onClick={() => setForgotOpen(true)}
                    className="text-xs font-medium transition-colors"
                    style={{ color: "#c8940a" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#f5d060";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#c8940a";
                    }}
                    data-ocid="login.forgot_password_button"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="h-12 rounded-lg text-white placeholder:text-[#555555] pr-12 focus-visible:ring-0 focus-visible:ring-offset-0"
                    style={{
                      background: "#1a1a1a",
                      border: "1px solid #2a2a2a",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.border = "1px solid #d4a017";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border = "1px solid #2a2a2a";
                    }}
                    autoComplete="current-password"
                    required
                    data-ocid="login.password_input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: "#555555" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#d4a017";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#555555";
                    }}
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 font-semibold text-sm rounded-lg text-black mt-2 transition-all"
                style={{
                  background: loading
                    ? "rgba(212,160,23,0.4)"
                    : "linear-gradient(135deg, #c8940a, #e8b820)",
                  border: "none",
                  boxShadow: loading
                    ? "none"
                    : "0 2px 12px rgba(212,160,23,0.25)",
                  letterSpacing: "0.05em",
                }}
                data-ocid="login.submit_button"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "LOGIN"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px" style={{ background: "#1f1f1f" }} />
              <span
                className="text-[10px] tracking-widest"
                style={{ color: "#444444" }}
              >
                OR
              </span>
              <div className="flex-1 h-px" style={{ background: "#1f1f1f" }} />
            </div>

            {/* Footer links */}
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm" style={{ color: "#555555" }}>
                New to Kuber Panel?{" "}
                <button
                  type="button"
                  onClick={onNavigateRegister}
                  className="font-semibold transition-colors hover:underline"
                  style={{ color: "#f5d060" }}
                  data-ocid="login.register_link"
                >
                  Create Account
                </button>
              </p>

              <a
                href={supportLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs transition-colors"
                style={{ color: "#444444" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "#d4a017";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "#444444";
                }}
              >
                <ExternalLink size={11} />
                Help &amp; Support
              </a>
            </div>
          </div>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-2 mt-5">
            <Shield size={11} style={{ color: "#333333" }} />
            <p className="text-center text-[11px]" style={{ color: "#333333" }}>
              © {new Date().getFullYear()} Kuber Panel. All rights reserved. |
              Secured Platform
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent
          className="max-w-sm"
          style={{
            background: "#111111",
            border: "1px solid #1f1f1f",
            color: "#ffffff",
          }}
          data-ocid="login.forgot_password_dialog"
        >
          <DialogHeader>
            <DialogTitle
              className="flex items-center gap-2"
              style={{ color: "#f5d060" }}
            >
              <HelpCircle size={18} style={{ color: "#c8940a" }} />
              Forgot Password?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p
              className="text-sm"
              style={{ color: "#888888", lineHeight: "1.6" }}
            >
              To reset your password, please contact our support team on
              Telegram. Our team will verify your identity and help you recover
              your account.
            </p>
            <div className="space-y-2">
              <a
                href={supportLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full h-11 rounded-lg font-semibold text-sm text-black transition-all"
                style={{
                  background: "linear-gradient(135deg, #c8940a, #e8b820)",
                  boxShadow: "0 2px 12px rgba(212,160,23,0.25)",
                  letterSpacing: "0.03em",
                  textDecoration: "none",
                }}
                data-ocid="login.forgot_support_button"
              >
                <ExternalLink size={15} />
                Contact Support on Telegram
              </a>
              <button
                type="button"
                onClick={() => setForgotOpen(false)}
                className="w-full h-10 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: "transparent",
                  border: "1px solid #2a2a2a",
                  color: "#888888",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.border = "1px solid #3a3a3a";
                  e.currentTarget.style.color = "#aaaaaa";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.border = "1px solid #2a2a2a";
                  e.currentTarget.style.color = "#888888";
                }}
                data-ocid="login.forgot_close_button"
              >
                Close
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
