import { Button } from "@/components/ui/button";
import { FUND_CONFIG, getSession, getUsers, setSession } from "@/lib/storage";
import { ActivationPanel } from "@/modules/ActivationPanel";
import { AddBankAccount } from "@/modules/AddBankAccount";
import { FundModule } from "@/modules/FundModule";
import { HelpSupport } from "@/modules/HelpSupport";
import { LiveActivity } from "@/modules/LiveActivity";
import { MyCommission } from "@/modules/MyCommission";
import { Withdrawal } from "@/modules/Withdrawal";
import { WithdrawalHistory } from "@/modules/WithdrawalHistory";
import {
  Activity,
  ArrowDownToLine,
  BarChart3,
  Building2,
  ChevronRight,
  Gamepad2,
  History,
  Landmark,
  Lock,
  LogOut,
  Menu,
  MessageCircle,
  Shield,
  Shuffle,
  TrendingUp,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type Module =
  | "home"
  | "bank"
  | "gaming"
  | "stock"
  | "political"
  | "mix"
  | "commission"
  | "activity"
  | "withdrawal"
  | "history"
  | "support"
  | "activation";

interface DashboardProps {
  onLogout: () => void;
}

const NAV_ITEMS = [
  {
    id: "bank" as Module,
    label: "Add Bank Account",
    icon: Building2,
    requiresActivation: false,
  },
  {
    id: "gaming" as Module,
    label: `Gaming Fund (${FUND_CONFIG.gaming.percentage}%)`,
    icon: Gamepad2,
    requiresActivation: true,
  },
  {
    id: "stock" as Module,
    label: `Stock Fund (${FUND_CONFIG.stock.percentage}%)`,
    icon: TrendingUp,
    requiresActivation: true,
  },
  {
    id: "political" as Module,
    label: `Political Fund (${FUND_CONFIG.political.percentage}%)`,
    icon: Landmark,
    requiresActivation: true,
  },
  {
    id: "mix" as Module,
    label: `Mix Fund (${FUND_CONFIG.mix.percentage}%)`,
    icon: Shuffle,
    requiresActivation: true,
  },
  {
    id: "commission" as Module,
    label: "My Commission",
    icon: BarChart3,
    requiresActivation: true,
  },
  {
    id: "activity" as Module,
    label: "Live Activity",
    icon: Activity,
    requiresActivation: true,
  },
  {
    id: "withdrawal" as Module,
    label: "Withdrawal",
    icon: ArrowDownToLine,
    requiresActivation: true,
  },
  {
    id: "history" as Module,
    label: "Withdrawal History",
    icon: History,
    requiresActivation: true,
  },
  {
    id: "support" as Module,
    label: "Help Support",
    icon: MessageCircle,
    requiresActivation: false,
  },
  {
    id: "activation" as Module,
    label: "Activation Panel",
    icon: Shield,
    requiresActivation: false,
  },
];

const MODULE_CARDS = [
  {
    id: "bank" as Module,
    label: "Add Bank Account",
    icon: Building2,
    desc: "Link your bank for transactions",
    color: "from-blue-500/20 to-blue-500/5",
    border: "border-blue-500/30",
  },
  {
    id: "gaming" as Module,
    label: "Gaming Fund",
    icon: Gamepad2,
    desc: "15% returns",
    color: "from-purple-500/20 to-purple-500/5",
    border: "border-purple-500/30",
  },
  {
    id: "stock" as Module,
    label: "Stock Fund",
    icon: TrendingUp,
    desc: "30% returns",
    color: "from-cyan-500/20 to-cyan-500/5",
    border: "border-cyan-500/30",
  },
  {
    id: "political" as Module,
    label: "Political Fund",
    icon: Landmark,
    desc: "30% returns",
    color: "from-red-500/20 to-red-500/5",
    border: "border-red-500/30",
  },
  {
    id: "mix" as Module,
    label: "Mix Fund",
    icon: Shuffle,
    desc: "25% returns",
    color: "from-green-500/20 to-green-500/5",
    border: "border-green-500/30",
  },
  {
    id: "commission" as Module,
    label: "My Commission",
    icon: BarChart3,
    desc: "Track your earnings",
    color: "from-yellow-500/20 to-yellow-500/5",
    border: "border-yellow-500/30",
  },
  {
    id: "activity" as Module,
    label: "Live Activity",
    icon: Activity,
    desc: "Real-time transactions",
    color: "from-emerald-500/20 to-emerald-500/5",
    border: "border-emerald-500/30",
  },
  {
    id: "withdrawal" as Module,
    label: "Withdrawal",
    icon: ArrowDownToLine,
    desc: "Withdraw your funds",
    color: "from-orange-500/20 to-orange-500/5",
    border: "border-orange-500/30",
  },
  {
    id: "history" as Module,
    label: "Withdrawal History",
    icon: History,
    desc: "30 day history",
    color: "from-slate-500/20 to-slate-500/5",
    border: "border-slate-500/30",
  },
  {
    id: "support" as Module,
    label: "Help Support",
    icon: MessageCircle,
    desc: "Get instant help",
    color: "from-sky-500/20 to-sky-500/5",
    border: "border-sky-500/30",
  },
  {
    id: "activation" as Module,
    label: "Activation Panel",
    icon: Shield,
    desc: "Unlock all features",
    color: "from-amber-500/20 to-amber-500/5",
    border: "border-amber-500/30",
  },
];

export function Dashboard({ onLogout }: DashboardProps) {
  const session = getSession();
  const [currentModule, setCurrentModule] = useState<Module>("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isActivated, setIsActivated] = useState(false);

  const refreshActivation = useCallback(() => {
    if (!session) return;
    if (session.isAdmin) {
      setIsActivated(true);
      return;
    }
    const users = getUsers();
    const user = users.find((u) => u.id === session.userId);
    setIsActivated(user?.isActivated ?? false);
  }, [session]);

  useEffect(() => {
    refreshActivation();
  }, [refreshActivation]);

  const handleLogout = () => {
    setSession(null);
    onLogout();
  };

  const navigate = (mod: Module) => {
    setCurrentModule(mod);
    setSidebarOpen(false);
  };

  const renderModule = () => {
    switch (currentModule) {
      case "bank":
        return <AddBankAccount />;
      case "gaming":
        return <FundModule fundType="gaming" isActivated={isActivated} />;
      case "stock":
        return <FundModule fundType="stock" isActivated={isActivated} />;
      case "political":
        return <FundModule fundType="political" isActivated={isActivated} />;
      case "mix":
        return <FundModule fundType="mix" isActivated={isActivated} />;
      case "commission":
        return (
          <MyCommission
            isActivated={isActivated}
            onWithdraw={() => navigate("withdrawal")}
          />
        );
      case "activity":
        return <LiveActivity isActivated={isActivated} />;
      case "withdrawal":
        return <Withdrawal isActivated={isActivated} />;
      case "history":
        return <WithdrawalHistory isActivated={isActivated} />;
      case "support":
        return <HelpSupport />;
      case "activation":
        return (
          <ActivationPanel
            isActivated={isActivated}
            onActivated={refreshActivation}
          />
        );
      default:
        return <HomeView isActivated={isActivated} onNavigate={navigate} />;
    }
  };

  const currentItem = NAV_ITEMS.find((i) => i.id === currentModule);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo area */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <img
              src="/assets/generated/kuber-panel-official-logo-transparent.dim_400x400.png"
              alt="Kuber Panel"
              className="w-11 h-11 drop-shadow-[0_0_8px_oklch(0.82_0.18_85/0.5)]"
            />
            <div>
              <p className="font-display font-bold text-primary text-sm leading-tight">
                Kuber Panel
              </p>
              <p className="text-xs text-muted-foreground">
                Financial Platform
              </p>
            </div>
          </div>

          {/* User info */}
          <div className="mt-3 p-2.5 bg-secondary rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                {session?.userName?.[0]?.toUpperCase() ?? "U"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">
                  {session?.userName ?? "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {session?.userEmail}
                </p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${isActivated ? "bg-green-400" : "bg-yellow-400"}`}
              />
              <span className="text-xs text-muted-foreground">
                {isActivated ? "Activated" : "Not Activated"}
              </span>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-2">
          <button
            type="button"
            onClick={() => navigate("home")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
              currentModule === "home"
                ? "nav-item-active"
                : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
            }`}
          >
            <Building2 className="w-4 h-4 shrink-0" />
            Dashboard Home
          </button>

          {NAV_ITEMS.map((item) => {
            const locked = item.requiresActivation && !isActivated;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  currentModule === item.id
                    ? "nav-item-active"
                    : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left truncate">{item.label}</span>
                {locked && <Lock className="w-3 h-3 shrink-0 opacity-50" />}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-2 justify-start"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-14 bg-card border-b border-border flex items-center px-4 gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-5 h-5" />
          </Button>

          {currentModule !== "home" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("home")}
              className="text-muted-foreground hover:text-foreground gap-1.5 hidden sm:flex"
            >
              Dashboard
              <ChevronRight className="w-3 h-3" />
              <span className="text-foreground">
                {currentItem?.label ?? "Module"}
              </span>
            </Button>
          )}

          <div className="ml-auto flex items-center gap-3">
            {!isActivated && (
              <button
                type="button"
                onClick={() => navigate("activation")}
                className="text-xs flex items-center gap-1.5 bg-warning/10 text-warning border border-warning/30 px-2.5 py-1 rounded-full hover:bg-warning/20 transition-colors"
              >
                <Shield className="w-3 h-3" />
                Activate Panel
              </button>
            )}
            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium text-foreground">
                {session?.userName}
              </p>
              <p className="text-xs text-muted-foreground">
                {session?.userEmail}
              </p>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {renderModule()}
        </main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border grid grid-cols-5 h-14">
          {[
            { id: "home" as Module, icon: Building2, label: "Home" },
            { id: "activation" as Module, icon: Shield, label: "Activate" },
            { id: "activity" as Module, icon: Activity, label: "Live" },
            { id: "commission" as Module, icon: BarChart3, label: "Earnings" },
            { id: "support" as Module, icon: MessageCircle, label: "Help" },
          ].map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
                currentModule === item.id
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="text-[10px]">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

// Home view with cards grid
function HomeView({
  isActivated,
  onNavigate,
}: {
  isActivated: boolean;
  onNavigate: (mod: Module) => void;
}) {
  const LOCKED_IDS: Module[] = [
    "gaming",
    "stock",
    "political",
    "mix",
    "commission",
    "activity",
    "withdrawal",
    "history",
  ];

  return (
    <div className="space-y-6 pb-16 lg:pb-0 animate-fade-in-up">
      {/* Welcome banner */}
      {!isActivated && (
        <button
          type="button"
          className="w-full bg-warning/10 border border-warning/30 rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:bg-warning/15 transition-colors text-left"
          onClick={() => onNavigate("activation")}
        >
          <Shield className="w-5 h-5 text-warning shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-warning">
              Panel Not Activated
            </p>
            <p className="text-xs text-muted-foreground">
              Click here to activate your panel and unlock all features.
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-warning shrink-0" />
        </button>
      )}

      <div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-1">
          Dashboard
        </h2>
        <p className="text-muted-foreground text-sm">
          Select a module to get started
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {MODULE_CARDS.map((card) => {
          const locked = LOCKED_IDS.includes(card.id) && !isActivated;
          return (
            <button
              type="button"
              key={card.id}
              onClick={() => onNavigate(card.id)}
              className={`relative bg-gradient-to-br ${card.color} border ${card.border} rounded-xl p-4 text-left transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20 active:scale-[0.98] group`}
            >
              {locked && (
                <div className="absolute inset-0 lock-overlay rounded-xl flex items-center justify-center z-10">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
              )}
              <div className={locked ? "opacity-40" : ""}>
                <div className="w-9 h-9 rounded-lg bg-black/20 flex items-center justify-center mb-3">
                  <card.icon
                    className="w-4.5 h-4.5 text-foreground"
                    style={{ width: 18, height: 18 }}
                  />
                </div>
                <p className="text-sm font-semibold text-foreground leading-tight">
                  {card.label}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {card.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Close sidebar button for mobile (rendered inside sidebar, not needed separately)
export function SidebarCloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button type="button" onClick={onClose} className="lg:hidden">
      <X className="w-5 h-5" />
    </button>
  );
}
