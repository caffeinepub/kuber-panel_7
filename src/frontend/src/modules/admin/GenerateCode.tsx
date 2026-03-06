import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { syncGenerateActivationCode } from "@/lib/backend-sync";
import {
  formatDate,
  generateActivationCode,
  getActivationCodes,
  getUsers,
} from "@/lib/storage";
import {
  Check,
  Copy,
  Gamepad2,
  Key,
  Landmark,
  Plus,
  Shuffle,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type FundTypeOption = "gaming" | "stock" | "political" | "mix" | "all";

const FUND_TYPE_OPTIONS: {
  value: FundTypeOption;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  color: string;
  activeClass: string;
}[] = [
  {
    value: "gaming",
    label: "Gaming Fund",
    shortLabel: "Gaming",
    icon: Gamepad2,
    color: "text-purple-400",
    activeClass: "bg-purple-500/20 border-purple-500/60 text-purple-300",
  },
  {
    value: "stock",
    label: "Stock Fund",
    shortLabel: "Stock",
    icon: TrendingUp,
    color: "text-blue-400",
    activeClass: "bg-blue-500/20 border-blue-500/60 text-blue-300",
  },
  {
    value: "political",
    label: "Political Fund",
    shortLabel: "Political",
    icon: Landmark,
    color: "text-red-400",
    activeClass: "bg-red-500/20 border-red-500/60 text-red-300",
  },
  {
    value: "mix",
    label: "Mix Fund",
    shortLabel: "Mix",
    icon: Shuffle,
    color: "text-green-400",
    activeClass: "bg-green-500/20 border-green-500/60 text-green-300",
  },
  {
    value: "all",
    label: "All Funds",
    shortLabel: "All",
    icon: Zap,
    color: "text-primary",
    activeClass: "bg-primary/20 border-primary/60 text-primary",
  },
];

function getFundLabel(fundType?: string): string {
  const opt = FUND_TYPE_OPTIONS.find((o) => o.value === fundType);
  return opt?.label ?? "All Funds";
}

function FundTypeBadge({ fundType }: { fundType?: string }) {
  const opt = FUND_TYPE_OPTIONS.find((o) => o.value === (fundType ?? "all"));
  const Icon = opt?.icon ?? Zap;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border ${opt?.activeClass ?? "bg-primary/20 border-primary/60 text-primary"}`}
    >
      <Icon className="w-3 h-3" />
      {opt?.shortLabel ?? "All"}
    </span>
  );
}

export function GenerateCode() {
  const [copied, setCopied] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedFundType, setSelectedFundType] =
    useState<FundTypeOption>("all");
  void refreshKey;

  const codes = getActivationCodes();
  const users = getUsers();

  const getUserEmail = (userId?: string) => {
    if (!userId) return "—";
    const user = users.find((u) => u.id === userId);
    return user?.email ?? userId;
  };

  const handleGenerate = () => {
    const code = generateActivationCode(selectedFundType);
    syncGenerateActivationCode(code, selectedFundType);
    setRefreshKey((k) => k + 1);
    const label = getFundLabel(selectedFundType);
    toast.success(`Code generated for ${label}: ${code}`);
  };

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error("Failed to copy.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
          <Key className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">
            Generate Activation Codes
          </h2>
          <p className="text-muted-foreground text-sm">
            Create fund-specific single-use activation codes for users
          </p>
        </div>
      </div>

      {/* Fund type selector + generate */}
      <div className="bg-card border border-border rounded-xl p-5 card-glow space-y-4">
        <div>
          <p className="text-sm font-semibold text-foreground mb-3">
            Select Fund Type
          </p>
          <div className="flex flex-wrap gap-2">
            {FUND_TYPE_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isActive = selectedFundType === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedFundType(opt.value)}
                  data-ocid={`generate_code.fund_type_${opt.value}_toggle`}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                    isActive
                      ? opt.activeClass
                      : "bg-secondary border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3 pt-1 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Generating for:{" "}
            <span className="font-semibold text-foreground">
              {getFundLabel(selectedFundType)}
            </span>
          </div>
          <Button
            onClick={handleGenerate}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2 gold-glow"
            data-ocid="generate_code.generate_button"
          >
            <Plus className="w-4 h-4" />
            Generate Code
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: "Total Codes", value: codes.length },
          {
            label: "Active (Unused)",
            value: codes.filter((c) => !c.isUsed).length,
          },
          { label: "Used", value: codes.filter((c) => c.isUsed).length },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-card border border-border rounded-xl p-4 text-center"
          >
            <p className="text-2xl font-display font-bold text-primary">
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Codes table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden card-glow">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-base font-semibold text-foreground">
            All Activation Codes
          </h3>
        </div>

        {codes.length === 0 ? (
          <div
            className="text-center py-12 text-muted-foreground"
            data-ocid="generate_code.empty_state"
          >
            <Key className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">
              No codes generated yet. Create your first code above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table data-ocid="generate_code.table">
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Code</TableHead>
                  <TableHead className="text-muted-foreground">
                    Fund Type
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Used By
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Generated
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...codes].reverse().map((c, idx) => (
                  <TableRow
                    key={c.code}
                    className="border-border hover:bg-secondary/50"
                    data-ocid={`generate_code.item.${idx + 1}`}
                  >
                    <TableCell className="font-mono font-bold text-foreground tracking-wider">
                      {c.code}
                    </TableCell>
                    <TableCell>
                      <FundTypeBadge fundType={c.fundType} />
                    </TableCell>
                    <TableCell>
                      {c.isUsed ? (
                        <span className="status-rejected inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold">
                          USED
                        </span>
                      ) : (
                        <span className="status-approved inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold">
                          ACTIVE
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {getUserEmail(c.usedBy)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(c.generatedAt)}
                    </TableCell>
                    <TableCell>
                      {!c.isUsed && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(c.code)}
                          className="text-muted-foreground hover:text-primary h-7 px-2"
                          data-ocid={`generate_code.copy_button.${idx + 1}`}
                        >
                          {copied === c.code ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
