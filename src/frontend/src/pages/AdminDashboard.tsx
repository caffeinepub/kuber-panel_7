import { KuberLogo } from "@/components/KuberLogo";
import { Button } from "@/components/ui/button";
import { FUND_CONFIG, getSession, setSession } from "@/lib/storage";
import { ActivationPanel } from "@/modules/ActivationPanel";
import { AddBankAccount } from "@/modules/AddBankAccount";
import { FundModule } from "@/modules/FundModule";
import { HelpSupport } from "@/modules/HelpSupport";
import { LiveActivity } from "@/modules/LiveActivity";
import { MyCommission } from "@/modules/MyCommission";
import { Withdrawal } from "@/modules/Withdrawal";
import { WithdrawalHistory } from "@/modules/WithdrawalHistory";
import { BankApproval } from "@/modules/admin/BankApproval";
import { ChangeSupportLink } from "@/modules/admin/ChangeSupportLink";
import { GenerateCode } from "@/modules/admin/GenerateCode";
import { UserManagement } from "@/modules/admin/UserManagement";
import {
  Activity,
  ArrowDownToLine,
  BarChart3,
  Building2,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  History,
  Key,
  Landmark,
  Link2,
  LogOut,
  Menu,
  MessageCircle,
  Shield,
  Shuffle,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";

type AdminModule =
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
  | "generate-code"
  | "user-management"
  | "change-support"
  | "bank-approval";

interface AdminDashboardProps {
  onLogout: () => void;
}

const NAV_ITEMS = [
  { id: "bank" as AdminModule, label: "Add Bank Account", icon: Building2 },
  {
    id: "gaming" as AdminModule,
    label: `Gaming Fund (${FUND_CONFIG.gaming.percentage}%)`,
    icon: Gamepad2,
  },
  {
    id: "stock" as AdminModule,
    label: `Stock Fund (${FUND_CONFIG.stock.percentage}%)`,
    icon: TrendingUp,
  },
  {
    id: "political" as AdminModule,
    label: `Political Fund (${FUND_CONFIG.political.percentage}%)`,
    icon: Landmark,
  },
  {
    id: "mix" as AdminModule,
    label: `Mix Fund (${FUND_CONFIG.mix.percentage}%)`,
    icon: Shuffle,
  },
  { id: "commission" as AdminModule, label: "My Commission", icon: BarChart3 },
  {
    id: "activity" as AdminModule,
    label: "Live Fund Activity",
    icon: Activity,
  },
  {
    id: "withdrawal" as AdminModule,
    label: "Withdrawal",
    icon: ArrowDownToLine,
  },
  { id: "history" as AdminModule, label: "Withdrawal History", icon: History },
  { id: "support" as AdminModule, label: "Help Support", icon: MessageCircle },
  { id: "activation" as AdminModule, label: "Activation Panel", icon: Shield },
  {
    id: "generate-code" as AdminModule,
    label: "Generate Activation Code",
    icon: Key,
  },
  {
    id: "user-management" as AdminModule,
    label: "User Management",
    icon: Users,
  },
  {
    id: "bank-approval" as AdminModule,
    label: "Bank Account Approval",
    icon: CheckSquare,
  },
  {
    id: "change-support" as AdminModule,
    label: "Change Support Link",
    icon: Link2,
  },
];

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const session = getSession();
  const [currentModule, setCurrentModule] = useState<AdminModule>("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    setSession(null);
    onLogout();
  };

  const navigate = (mod: AdminModule) => {
    setCurrentModule(mod);
    setSidebarOpen(false);
  };

  const renderModule = () => {
    switch (currentModule) {
      case "bank":
        return <AddBankAccount />;
      case "gaming":
        return <FundModule fundType="gaming" isActivated={true} />;
      case "stock":
        return <FundModule fundType="stock" isActivated={true} />;
      case "political":
        return <FundModule fundType="political" isActivated={true} />;
      case "mix":
        return <FundModule fundType="mix" isActivated={true} />;
      case "commission":
        return (
          <MyCommission
            isActivated={true}
            onWithdraw={() => navigate("withdrawal")}
          />
        );
      case "activity":
        return <LiveActivity isActivated={true} />;
      case "withdrawal":
        return <Withdrawal isActivated={true} />;
      case "history":
        return <WithdrawalHistory isActivated={true} />;
      case "support":
        return <HelpSupport />;
      case "activation":
        return <ActivationPanel isActivated={true} onActivated={() => {}} />;
      case "generate-code":
        return <GenerateCode />;
      case "user-management":
        return <UserManagement />;
      case "bank-approval":
        return <BankApproval />;
      case "change-support":
        return <ChangeSupportLink />;
      default:
        return <AdminHomeView onNavigate={navigate} />;
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
        {/* Logo */}
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

          <div className="mt-3 p-2.5 bg-secondary rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">
                  {session?.userName?.[0]?.toUpperCase() ?? "U"}
                </span>
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
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-xs text-muted-foreground">Activated</span>
            </div>
          </div>
        </div>

        {/* Nav */}
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

          {NAV_ITEMS.map((item) => (
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
            </button>
          ))}
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

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
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
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {currentModule !== "home" && (
            <div className="mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("home")}
                className="text-muted-foreground hover:text-foreground gap-2 pl-0"
                data-ocid="admin.back_to_home_button"
              >
                <ChevronLeft className="w-4 h-4" />
                Dashboard
              </Button>
            </div>
          )}
          {renderModule()}
        </main>
      </div>
    </div>
  );
}

function AdminHomeView({
  onNavigate,
}: { onNavigate: (mod: AdminModule) => void }) {
  const allCards = [
    {
      id: "bank" as AdminModule,
      label: "Add Bank Account",
      icon: Building2,
      desc: "Link your bank",
      color: "from-[#1a3a5c] to-[#0f2035]",
      border: "border-[#2a6496]/50",
      iconBg: "bg-[#1e6bb8]/30",
      iconColor: "text-[#4fa8e8]",
    },
    {
      id: "gaming" as AdminModule,
      label: "Gaming Fund",
      icon: Gamepad2,
      desc: "15% commission",
      color: "from-[#3a1a5c] to-[#1f0f35]",
      border: "border-[#7c3aed]/50",
      iconBg: "bg-[#7c3aed]/30",
      iconColor: "text-[#a78bfa]",
    },
    {
      id: "stock" as AdminModule,
      label: "Stock Fund",
      icon: TrendingUp,
      desc: "30% commission",
      color: "from-[#0f3a2a] to-[#071a12]",
      border: "border-[#059669]/50",
      iconBg: "bg-[#059669]/30",
      iconColor: "text-[#34d399]",
    },
    {
      id: "political" as AdminModule,
      label: "Political Fund",
      icon: Landmark,
      desc: "30% commission",
      color: "from-[#3a1010] to-[#1f0707]",
      border: "border-[#dc2626]/50",
      iconBg: "bg-[#dc2626]/30",
      iconColor: "text-[#f87171]",
    },
    {
      id: "mix" as AdminModule,
      label: "Mix Fund",
      icon: Shuffle,
      desc: "25% commission",
      color: "from-[#1a3a1a] to-[#0f200f]",
      border: "border-[#16a34a]/50",
      iconBg: "bg-[#16a34a]/30",
      iconColor: "text-[#4ade80]",
    },
    {
      id: "commission" as AdminModule,
      label: "My Commission",
      icon: BarChart3,
      desc: "Track your earnings",
      color: "from-[#3a2e0a] to-[#1f1905]",
      border: "border-[#d97706]/50",
      iconBg: "bg-[#d97706]/30",
      iconColor: "text-[#fbbf24]",
    },
    {
      id: "activity" as AdminModule,
      label: "Live Fund Activity",
      icon: Activity,
      desc: "Real-time transactions",
      color: "from-[#0a3a2a] to-[#051f15]",
      border: "border-[#10b981]/50",
      iconBg: "bg-[#10b981]/30",
      iconColor: "text-[#34d399]",
    },
    {
      id: "withdrawal" as AdminModule,
      label: "Withdrawal",
      icon: ArrowDownToLine,
      desc: "Withdraw your funds",
      color: "from-[#3a1a0a] to-[#1f0d05]",
      border: "border-[#ea580c]/50",
      iconBg: "bg-[#ea580c]/30",
      iconColor: "text-[#fb923c]",
    },
    {
      id: "history" as AdminModule,
      label: "Withdrawal History",
      icon: History,
      desc: "30 day history",
      color: "from-[#1a1a2e] to-[#0d0d1a]",
      border: "border-[#6366f1]/50",
      iconBg: "bg-[#6366f1]/30",
      iconColor: "text-[#a5b4fc]",
    },
    {
      id: "support" as AdminModule,
      label: "Help Support",
      icon: MessageCircle,
      desc: "Get instant help",
      color: "from-[#0a2a3a] to-[#05151f]",
      border: "border-[#0ea5e9]/50",
      iconBg: "bg-[#0ea5e9]/30",
      iconColor: "text-[#38bdf8]",
    },
    {
      id: "activation" as AdminModule,
      label: "Activation Panel",
      icon: Shield,
      desc: "Unlock all features",
      color: "from-[#3a2a0a] to-[#1f1505]",
      border: "border-[#f59e0b]/50",
      iconBg: "bg-[#f59e0b]/30",
      iconColor: "text-[#fcd34d]",
    },
    {
      id: "generate-code" as AdminModule,
      label: "Generate Codes",
      icon: Key,
      desc: "Create activation codes",
      color: "from-[#2a0a3a] to-[#150520]",
      border: "border-[#9333ea]/50",
      iconBg: "bg-[#9333ea]/30",
      iconColor: "text-[#c084fc]",
    },
    {
      id: "user-management" as AdminModule,
      label: "User Management",
      icon: Users,
      desc: "Manage all users",
      color: "from-[#0a1a3a] to-[#050d1f]",
      border: "border-[#3b82f6]/50",
      iconBg: "bg-[#3b82f6]/30",
      iconColor: "text-[#93c5fd]",
    },
    {
      id: "bank-approval" as AdminModule,
      label: "Bank Approval",
      icon: CheckSquare,
      desc: "Approve bank accounts",
      color: "from-[#0a3a30] to-[#051f19]",
      border: "border-[#14b8a6]/50",
      iconBg: "bg-[#14b8a6]/30",
      iconColor: "text-[#5eead4]",
    },
    {
      id: "change-support" as AdminModule,
      label: "Change Support Link",
      icon: Link2,
      desc: "Update support contact",
      color: "from-[#1a0a3a] to-[#0d0520]",
      border: "border-[#8b5cf6]/50",
      iconBg: "bg-[#8b5cf6]/30",
      iconColor: "text-[#c4b5fd]",
    },
  ];

  return (
    <div className="space-y-6 pb-6 animate-fade-in-up">
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
        {allCards.map((card) => (
          <button
            type="button"
            key={card.id}
            onClick={() => onNavigate(card.id)}
            className={`relative bg-gradient-to-br ${card.color} border ${card.border} rounded-xl p-4 text-left transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20 active:scale-[0.98] group`}
          >
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
            <p className="text-xs text-muted-foreground mt-1">{card.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
