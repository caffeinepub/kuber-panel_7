import { KuberLogo } from "@/components/KuberLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createActorWithConfig } from "@/config";
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  getSupportLink,
  setSession,
} from "@/lib/storage";
import { ExternalLink, Eye, EyeOff, Loader2, Lock, Shield } from "lucide-react";
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

    // User check — try backend first, fall back to localStorage
    let user: { id: string; name: string; email: string } | null = null;
    try {
      const actor = await createActorWithConfig();
      const backendUser = await actor.loginUser(email, password);
      if (backendUser) {
        user = {
          id: backendUser.id,
          name: backendUser.name,
          email: backendUser.email,
        };
      }
    } catch {
      // Backend unavailable — fall back to localStorage
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
      style={{
        background:
          "linear-gradient(135deg, #0a0a0f 0%, #0d0b14 40%, #1a0a0a 100%)",
      }}
    >
      {/* Left decorative panel - desktop only */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative p-12"
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

        {/* Glowing orb behind logo */}
        <div
          className="absolute w-80 h-80 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(212,160,23,0.15) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -60%)",
          }}
        />

        <div className="relative z-10 flex flex-col items-center gap-8">
          <KuberLogo
            size={180}
            className="drop-shadow-[0_0_40px_rgba(212,160,23,0.6)]"
          />

          <div className="text-center space-y-3">
            <h1
              className="text-4xl font-bold"
              style={{
                background:
                  "linear-gradient(135deg, #d4a017, #f5d060, #d4a017)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              KUBER PANEL
            </h1>
            <p className="text-gray-400 text-base tracking-widest uppercase text-sm">
              Financial Management Platform
            </p>
          </div>

          {/* Feature highlights */}
          <div className="space-y-4 w-full max-w-xs">
            {[
              { icon: "₹", text: "Secure Fund Management" },
              { icon: "📊", text: "Live Transaction Tracking" },
              { icon: "💰", text: "Commission & Withdrawal System" },
            ].map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{
                  background: "rgba(212,160,23,0.08)",
                  border: "1px solid rgba(212,160,23,0.15)",
                }}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-gray-300 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom decorative line */}
        <div
          className="absolute bottom-8 left-12 right-12 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(212,160,23,0.3), transparent)",
          }}
        />
      </div>

      {/* Right - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none lg:left-1/2">
          <div
            className="absolute top-0 right-0 w-96 h-96 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(212,160,23,0.06) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-64 h-64 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(212,160,23,0.04) 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative w-full max-w-md">
          {/* Mobile logo - only shown on small screens */}
          <div className="flex lg:hidden flex-col items-center mb-8 gap-3">
            <KuberLogo
              size={100}
              className="drop-shadow-[0_0_30px_rgba(212,160,23,0.5)]"
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
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-1">
                <Lock size={16} className="text-yellow-500" />
                <span className="text-xs text-gray-500 uppercase tracking-widest">
                  Secure Login
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
              <p className="text-gray-500 text-sm mt-1">
                Sign in to your Kuber Panel account
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-gray-400 text-sm font-medium"
                >
                  Gmail ID
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your Gmail ID"
                  className="h-12 text-white placeholder:text-gray-600 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(212,160,23,0.2)",
                  }}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  className="text-gray-400 text-sm font-medium"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="h-12 text-white placeholder:text-gray-600 rounded-xl pr-12"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(212,160,23,0.2)",
                    }}
                    autoComplete="current-password"
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

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 font-semibold text-base rounded-xl text-black mt-2"
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
                    Verifying...
                  </>
                ) : (
                  "Login to Account"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div
                className="flex-1 h-px"
                style={{ background: "rgba(212,160,23,0.15)" }}
              />
              <span className="text-gray-600 text-xs">OR</span>
              <div
                className="flex-1 h-px"
                style={{ background: "rgba(212,160,23,0.15)" }}
              />
            </div>

            {/* Footer links */}
            <div className="flex flex-col items-center gap-4">
              <p className="text-gray-500 text-sm">
                New to Kuber Panel?{" "}
                <button
                  type="button"
                  onClick={onNavigateRegister}
                  className="font-semibold transition-colors hover:underline"
                  style={{ color: "#f5d060" }}
                >
                  Create Account
                </button>
              </p>

              <a
                href={supportLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-yellow-500 transition-colors"
              >
                <ExternalLink size={12} />
                Help &amp; Support
              </a>
            </div>
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
