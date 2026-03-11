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

    // Check if deleted
    const deletedEmails: string[] = JSON.parse(
      localStorage.getItem("kuber_deletedEmails") ?? "[]",
    );
    if (deletedEmails.includes(form.email.toLowerCase())) {
      toast.error("This account has been removed. Please contact support.");
      setLoading(false);
      return;
    }

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
      registeredAt: new Date().toISOString(),
    };

    syncRegisterUser(newUser);
    toast.success("Account created successfully! Please login.");
    setLoading(false);
    onNavigateLogin();
  };

  return (
    <div
      className="min-h-screen flex relative overflow-hidden"
      style={{ background: "#000814" }}
    >
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] z-50"
        style={{
          background: "linear-gradient(90deg, #1565c0, #42a5f5, #1565c0)",
        }}
      />

      {/* Left decorative panel */}
      <div
        className="hidden lg:flex lg:w-5/12 flex-col items-center justify-center relative p-12"
        style={{ background: "#000d1a" }}
      >
        <div
          className="absolute right-0 top-0 bottom-0 w-px"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, #1565c0 25%, #42a5f5 50%, #1565c0 75%, transparent 100%)",
          }}
        />

        <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-xs text-center">
          <KuberLogo size={150} />

          <div className="space-y-2">
            <h1
              className="text-3xl font-bold tracking-widest"
              style={{
                background:
                  "linear-gradient(135deg, #1565c0, #42a5f5, #1565c0)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              KUBER PANEL
            </h1>
            <p
              className="text-xs tracking-[0.2em] uppercase"
              style={{ color: "#445566" }}
            >
              Financial Management Platform
            </p>
          </div>

          <div
            className="w-full rounded-xl p-5 text-left"
            style={{ background: "#001122", border: "1px solid #112233" }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-[0.15em] mb-4"
              style={{ color: "#42a5f5" }}
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
                  style={{ color: "#778899" }}
                >
                  <span
                    className="text-xs font-bold flex-shrink-0"
                    style={{ color: "#42a5f5" }}
                  >
                    &#10003;
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-3">
            {["256-bit SSL", "Secure", "Verified"].map((badge) => (
              <span
                key={badge}
                className="text-[10px] px-2 py-1 rounded"
                style={{
                  background: "#001122",
                  border: "1px solid #112233",
                  color: "#445566",
                }}
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
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
                background: "linear-gradient(135deg, #1565c0, #42a5f5)",
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
            style={{ background: "#00111f", border: "1px solid #0a2035" }}
          >
            <div className="mb-7">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                  style={{
                    background: "rgba(21,101,192,0.15)",
                    border: "1px solid rgba(66,165,245,0.25)",
                  }}
                >
                  <UserPlus size={11} style={{ color: "#42a5f5" }} />
                  <span
                    className="text-[10px] font-semibold uppercase tracking-widest"
                    style={{ color: "#42a5f5" }}
                  >
                    New Account
                  </span>
                </div>
              </div>
              <h2 className="text-2xl font-bold" style={{ color: "#e0f0ff" }}>
                Create Account
              </h2>
              <p className="text-sm mt-1" style={{ color: "#445566" }}>
                Join Kuber Panel Financial Platform
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium"
                  style={{ color: "#7799bb" }}
                >
                  Full Name <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={set("name")}
                  placeholder="Enter your full name"
                  className="h-12 rounded-lg text-white placeholder:text-[#334455] focus-visible:ring-0 focus-visible:ring-offset-0"
                  style={{ background: "#001829", border: "1px solid #0a2840" }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = "1px solid #1565c0";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = "1px solid #0a2840";
                  }}
                  required
                  data-ocid="register.name_input"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium"
                  style={{ color: "#7799bb" }}
                >
                  Login ID (Email) <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="Enter your Login ID (Email)"
                  className="h-12 rounded-lg text-white placeholder:text-[#334455] focus-visible:ring-0 focus-visible:ring-offset-0"
                  style={{ background: "#001829", border: "1px solid #0a2840" }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = "1px solid #1565c0";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = "1px solid #0a2840";
                  }}
                  required
                  data-ocid="register.email_input"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium"
                  style={{ color: "#7799bb" }}
                >
                  Password <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={set("password")}
                    placeholder="Create a password (min. 6 chars)"
                    className="h-12 rounded-lg text-white placeholder:text-[#334455] pr-12 focus-visible:ring-0 focus-visible:ring-offset-0"
                    style={{
                      background: "#001829",
                      border: "1px solid #0a2840",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.border = "1px solid #1565c0";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border = "1px solid #0a2840";
                    }}
                    required
                    data-ocid="register.password_input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "#445566" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#42a5f5";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#445566";
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
                  style={{ color: "#7799bb" }}
                >
                  Confirm Password <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={set("confirmPassword")}
                    placeholder="Re-enter your password"
                    className="h-12 rounded-lg text-white placeholder:text-[#334455] pr-12 focus-visible:ring-0 focus-visible:ring-offset-0"
                    style={{
                      background: "#001829",
                      border: "1px solid #0a2840",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.border = "1px solid #1565c0";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border = "1px solid #0a2840";
                    }}
                    required
                    data-ocid="register.confirm_password_input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "#445566" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#42a5f5";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#445566";
                    }}
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 font-semibold text-sm rounded-lg text-white mt-3 transition-all"
                style={{
                  background: loading
                    ? "rgba(21,101,192,0.4)"
                    : "linear-gradient(135deg, #1565c0, #1976d2)",
                  border: "none",
                  boxShadow: loading
                    ? "none"
                    : "0 2px 16px rgba(21,101,192,0.35)",
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

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px" style={{ background: "#0a2035" }} />
              <span
                className="text-[10px] tracking-widest"
                style={{ color: "#334455" }}
              >
                ALREADY REGISTERED?
              </span>
              <div className="flex-1 h-px" style={{ background: "#0a2035" }} />
            </div>

            <button
              type="button"
              onClick={onNavigateLogin}
              className="w-full h-11 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all"
              style={{
                background: "transparent",
                border: "1px solid #0a2035",
                color: "#42a5f5",
                letterSpacing: "0.03em",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = "1px solid rgba(21,101,192,0.5)";
                e.currentTarget.style.background = "rgba(21,101,192,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = "1px solid #0a2035";
                e.currentTarget.style.background = "transparent";
              }}
              data-ocid="register.back_login_button"
            >
              <ArrowLeft size={14} />
              Back to Login
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 mt-5">
            <Shield size={11} style={{ color: "#223344" }} />
            <p className="text-center text-[11px]" style={{ color: "#223344" }}>
              &copy; {new Date().getFullYear()} Kuber Panel. All rights
              reserved. | Secured Platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
