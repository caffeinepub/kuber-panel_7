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
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
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
      desc: "Link your bank for transactions",
      color: "from-blue-500/20 to-blue-500/5",
      border: "border-blue-500/30",
    },
    {
      id: "gaming" as AdminModule,
      label: "Gaming Fund",
      icon: Gamepad2,
      desc: "15% commission",
      color: "from-purple-500/20 to-purple-500/5",
      border: "border-purple-500/30",
    },
    {
      id: "stock" as AdminModule,
      label: "Stock Fund",
      icon: TrendingUp,
      desc: "30% commission",
      color: "from-cyan-500/20 to-cyan-500/5",
      border: "border-cyan-500/30",
    },
    {
      id: "political" as AdminModule,
      label: "Political Fund",
      icon: Landmark,
      desc: "30% commission",
      color: "from-red-500/20 to-red-500/5",
      border: "border-red-500/30",
    },
    {
      id: "mix" as AdminModule,
      label: "Mix Fund",
      icon: Shuffle,
      desc: "25% commission",
      color: "from-green-500/20 to-green-500/5",
      border: "border-green-500/30",
    },
    {
      id: "commission" as AdminModule,
      label: "My Commission",
      icon: BarChart3,
      desc: "Track your earnings",
      color: "from-yellow-500/20 to-yellow-500/5",
      border: "border-yellow-500/30",
    },
    {
      id: "activity" as AdminModule,
      label: "Live Fund Activity",
      icon: Activity,
      desc: "Real-time transactions",
      color: "from-emerald-500/20 to-emerald-500/5",
      border: "border-emerald-500/30",
    },
    {
      id: "withdrawal" as AdminModule,
      label: "Withdrawal",
      icon: ArrowDownToLine,
      desc: "Withdraw your funds",
      color: "from-orange-500/20 to-orange-500/5",
      border: "border-orange-500/30",
    },
    {
      id: "history" as AdminModule,
      label: "Withdrawal History",
      icon: History,
      desc: "30 day history",
      color: "from-slate-500/20 to-slate-500/5",
      border: "border-slate-500/30",
    },
    {
      id: "support" as AdminModule,
      label: "Help Support",
      icon: MessageCircle,
      desc: "Get instant help",
      color: "from-sky-500/20 to-sky-500/5",
      border: "border-sky-500/30",
    },
    {
      id: "activation" as AdminModule,
      label: "Activation Panel",
      icon: Shield,
      desc: "Unlock all features",
      color: "from-amber-500/20 to-amber-500/5",
      border: "border-amber-500/30",
    },
    {
      id: "generate-code" as AdminModule,
      label: "Generate Codes",
      icon: Key,
      desc: "Create activation codes",
      color: "from-primary/20 to-primary/5",
      border: "border-primary/30",
    },
    {
      id: "user-management" as AdminModule,
      label: "User Management",
      icon: Users,
      desc: "Manage all users",
      color: "from-violet-500/20 to-violet-500/5",
      border: "border-violet-500/30",
    },
    {
      id: "bank-approval" as AdminModule,
      label: "Bank Approval",
      icon: CheckSquare,
      desc: "Approve bank accounts",
      color: "from-teal-500/20 to-teal-500/5",
      border: "border-teal-500/30",
    },
    {
      id: "change-support" as AdminModule,
      label: "Change Support Link",
      icon: Link2,
      desc: "Update support contact",
      color: "from-indigo-500/20 to-indigo-500/5",
      border: "border-indigo-500/30",
    },
  ];

  return (
    <div className="space-y-6 pb-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-1">
          Dashboard
        </h2>
        <p className="text-muted-foreground text-sm">
          Select a module to get started
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {allCards.map((card) => (
          <button
            type="button"
            key={card.id}
            onClick={() => onNavigate(card.id)}
            className={`relative bg-gradient-to-br ${card.color} border ${card.border} rounded-xl p-4 text-left transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20 active:scale-[0.98] group`}
          >
            <div className="w-9 h-9 rounded-lg bg-black/20 flex items-center justify-center mb-3">
              <card.icon
                className="w-4.5 h-4.5 text-foreground"
                style={{ width: 18, height: 18 }}
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
