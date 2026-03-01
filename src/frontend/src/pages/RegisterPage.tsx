import { KuberLogo } from "@/components/KuberLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateId, getUsers, setUsers } from "@/lib/storage";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
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

    setUsers([...users, newUser]);
    toast.success("Account created! Please login.");
    setLoading(false);
    onNavigateLogin();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
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
        <div className="bg-card border border-border rounded-2xl p-8 card-glow">
          {/* Header */}
          <div className="flex flex-col items-center mb-8 gap-3">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-28 h-28 rounded-full bg-primary/15 blur-2xl animate-pulse-gold" />
              <KuberLogo
                size={96}
                className="relative z-10 drop-shadow-[0_0_20px_oklch(0.82_0.18_85/0.6)]"
              />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-display font-bold gold-text-gradient">
                Create Account
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Join Kuber Panel Financial Platform
              </p>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-muted-foreground text-sm">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={set("name")}
                placeholder="Enter your full name"
                className="bg-secondary border-border focus:border-primary h-11 text-foreground placeholder:text-muted-foreground/50"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-muted-foreground text-sm">
                Gmail ID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="Enter your Gmail ID"
                className="bg-secondary border-border focus:border-primary h-11 text-foreground placeholder:text-muted-foreground/50"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-muted-foreground text-sm"
              >
                Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Create a password (min. 6 chars)"
                  className="bg-secondary border-border focus:border-primary h-11 text-foreground placeholder:text-muted-foreground/50 pr-11"
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

            <div className="space-y-1.5">
              <Label
                htmlFor="confirmPassword"
                className="text-muted-foreground text-sm"
              >
                Confirm Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={set("confirmPassword")}
                  placeholder="Re-enter your password"
                  className="bg-secondary border-border focus:border-primary h-11 text-foreground placeholder:text-muted-foreground/50 pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-semibold text-base gold-glow mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={onNavigateLogin}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mx-auto"
            >
              <ArrowLeft size={14} />
              Already have an account? Login
            </button>
          </div>
        </div>

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
