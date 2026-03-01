import { WelcomePopup } from "@/components/WelcomePopup";
import { Toaster } from "@/components/ui/sonner";
import {
  type LiveTransaction,
  generateId,
  getLiveTransactions,
  getSession,
  setLiveTransactions,
} from "@/lib/storage";
import { AdminDashboard } from "@/pages/AdminDashboard";
import { Dashboard } from "@/pages/Dashboard";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { useCallback, useEffect, useState } from "react";

type AppPage = "login" | "register" | "dashboard" | "admin";

type FundKey = "gaming" | "stock" | "political" | "mix";
const FUND_TYPES: FundKey[] = ["gaming", "stock", "political", "mix"];

// Fund-specific transaction amount ranges
const FUND_RANGES: Record<
  FundKey,
  { creditMin: number; creditMax: number; debitMin: number; debitMax: number }
> = {
  gaming: { creditMin: 200, creditMax: 5000, debitMin: 4000, debitMax: 50000 },
  stock: {
    creditMin: 10000,
    creditMax: 300000,
    debitMin: 40000,
    debitMax: 500000,
  },
  political: {
    creditMin: 10000,
    creditMax: 300000,
    debitMin: 40000,
    debitMax: 500000,
  },
  mix: { creditMin: 1000, creditMax: 30000, debitMin: 10000, debitMax: 60000 },
};

// Generate realistic decimal amount within range (2 decimal places)
function randAmount(min: number, max: number): number {
  const raw = min + Math.random() * (max - min);
  // Sometimes whole number, sometimes 1-2 decimal places (realistic banking)
  const r = Math.random();
  if (r < 0.3) return Math.round(raw);
  if (r < 0.65) return Math.round(raw * 10) / 10;
  return Math.round(raw * 100) / 100;
}

function generateTransaction(): LiveTransaction {
  const fundType = FUND_TYPES[Math.floor(Math.random() * FUND_TYPES.length)];
  const type: "credit" | "debit" = Math.random() > 0.45 ? "credit" : "debit";
  const range = FUND_RANGES[fundType];
  const amount =
    type === "credit"
      ? randAmount(range.creditMin, range.creditMax)
      : randAmount(range.debitMin, range.debitMax);

  return {
    id: generateId(),
    fundType,
    type,
    amount,
    timestamp: new Date().toISOString(),
  };
}

export default function App() {
  const [page, setPage] = useState<AppPage>("login");
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeName, setWelcomeName] = useState("");

  // Check existing session on mount
  useEffect(() => {
    const session = getSession();
    if (session) {
      setPage(session.isAdmin ? "admin" : "dashboard");
    }
  }, []);

  // Global live transaction simulator
  useEffect(() => {
    const interval = setInterval(() => {
      const txns = getLiveTransactions();
      const newTxn = generateTransaction();
      const updated = [...txns, newTxn].slice(-100);
      setLiveTransactions(updated);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleLoginSuccess = useCallback(
    (isAdmin: boolean, userName: string) => {
      setWelcomeName(userName);
      setShowWelcome(true);
      setTimeout(() => {
        setShowWelcome(false);
        setPage(isAdmin ? "admin" : "dashboard");
      }, 2000);
    },
    [],
  );

  const handleLogout = useCallback(() => {
    setPage("login");
  }, []);

  const handleNavigateRegister = useCallback(() => setPage("register"), []);
  const handleNavigateLogin = useCallback(() => setPage("login"), []);

  return (
    <>
      <Toaster
        theme="dark"
        toastOptions={{
          classNames: {
            toast: "bg-card border-border text-foreground",
            success: "border-success/30",
            error: "border-destructive/30",
          },
        }}
      />

      {showWelcome && (
        <WelcomePopup
          userName={welcomeName}
          onDismiss={() => {
            setShowWelcome(false);
            const session = getSession();
            setPage(session?.isAdmin ? "admin" : "dashboard");
          }}
        />
      )}

      {!showWelcome && (
        <>
          {page === "login" && (
            <LoginPage
              onLoginSuccess={handleLoginSuccess}
              onNavigateRegister={handleNavigateRegister}
            />
          )}
          {page === "register" && (
            <RegisterPage onNavigateLogin={handleNavigateLogin} />
          )}
          {page === "dashboard" && <Dashboard onLogout={handleLogout} />}
          {page === "admin" && <AdminDashboard onLogout={handleLogout} />}
        </>
      )}
    </>
  );
}
