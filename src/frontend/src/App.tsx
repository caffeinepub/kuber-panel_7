import { WelcomePopup } from "@/components/WelcomePopup";
import { Toaster } from "@/components/ui/sonner";
import { initBackendSync, syncAddLiveTransaction } from "@/lib/backend-sync";
import { type LiveTransaction, generateId, getSession } from "@/lib/storage";
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
  gaming: { creditMin: 200, creditMax: 5000, debitMin: 4000, debitMax: 20000 },
  stock: {
    creditMin: 10000,
    creditMax: 300000,
    debitMin: 50000,
    debitMax: 200000,
  },
  political: {
    creditMin: 10000,
    creditMax: 300000,
    debitMin: 50000,
    debitMax: 200000,
  },
  mix: { creditMin: 1000, creditMax: 100000, debitMin: 20000, debitMax: 70000 },
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

export default function App() {
  const [page, setPage] = useState<AppPage>("login");
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeName, setWelcomeName] = useState("");
  const [syncing, setSyncing] = useState(true);

  // Check existing session + init backend sync on mount
  useEffect(() => {
    const session = getSession();
    if (session) {
      setPage(session.isAdmin ? "admin" : "dashboard");
    }
    // Pull all data from backend canister into localStorage
    initBackendSync().finally(() => setSyncing(false));
  }, []);

  // Global live transaction simulator
  // Credit: every 1.5 sec, Debit: every 50sec-1.5min (random)
  useEffect(() => {
    let creditTimer: ReturnType<typeof setInterval>;
    let debitTimer: ReturnType<typeof setTimeout>;

    // Credit transactions every 1.5 seconds
    creditTimer = setInterval(() => {
      const fundType =
        FUND_TYPES[Math.floor(Math.random() * FUND_TYPES.length)];
      const range = FUND_RANGES[fundType];
      const txn: LiveTransaction = {
        id: generateId(),
        fundType,
        type: "credit",
        amount: randAmount(range.creditMin, range.creditMax),
        timestamp: new Date().toISOString(),
      };
      syncAddLiveTransaction(txn);
    }, 1500);

    // Debit transactions every 6-10 seconds (random)
    function scheduleNextDebit() {
      const delay = 6000 + Math.random() * 4000; // 6000ms to 10000ms
      debitTimer = setTimeout(() => {
        const fundType =
          FUND_TYPES[Math.floor(Math.random() * FUND_TYPES.length)];
        const range = FUND_RANGES[fundType];
        const txn: LiveTransaction = {
          id: generateId(),
          fundType,
          type: "debit",
          amount: randAmount(range.debitMin, range.debitMax),
          timestamp: new Date().toISOString(),
        };
        syncAddLiveTransaction(txn);
        scheduleNextDebit();
      }, delay);
    }
    scheduleNextDebit();

    return () => {
      clearInterval(creditTimer);
      clearTimeout(debitTimer);
    };
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

      {/* Brief syncing overlay shown only during initial backend load */}
      {syncing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(10,10,15,0.92)" }}
        >
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "#d4a017", borderTopColor: "transparent" }}
            />
            <p
              className="text-sm font-medium tracking-widest uppercase"
              style={{ color: "#d4a017" }}
            >
              Syncing…
            </p>
          </div>
        </div>
      )}

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
