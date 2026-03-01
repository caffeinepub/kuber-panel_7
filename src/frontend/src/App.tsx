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

function generateTransaction(): LiveTransaction {
  const fundType = FUND_TYPES[Math.floor(Math.random() * FUND_TYPES.length)];
  const type: "credit" | "debit" = Math.random() > 0.4 ? "credit" : "debit";
  const amount =
    type === "credit"
      ? Math.floor(Math.random() * 49000 + 1000)
      : Math.floor(Math.random() * 19500 + 500);

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
    }, 2500);
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
