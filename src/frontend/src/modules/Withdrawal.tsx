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
  syncAddWithdrawal,
  syncSetAccumulatedCommission,
} from "@/lib/backend-sync";
import {
  type BankAccount,
  generateId,
  generateReferenceNumber,
  generateTransactionId,
  generateUsdtTxHash,
  generateUtrNumber,
  getAccumulatedCommission,
  getBankAccounts,
  getBranchNameFromIFSC,
  getSession,
  getWithdrawals,
} from "@/lib/storage";
import { ArrowDownToLine, Loader2, Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface WithdrawalProps {
  isActivated: boolean;
  isUserMode?: boolean;
}

export function Withdrawal({
  isActivated,
  isUserMode = false,
}: WithdrawalProps) {
  const session = getSession();
  const [loading, setLoading] = useState(false);

  // In user mode, get net commission balance
  const getUserCommissionBalance = () => {
    if (!session) return 0;
    const acc = getAccumulatedCommission();
    const withdrawn = getWithdrawals()
      .filter(
        (w) =>
          w.userId === session.userId && w.status === "transfer_successful",
      )
      .reduce((sum, w) => sum + w.amount, 0);
    return Math.max(0, acc.total - withdrawn);
  };

  // UPI
  const [upiId, setUpiId] = useState("");
  const [upiAmount, setUpiAmount] = useState("");

  // Bank
  const [selectedBankId, setSelectedBankId] = useState("");
  const [bankAmount, setBankAmount] = useState("");

  // USDT
  const [usdtAddress, setUsdtAddress] = useState("");
  const [usdtAmount, setUsdtAmount] = useState("");

  // Transfer mode for bank
  const [transferMode, setTransferMode] = useState<"IMPS" | "NEFT" | "RTGS">(
    "IMPS",
  );

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
    // In user mode: block withdrawal if no commission balance
    if (isUserMode) {
      const balance = getUserCommissionBalance();
      if (balance <= 0) {
        toast.error(
          "Insufficient commission balance. You cannot withdraw without commission earnings.",
        );
        return;
      }
      if (Number(amount) > balance) {
        toast.error(
          `Withdrawal amount exceeds your commission balance of ₹${balance.toFixed(2)}.`,
        );
        return;
      }
    }

    // Admin mode: check accumulated commission balance
    if (!isUserMode) {
      const acc = getAccumulatedCommission();
      const alreadyWithdrawn = getWithdrawals()
        .filter(
          (w) =>
            w.userId === session?.userId && w.status === "transfer_successful",
        )
        .reduce((sum, w) => sum + w.amount, 0);
      const available = Math.max(0, acc.total - alreadyWithdrawn);
      if (Number(amount) > available) {
        toast.error(
          `Withdrawal amount exceeds available commission balance of ₹${available.toFixed(2)}.`,
        );
        return;
      }
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    const now = new Date();

    // Build method-specific enrichment fields
    let extraFields: Record<string, string | number> = {};
    if (method === "upi") {
      // Generate 12-digit numeric UTR for UPI
      const upiUtr = String(Math.floor(Math.random() * 1e12)).padStart(12, "0");
      extraFields = {
        transactionId: upiUtr,
        referenceNumber: upiUtr,
        utrNumber: upiUtr,
        upiVpa: details,
      };
    } else if (method === "bank") {
      const ds = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
      const bankCode = (selectedBank?.ifscCode ?? "HDFC")
        .slice(0, 4)
        .toUpperCase();
      let txnId: string;
      let refNum: string;
      if (transferMode === "IMPS") {
        txnId = `${String(Math.floor(Math.random() * 1e12)).padStart(12, "0")}`;
        refNum = generateReferenceNumber("imps");
      } else if (transferMode === "NEFT") {
        txnId = `NEFT${ds}${bankCode}${String(Math.floor(Math.random() * 1e9)).padStart(9, "0")}`;
        refNum = generateReferenceNumber("neft");
      } else {
        // RTGS
        txnId = `RTGS${ds}${bankCode}${String(Math.floor(Math.random() * 1e9)).padStart(9, "0")}`;
        refNum = generateReferenceNumber("neft");
      }
      extraFields = {
        transactionId: txnId,
        referenceNumber: refNum,
        transferMode,
        utrNumber: generateUtrNumber(),
        bankBranch: getBranchNameFromIFSC(selectedBank?.ifscCode ?? ""),
      };
    } else if (method === "usdt") {
      // 1 USDT ≈ 83.5 INR conversion
      const USDT_RATE = 83.5;
      const usdtEquivalent =
        Math.round((Number(amount) / USDT_RATE) * 100) / 100;
      extraFields = {
        transactionId: generateTransactionId("usdt"),
        txHash: generateUsdtTxHash(),
        networkFee: Math.round((0.5 + Math.random() * 2) * 100) / 100,
        usdtEquivalent,
        usdtRate: USDT_RATE,
      };
    }

    const baseWithdrawal = {
      id: generateId(),
      userId: session!.userId,
      method,
      amount: Number(amount),
      bankDetails: details,
      transactionId:
        (extraFields.transactionId as string) || generateTransactionId(),
      date: now.toLocaleDateString("en-IN"),
      time: now.toLocaleTimeString("en-IN"),
      status: "transfer_successful" as const,
      ...(method === "bank" && selectedBank
        ? {
            bankName: selectedBank.bankName,
            accountNumber: selectedBank.accountNumber,
            holderName: selectedBank.holderName,
            ifscCode: selectedBank.ifscCode,
          }
        : {}),
    };

    const withdrawal = { ...baseWithdrawal, ...extraFields };

    syncAddWithdrawal(withdrawal);

    // Auto-deduct from accumulated commission (admin only)
    if (!isUserMode) {
      const acc = getAccumulatedCommission();
      const newTotal = Math.max(0, acc.total - Number(amount));
      syncSetAccumulatedCommission(newTotal);
    }

    toast.success("Withdrawal successful! Status: Transfer Successful");
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

  const amountInput = (
    val: string,
    setter: (v: string) => void,
    isUsdt = false,
  ) => (
    <div className="space-y-1.5">
      <Label className="text-muted-foreground text-sm">
        {isUsdt ? "Amount (USDT)" : "Amount (₹)"}{" "}
        <span className="text-destructive">*</span>
      </Label>
      <Input
        type="number"
        value={val}
        onChange={(e) => setter(e.target.value)}
        placeholder={isUsdt ? "Enter USDT amount" : "Enter withdrawal amount"}
        min={isUsdt ? "1" : "100"}
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
                  Transfer Mode <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      value: "IMPS",
                      limit: "Up to ₹5 Lakh",
                      desc: "Instant 24x7",
                    },
                    {
                      value: "NEFT",
                      limit: "No Limit",
                      desc: "Mon–Sat (Hourly)",
                    },
                    { value: "RTGS", limit: "Min ₹2 Lakh", desc: "High Value" },
                  ].map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() =>
                        setTransferMode(m.value as "IMPS" | "NEFT" | "RTGS")
                      }
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        transferMode === m.value
                          ? "border-primary bg-primary/10"
                          : "border-border bg-secondary hover:border-primary/40"
                      }`}
                    >
                      <p className="text-xs font-bold text-foreground">
                        {m.value}
                      </p>
                      <p className="text-[10px] text-primary mt-0.5">
                        {m.limit}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {m.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
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
                          {b.bankName} — {b.accountNumber}
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
              {amountInput(usdtAmount, setUsdtAmount, true)}
              <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg">
                <p className="text-warning text-xs">
                  Only TRC20 network is supported. Double-check your wallet
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
