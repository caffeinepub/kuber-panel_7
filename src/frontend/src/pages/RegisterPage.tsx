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
      style={{
        background:
          "linear-gradient(135deg, #0a0a0f 0%, #0d0b14 40%, #0a0808 100%)",
      }}
    >
      {/* Left decorative panel - desktop only */}
      <div
        className="hidden lg:flex lg:w-2/5 flex-col items-center justify-center relative p-12"
        style={{
          background:
            "linear-gradient(145deg, #0d0b14 0%, #130f1e 60%, #0a0808 100%)",
        }}
      >
        {/* Gold border right side */}
        <div
          className="absolute right-0 top-0 bottom-0 w-px"
          style={{
            background:
              "linear-gradient(180deg, transparent, #d4a017 30%, #f5d060 50%, #d4a017 70%, transparent)",
          }}
        />

        {/* Glow */}
        <div
          className="absolute w-80 h-80 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(212,160,23,0.12) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -55%)",
          }}
        />

        <div className="relative z-10 flex flex-col items-center gap-6 text-center">
          <KuberLogo
            size={150}
            className="drop-shadow-[0_0_35px_rgba(212,160,23,0.55)]"
          />
          <div>
            <h1
              className="text-3xl font-bold"
              style={{
                background:
                  "linear-gradient(135deg, #d4a017, #f5d060, #d4a017)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              KUBER PANEL
            </h1>
            <p className="text-gray-500 text-xs tracking-widest uppercase mt-2">
              Financial Management Platform
            </p>
          </div>

          <div
            className="mt-4 p-5 rounded-2xl text-left w-full"
            style={{
              background: "rgba(212,160,23,0.05)",
              border: "1px solid rgba(212,160,23,0.12)",
            }}
          >
            <p className="text-yellow-500 text-xs font-semibold uppercase tracking-wider mb-3">
              Why Join Kuber Panel?
            </p>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-yellow-500">✓</span> Multiple Fund Options
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-500">✓</span> Live Transaction
                Monitoring
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-500">✓</span> Secure Withdrawal
                System
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-500">✓</span> Commission Tracking
              </li>
            </ul>
          </div>
        </div>

        <div
          className="absolute bottom-8 left-12 right-12 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(212,160,23,0.25), transparent)",
          }}
        />
      </div>

      {/* Right - Register form */}
      <div className="w-full lg:w-3/5 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-0 right-0 w-96 h-96 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(212,160,23,0.05) 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative w-full max-w-md py-4">
          {/* Mobile logo */}
          <div className="flex lg:hidden flex-col items-center mb-6 gap-3">
            <KuberLogo
              size={90}
              className="drop-shadow-[0_0_25px_rgba(212,160,23,0.5)]"
            />
            <h2
              className="text-xl font-bold"
              style={{
                background: "linear-gradient(135deg, #d4a017, #f5d060)",
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
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(212,160,23,0.2)",
              backdropFilter: "blur(20px)",
              boxShadow:
                "0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(212,160,23,0.1)",
            }}
          >
            {/* Card Header */}
            <div className="mb-7">
              <div className="flex items-center gap-2 mb-1">
                <UserPlus size={14} className="text-yellow-500" />
                <span className="text-xs text-gray-500 uppercase tracking-widest">
                  New Account
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white">Create Account</h2>
              <p className="text-gray-500 text-sm mt-1">
                Join Kuber Panel Financial Platform
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="name"
                  className="text-gray-400 text-sm font-medium"
                >
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={set("name")}
                  placeholder="Enter your full name"
                  className="h-12 text-white placeholder:text-gray-600 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(212,160,23,0.2)",
                  }}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-gray-400 text-sm font-medium"
                >
                  Gmail ID <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="Enter your Gmail ID"
                  className="h-12 text-white placeholder:text-gray-600 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(212,160,23,0.2)",
                  }}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  className="text-gray-400 text-sm font-medium"
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
                    className="h-12 text-white placeholder:text-gray-600 rounded-xl pr-12"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(212,160,23,0.2)",
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-yellow-500 transition-colors"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="confirmPassword"
                  className="text-gray-400 text-sm font-medium"
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
                    className="h-12 text-white placeholder:text-gray-600 rounded-xl pr-12"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(212,160,23,0.2)",
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-yellow-500 transition-colors"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 font-semibold text-base rounded-xl text-black mt-3"
                style={{
                  background: loading
                    ? "rgba(212,160,23,0.5)"
                    : "linear-gradient(135deg, #d4a017, #f5d060, #d4a017)",
                  boxShadow: loading
                    ? "none"
                    : "0 4px 20px rgba(212,160,23,0.35)",
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div
                className="flex-1 h-px"
                style={{ background: "rgba(212,160,23,0.15)" }}
              />
              <span className="text-gray-600 text-xs">ALREADY REGISTERED?</span>
              <div
                className="flex-1 h-px"
                style={{ background: "rgba(212,160,23,0.15)" }}
              />
            </div>

            <button
              type="button"
              onClick={onNavigateLogin}
              className="w-full h-11 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all hover:border-yellow-500/40"
              style={{
                background: "transparent",
                border: "1px solid rgba(212,160,23,0.25)",
                color: "#f5d060",
              }}
            >
              <ArrowLeft size={14} />
              Back to Login
            </button>
          </div>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-2 mt-5">
            <Shield size={12} className="text-gray-600" />
            <p className="text-center text-gray-600 text-xs">
              © {new Date().getFullYear()} Kuber Panel. All rights reserved. |
              Secured Platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
