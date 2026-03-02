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
import { Check, Copy, Key, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function GenerateCode() {
  const [copied, setCopied] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  void refreshKey;

  const codes = getActivationCodes();
  const users = getUsers();

  const getUserEmail = (userId?: string) => {
    if (!userId) return "—";
    const user = users.find((u) => u.id === userId);
    return user?.email ?? userId;
  };

  const handleGenerate = () => {
    const code = generateActivationCode();
    syncGenerateActivationCode(code);
    setRefreshKey((k) => k + 1);
    toast.success(`Code generated: ${code}`);
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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Key className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-foreground">
              Generate Activation Codes
            </h2>
            <p className="text-muted-foreground text-sm">
              Create single-use activation codes for users
            </p>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2 gold-glow"
        >
          <Plus className="w-4 h-4" />
          Generate New Code
        </Button>
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
          <div className="text-center py-12 text-muted-foreground">
            <Key className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">
              No codes generated yet. Create your first code above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Code</TableHead>
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
                {[...codes].reverse().map((c) => (
                  <TableRow
                    key={c.code}
                    className="border-border hover:bg-secondary/50"
                  >
                    <TableCell className="font-mono font-bold text-foreground tracking-wider">
                      {c.code}
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
