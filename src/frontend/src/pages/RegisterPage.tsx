import { KuberLogo } from "@/components/KuberLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { syncRegisterUser } from "@/lib/backend-sync";
import { generateId, getUsers } from "@/lib/storage";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Shield,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface RegisterPageProps {
  onNavigateLogin: () => void;
}

export function RegisterPage({ onNavigateLogin }: RegisterPageProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      toast.error("Please fill all fields.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    const users = getUsers();
    const exists = users.find(
      (u) => u.email.toLowerCase() === form.email.toLowerCase(),
    );

    if (exists) {
      toast.error("An account with this email already exists.");
      setLoading(false);
      return;
    }

    const newUser = {
      id: generateId(),
      name: form.name,
      email: form.email,
      password: form.password,
      isActivated: false,
    };

    syncRegisterUser(newUser);
    toast.success("Account created! Please login.");
    setLoading(false);
    onNavigateLogin();
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

        <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-xs text-center">
          <KuberLogo size={150} />

          <div className="space-y-2">
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

          {/* Why Join box */}
          <div
            className="w-full rounded-xl p-5 text-left"
            style={{
              background: "#111111",
              border: "1px solid #1f1f1f",
            }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-[0.15em] mb-4"
              style={{ color: "#d4a017" }}
            >
              Why Join Kuber Panel?
            </p>
            <ul className="space-y-2.5">
              {[
                "Multiple Fund Options",
                "Live Transaction Monitoring",
                "Secure Withdrawal System",
                "Commission Tracking",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2.5 text-sm"
                  style={{ color: "#888888" }}
                >
                  <span
                    className="text-xs font-bold flex-shrink-0"
                    style={{ color: "#d4a017" }}
                  >
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Trust badges */}
          <div className="flex items-center gap-3">
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

      {/* Right - Register form */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-5 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md py-4">
          {/* Mobile logo */}
          <div className="flex lg:hidden flex-col items-center mb-6 gap-3">
            <KuberLogo size={85} />
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
            <div className="mb-7">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                  style={{
                    background: "rgba(212,160,23,0.1)",
                    border: "1px solid rgba(212,160,23,0.2)",
                  }}
                >
                  <UserPlus size={11} style={{ color: "#d4a017" }} />
                  <span
                    className="text-[10px] font-semibold uppercase tracking-widest"
                    style={{ color: "#d4a017" }}
                  >
                    New Account
                  </span>
                </div>
              </div>
              <h2 className="text-2xl font-bold" style={{ color: "#ffffff" }}>
                Create Account
              </h2>
              <p className="text-sm mt-1" style={{ color: "#555555" }}>
                Join Kuber Panel Financial Platform
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium"
                  style={{ color: "#888888" }}
                >
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={set("name")}
                  placeholder="Enter your full name"
                  className="h-12 rounded-lg text-white placeholder:text-[#555555] focus-visible:ring-0 focus-visible:ring-offset-0"
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
                  required
                  data-ocid="register.name_input"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium"
                  style={{ color: "#888888" }}
                >
                  Login ID (Email) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="Enter your Login ID (Email)"
                  className="h-12 rounded-lg text-white placeholder:text-[#555555] focus-visible:ring-0 focus-visible:ring-offset-0"
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
                  required
                  data-ocid="register.email_input"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium"
                  style={{ color: "#888888" }}
                >
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={set("password")}
                    placeholder="Create a password (min. 6 chars)"
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
                    required
                    data-ocid="register.password_input"
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

              <div className="space-y-1.5">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium"
                  style={{ color: "#888888" }}
                >
                  Confirm Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={set("confirmPassword")}
                    placeholder="Re-enter your password"
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
                    required
                    data-ocid="register.confirm_password_input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: "#555555" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#d4a017";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#555555";
                    }}
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 font-semibold text-sm rounded-lg text-black mt-3 transition-all"
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
                data-ocid="register.submit_button"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "CREATE ACCOUNT"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px" style={{ background: "#1f1f1f" }} />
              <span
                className="text-[10px] tracking-widest"
                style={{ color: "#444444" }}
              >
                ALREADY REGISTERED?
              </span>
              <div className="flex-1 h-px" style={{ background: "#1f1f1f" }} />
            </div>

            <button
              type="button"
              onClick={onNavigateLogin}
              className="w-full h-11 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all"
              style={{
                background: "transparent",
                border: "1px solid #2a2a2a",
                color: "#f5d060",
                letterSpacing: "0.03em",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = "1px solid rgba(212,160,23,0.4)";
                e.currentTarget.style.background = "rgba(212,160,23,0.04)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = "1px solid #2a2a2a";
                e.currentTarget.style.background = "transparent";
              }}
              data-ocid="register.back_login_button"
            >
              <ArrowLeft size={14} />
              Back to Login
            </button>
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
    </div>
  );
}
