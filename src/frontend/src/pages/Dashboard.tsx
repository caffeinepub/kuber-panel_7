import { KuberLogo } from "@/components/KuberLogo";
import { Button } from "@/components/ui/button";
import {
  FUND_CONFIG,
  type User,
  getSession,
  getUsers,
  setSession,
} from "@/lib/storage";
import { AccountStatement } from "@/modules/AccountStatement";
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
  ChevronLeft,
  ChevronRight,
  FileText,
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
  | "activation"
  | "account-statement";

interface DashboardProps {
  onLogout: () => void;
}

const NAV_ITEMS = [
  {
    id: "bank" as Module,
    label: "Add Bank Account",
    icon: Building2,
    requiresActivation: true,
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
    label: "Live Fund Activity",
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
  {
    id: "account-statement" as Module,
    label: "Account Statement",
    icon: FileText,
    requiresActivation: true,
  },
];

const MODULE_CARDS = [
  {
    id: "bank" as Module,
    label: "Add Bank Account",
    icon: Building2,
    desc: "Link your bank",
    color: "from-[#003580] to-[#001845]",
    border: "border-[#1a6bbf]/60",
    iconBg: "bg-[#1a6bbf]/30",
    iconColor: "text-[#5ab4ff]",
  },
  {
    id: "account-statement" as Module,
    label: "Account Statement",
    icon: FileText,
    desc: "30-day bank statement",
    color: "from-[#00396b] to-[#001c35]",
    border: "border-[#0288d1]/60",
    iconBg: "bg-[#0288d1]/30",
    iconColor: "text-[#40c4ff]",
  },
  {
    id: "gaming" as Module,
    label: "Gaming Fund",
    icon: Gamepad2,
    desc: "15% commission",
    color: "from-[#3a0078] to-[#1e003d]",
    border: "border-[#9c27b0]/60",
    iconBg: "bg-[#9c27b0]/30",
    iconColor: "text-[#e040fb]",
  },
  {
    id: "stock" as Module,
    label: "Stock Fund",
    icon: TrendingUp,
    desc: "30% commission",
    color: "from-[#003d1f] to-[#001e10]",
    border: "border-[#2e7d32]/60",
    iconBg: "bg-[#2e7d32]/30",
    iconColor: "text-[#69f0ae]",
  },
  {
    id: "political" as Module,
    label: "Political Fund",
    icon: Landmark,
    desc: "30% commission",
    color: "from-[#7a0000] to-[#3d0000]",
    border: "border-[#d32f2f]/60",
    iconBg: "bg-[#d32f2f]/30",
    iconColor: "text-[#ff6e6e]",
  },
  {
    id: "mix" as Module,
    label: "Mix Fund",
    icon: Shuffle,
    desc: "25% commission",
    color: "from-[#004d1a] to-[#00260d]",
    border: "border-[#388e3c]/60",
    iconBg: "bg-[#388e3c]/30",
    iconColor: "text-[#b9f6ca]",
  },
  {
    id: "commission" as Module,
    label: "My Commission",
    icon: BarChart3,
    desc: "Track your earnings",
    color: "from-[#7a4000] to-[#3d2000]",
    border: "border-[#f57c00]/60",
    iconBg: "bg-[#f57c00]/30",
    iconColor: "text-[#ffcc02]",
  },
  {
    id: "activity" as Module,
    label: "Live Fund Activity",
    icon: Activity,
    desc: "Real-time transactions",
    color: "from-[#004d3a] to-[#002620]",
    border: "border-[#00897b]/60",
    iconBg: "bg-[#00897b]/30",
    iconColor: "text-[#64ffda]",
  },
  {
    id: "withdrawal" as Module,
    label: "Withdrawal",
    icon: ArrowDownToLine,
    desc: "View withdrawal info",
    color: "from-[#7a2600] to-[#3d1300]",
    border: "border-[#e64a19]/60",
    iconBg: "bg-[#e64a19]/30",
    iconColor: "text-[#ffccbc]",
  },
  {
    id: "history" as Module,
    label: "Withdrawal History",
    icon: History,
    desc: "30 day history",
    color: "from-[#1a0066] to-[#0d0033]",
    border: "border-[#512da8]/60",
    iconBg: "bg-[#512da8]/30",
    iconColor: "text-[#b39ddb]",
  },
  {
    id: "support" as Module,
    label: "Help Support",
    icon: MessageCircle,
    desc: "Get instant help",
    color: "from-[#005566] to-[#002a33]",
    border: "border-[#0097a7]/60",
    iconBg: "bg-[#0097a7]/30",
    iconColor: "text-[#80deea]",
  },
  {
    id: "activation" as Module,
    label: "Activation Panel",
    icon: Shield,
    desc: "Unlock all features",
    color: "from-[#7a5500] to-[#3d2b00]",
    border: "border-[#ffa000]/60",
    iconBg: "bg-[#ffa000]/30",
    iconColor: "text-[#ffe57f]",
  },
];

export function Dashboard({ onLogout }: DashboardProps) {
  const session = getSession();
  const [currentModule, setCurrentModule] = useState<Module>("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [activatedFunds, setActivatedFunds] =
    useState<User["activatedFunds"]>(undefined);

  const refreshActivation = useCallback(() => {
    if (!session) return;
    if (session.isAdmin) {
      setIsActivated(true);
      setActivatedFunds({
        gaming: true,
        stock: true,
        political: true,
        mix: true,
      });
      return;
    }
    const users = getUsers();
    const user = users.find((u) => u.id === session.userId);
    const activated = user?.isActivated ?? false;
    setIsActivated(activated);
    // Strict: only use actual activatedFunds from user record
    if (activated && user?.activatedFunds) {
      setActivatedFunds(user.activatedFunds);
    } else {
      setActivatedFunds(activated ? {} : undefined);
    }
  }, [session]);

  useEffect(() => {
    refreshActivation();
  }, [refreshActivation]);

  useEffect(() => {
    const id = setInterval(refreshActivation, 2000);
    return () => clearInterval(id);
  }, [refreshActivation]);

  const handleLogout = () => {
    setSession(null);
    onLogout();
  };

  const navigate = (mod: Module) => {
    setCurrentModule(mod);
    setSidebarOpen(false);
  };

  // Per-fund activation: admin always has all, users use per-fund state
  const isFundActivated = (fund: "gaming" | "stock" | "political" | "mix") => {
    if (session?.isAdmin) return true;
    return activatedFunds?.[fund] ?? false;
  };

  const renderModule = () => {
    switch (currentModule) {
      case "bank":
        return <AddBankAccount isActivated={isActivated} />;
      case "gaming":
        return (
          <FundModule
            fundType="gaming"
            isActivated={isFundActivated("gaming")}
          />
        );
      case "stock":
        return (
          <FundModule fundType="stock" isActivated={isFundActivated("stock")} />
        );
      case "political":
        return (
          <FundModule
            fundType="political"
            isActivated={isFundActivated("political")}
          />
        );
      case "mix":
        return (
          <FundModule fundType="mix" isActivated={isFundActivated("mix")} />
        );
      case "commission":
        return (
          <MyCommission
            isActivated={isActivated}
            onWithdraw={() => {}}
            viewOnly={true}
          />
        );
      case "activity":
        return (
          <LiveActivity
            isActivated={isActivated}
            isAdmin={session?.isAdmin ?? false}
          />
        );
      case "withdrawal":
        return <Withdrawal isActivated={isActivated} isUserMode={true} />;
      case "history":
        return <WithdrawalHistory isActivated={isActivated} />;
      case "support":
        return <HelpSupport />;
      case "activation":
        return (
          <ActivationPanel
            isActivated={isActivated}
            onActivated={refreshActivation}
            activatedFunds={activatedFunds}
          />
        );
      case "account-statement":
        return (
          <AccountStatement
            isActivated={isActivated}
            isAdmin={session?.isAdmin ?? false}
          />
        );
      default:
        return (
          <HomeView
            isActivated={isActivated}
            activatedFunds={activatedFunds}
            isAdmin={session?.isAdmin ?? false}
            onNavigate={navigate}
          />
        );
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
            <KuberLogo
              size={44}
              className="drop-shadow-[0_0_8px_oklch(0.82_0.18_85/0.5)]"
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
            {/* LIVE Platform Status */}
            <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 px-2.5 py-1 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-xs text-green-400 font-medium">LIVE</span>
            </div>
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
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 lg:pb-6">
          {currentModule !== "home" && (
            <div className="mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("home")}
                className="text-muted-foreground hover:text-foreground gap-2 pl-0"
                data-ocid="dashboard.back_to_home_button"
              >
                <ChevronLeft className="w-4 h-4" />
                Dashboard
              </Button>
            </div>
          )}
          {renderModule()}
        </main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border grid grid-cols-5 h-14">
          {[
            { id: "home" as Module, icon: Building2, label: "Home" },
            { id: "activation" as Module, icon: Shield, label: "Activate" },
            { id: "activity" as Module, icon: Activity, label: "Live Fund" },
            { id: "history" as Module, icon: History, label: "History" },
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
  activatedFunds,
  isAdmin,
  onNavigate,
}: {
  isActivated: boolean;
  activatedFunds?: User["activatedFunds"];
  isAdmin: boolean;
  onNavigate: (mod: Module) => void;
}) {
  // For fund cards, check per-fund activation; for other locked items, check global activation
  const GENERAL_LOCKED_IDS: Module[] = [
    "bank",
    "account-statement",
    "commission",
    "activity",
    "withdrawal",
    "history",
  ];
  const FUND_IDS: Module[] = ["gaming", "stock", "political", "mix"];

  const isFundLocked = (id: Module): boolean => {
    if (isAdmin) return false;
    if (FUND_IDS.includes(id)) {
      const fundKey = id as "gaming" | "stock" | "political" | "mix";
      // Strict: only unlock if that specific fund is in activatedFunds
      if (!isActivated) return true;
      return !(activatedFunds?.[fundKey] ?? false);
    }
    if (GENERAL_LOCKED_IDS.includes(id)) {
      return !isActivated;
    }
    return false;
  };

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

      {/* Kuber Logo + Title */}
      <div className="flex items-center gap-4">
        <KuberLogo
          size={56}
          className="drop-shadow-[0_0_12px_oklch(0.82_0.18_85/0.6)] shrink-0"
        />
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground mb-0.5">
            Dashboard
          </h2>
          <p className="text-muted-foreground text-sm">
            Kuber Panel Start New Journey
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {MODULE_CARDS.map((card) => {
          const locked = isFundLocked(card.id);
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
                <div
                  className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center mb-3`}
                >
                  <card.icon
                    className={card.iconColor}
                    style={{ width: 20, height: 20 }}
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
