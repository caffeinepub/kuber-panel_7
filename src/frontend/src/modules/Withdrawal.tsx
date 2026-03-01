import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  type BankAccount,
  generateId,
  generateTransactionId,
  getBankAccounts,
  getSession,
  getWithdrawals,
  setWithdrawals,
} from "@/lib/storage";
import { ArrowDownToLine, CheckCircle2, Loader2, Lock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface WithdrawalProps {
  isActivated: boolean;
}

// Auto-approve pending withdrawals after 5-10 minutes
function useAutoApproveWithdrawals(userId: string | undefined) {
  const timerRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  useEffect(() => {
    if (!userId) return;

    const checkAndSchedule = () => {
      const withdrawals = getWithdrawals();
      const pending = withdrawals.filter(
        (w) => w.userId === userId && w.status === "pending",
      );

      for (const w of pending) {
        if (!timerRef.current.has(w.id)) {
          // Random delay between 5-10 minutes (300000-600000 ms)
          const delay = Math.floor(Math.random() * 300000) + 300000;
          const timer = setTimeout(() => {
            const all = getWithdrawals();
            const updated = all.map((item) =>
              item.id === w.id
                ? { ...item, status: "approved" as const }
                : item,
            );
            setWithdrawals(updated);
            timerRef.current.delete(w.id);
          }, delay);
          timerRef.current.set(w.id, timer);
        }
      }
    };

    checkAndSchedule();
    const interval = setInterval(checkAndSchedule, 10000);
    return () => {
      clearInterval(interval);
      for (const timer of timerRef.current.values()) {
        clearTimeout(timer);
      }
    };
  }, [userId]);
}

export function Withdrawal({ isActivated }: WithdrawalProps) {
  const session = getSession();
  const [loading, setLoading] = useState(false);
  useAutoApproveWithdrawals(session?.userId);

  // UPI
  const [upiId, setUpiId] = useState("");
  const [upiAmount, setUpiAmount] = useState("");

  // Bank
  const [selectedBankId, setSelectedBankId] = useState("");
  const [bankAmount, setBankAmount] = useState("");

  // USDT
  const [usdtAddress, setUsdtAddress] = useState("");
  const [usdtAmount, setUsdtAmount] = useState("");

  const approvedBanks: BankAccount[] = getBankAccounts().filter(
    (a) => a.userId === session?.userId && a.status === "approved",
  );

  const selectedBank = approvedBanks.find((b) => b.id === selectedBankId);

  const handleSubmit = async (
    method: "upi" | "bank" | "usdt",
    amount: string,
    details: string,
  ) => {
    if (!amount || Number(amount) < 100) {
      toast.error("Minimum withdrawal amount is ₹100.");
      return;
    }
    if (!details) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    const now = new Date();
    const withdrawal = {
      id: generateId(),
      userId: session!.userId,
      method,
      amount: Number(amount),
      bankDetails: details,
      transactionId: generateTransactionId(),
      date: now.toLocaleDateString("en-IN"),
      time: now.toLocaleTimeString("en-IN"),
      status: "pending" as const,
      ...(method === "bank" && selectedBank
        ? {
            bankName: selectedBank.bankName,
            accountNumber: selectedBank.accountNumber,
            holderName: selectedBank.holderName,
            ifscCode: selectedBank.ifscCode,
          }
        : {}),
    };

    const withdrawals = getWithdrawals();
    setWithdrawals([...withdrawals, withdrawal]);
    toast.success("Withdrawal request submitted!");
    setLoading(false);

    // Reset
    if (method === "upi") {
      setUpiId("");
      setUpiAmount("");
    }
    if (method === "bank") {
      setSelectedBankId("");
      setBankAmount("");
    }
    if (method === "usdt") {
      setUsdtAddress("");
      setUsdtAmount("");
    }
  };

  const amountInput = (val: string, setter: (v: string) => void) => (
    <div className="space-y-1.5">
      <Label className="text-muted-foreground text-sm">
        Amount (₹) <span className="text-destructive">*</span>
      </Label>
      <Input
        type="number"
        value={val}
        onChange={(e) => setter(e.target.value)}
        placeholder="Enter withdrawal amount"
        min="100"
        className="bg-secondary border-border focus:border-primary h-11 text-foreground placeholder:text-muted-foreground/50"
      />
    </div>
  );

  return (
    <div className="relative space-y-6 animate-fade-in-up">
      {!isActivated && (
        <div className="absolute inset-0 z-20 lock-overlay rounded-xl flex flex-col items-center justify-center gap-4">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-card border-2 border-border flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-lg font-display font-bold text-foreground mb-2">
              Locked
            </h3>
            <p className="text-muted-foreground text-sm">
              Activate panel to make withdrawals
            </p>
          </div>
        </div>
      )}

      <div className={!isActivated ? "pointer-events-none opacity-50" : ""}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <ArrowDownToLine className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-foreground">
              Withdrawal
            </h2>
            <p className="text-muted-foreground text-sm">
              Request a withdrawal from your account
            </p>
          </div>
        </div>

        {/* Auto-approval notice */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
          <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
          <p className="text-xs text-green-400">
            Withdrawal requests are automatically approved within 5-10 minutes.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 card-glow">
          <Tabs defaultValue="upi">
            <TabsList className="grid grid-cols-3 bg-secondary mb-6 w-full">
              <TabsTrigger
                value="upi"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                UPI
              </TabsTrigger>
              <TabsTrigger
                value="bank"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Bank Account
              </TabsTrigger>
              <TabsTrigger
                value="usdt"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                USDT
              </TabsTrigger>
            </TabsList>

            {/* UPI Tab */}
            <TabsContent value="upi" className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-sm">
                  UPI ID <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g., name@upi"
                  className="bg-secondary border-border focus:border-primary h-11 text-foreground placeholder:text-muted-foreground/50"
                />
              </div>
              {amountInput(upiAmount, setUpiAmount)}
              <Button
                onClick={() => handleSubmit("upi", upiAmount, upiId)}
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-semibold"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Request UPI Withdrawal
              </Button>
            </TabsContent>

            {/* Bank Tab */}
            <TabsContent value="bank" className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-sm">
                  Select Bank Account{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={selectedBankId}
                  onValueChange={setSelectedBankId}
                >
                  <SelectTrigger className="bg-secondary border-border h-11 text-foreground">
                    <SelectValue placeholder="Choose approved bank account" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {approvedBanks.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No approved accounts
                      </SelectItem>
                    ) : (
                      approvedBanks.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.bankName} — ••••{b.accountNumber.slice(-4)}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              {amountInput(bankAmount, setBankAmount)}
              <Button
                onClick={() =>
                  handleSubmit(
                    "bank",
                    bankAmount,
                    selectedBank?.accountNumber ?? "",
                  )
                }
                disabled={loading || !selectedBankId}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-semibold"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Request Bank Withdrawal
              </Button>
            </TabsContent>

            {/* USDT Tab */}
            <TabsContent value="usdt" className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-sm">
                  USDT Address (TRC20){" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={usdtAddress}
                  onChange={(e) => setUsdtAddress(e.target.value)}
                  placeholder="Enter TRC20 wallet address"
                  className="bg-secondary border-border focus:border-primary h-11 text-foreground font-mono text-sm placeholder:text-muted-foreground/50"
                />
              </div>
              {amountInput(usdtAmount, setUsdtAmount)}
              <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg">
                <p className="text-warning text-xs">
                  ⚠️ Only TRC20 network is supported. Double-check your wallet
                  address.
                </p>
              </div>
              <Button
                onClick={() => handleSubmit("usdt", usdtAmount, usdtAddress)}
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-semibold"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Request USDT Withdrawal
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
