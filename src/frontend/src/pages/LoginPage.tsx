import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  getSupportLink,
  getUsers,
  setSession,
} from "@/lib/storage";
import { ExternalLink, Eye, EyeOff, Loader2 } from "lucide-react";
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
      setSession({
        userId: "admin",
        isAdmin: true,
        userName: "Administrator",
        userEmail: ADMIN_EMAIL,
      });
      setLoading(false);
      onLoginSuccess(true, "Administrator");
      return;
    }

    // User check
    const users = getUsers();
    const user = users.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.password === password,
    );

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
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-primary/3 blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.82 0.18 85 / 0.3) 1px, transparent 1px), linear-gradient(90deg, oklch(0.82 0.18 85 / 0.3) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="relative w-full max-w-md animate-fade-in-up">
        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-8 card-glow">
          {/* Header */}
          <div className="flex flex-col items-center mb-8 gap-2">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-36 h-36 rounded-full bg-primary/15 blur-2xl animate-pulse-gold" />
              <img
                src="/assets/generated/kuber-panel-official-logo-transparent.dim_400x400.png"
                alt="Kuber Panel Logo"
                className="w-32 h-32 relative z-10 drop-shadow-[0_0_24px_oklch(0.82_0.18_85/0.7)]"
              />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-muted-foreground text-sm font-medium"
              >
                Gmail ID
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your Gmail ID"
                className="bg-secondary border-border focus:border-primary h-11 text-foreground placeholder:text-muted-foreground/50"
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-muted-foreground text-sm font-medium"
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
                  className="bg-secondary border-border focus:border-primary h-11 text-foreground placeholder:text-muted-foreground/50 pr-11"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-semibold text-base gold-glow"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>

          {/* Footer links */}
          <div className="mt-6 flex flex-col items-center gap-3">
            <a
              href={supportLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              <ExternalLink size={14} />
              Help &amp; Support
            </a>

            <p className="text-muted-foreground text-sm">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={onNavigateRegister}
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Register
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-muted-foreground text-xs mt-4">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary/70 hover:text-primary transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
