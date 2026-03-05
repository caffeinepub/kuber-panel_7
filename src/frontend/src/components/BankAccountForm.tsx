import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { syncAddBankAccount } from "@/lib/backend-sync";
import {
  type BankAccount,
  generateId,
  getBankAccounts,
  getSession,
} from "@/lib/storage";
import { Eye, EyeOff, Loader2, QrCode, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface BankAccountFormProps {
  fundType: BankAccount["fundType"];
  onSuccess?: () => void;
}

interface FormData {
  bankName: string;
  holderName: string;
  accountNumber: string;
  ifscCode: string;
  mobileNumber: string;
  ibId: string;
  ibPassword: string;
  upiId: string;
}

const initial: FormData = {
  bankName: "",
  holderName: "",
  accountNumber: "",
  ifscCode: "",
  mobileNumber: "",
  ibId: "",
  ibPassword: "",
  upiId: "",
};

export function BankAccountForm({ fundType, onSuccess }: BankAccountFormProps) {
  const [form, setForm] = useState<FormData>(initial);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);

  const set =
    (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG, PNG, WebP).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be smaller than 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setQrCode(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const session = getSession();
    if (!session) {
      toast.error("Session expired. Please login again.");
      return;
    }

    // Basic validation
    if (
      !form.bankName ||
      !form.holderName ||
      !form.accountNumber ||
      !form.ifscCode
    ) {
      toast.error("Please fill all required fields.");
      return;
    }
    if (form.mobileNumber.length !== 10) {
      toast.error("Enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);

    // Check duplicate: same account number for same user
    const existingAccounts = getBankAccounts();
    const duplicate = existingAccounts.find(
      (a) =>
        a.userId === session.userId && a.accountNumber === form.accountNumber,
    );
    if (duplicate) {
      toast.error("This bank account is already added.");
      setLoading(false);
      return;
    }

    await new Promise((r) => setTimeout(r, 600));

    const newAccount: BankAccount = {
      id: generateId(),
      userId: session.userId,
      ...form,
      ...(qrCode ? { qrCode } : {}),
      fundType,
      status: "pending",
      submittedAt: new Date().toISOString(),
    };

    syncAddBankAccount(newAccount);

    toast.success("Bank account submitted for approval!");
    setForm(initial);
    setQrCode(null);
    setLoading(false);
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="bankName" className="text-muted-foreground text-sm">
            Bank Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="bankName"
            value={form.bankName}
            onChange={set("bankName")}
            placeholder="e.g., State Bank of India"
            className="bg-secondary border-border focus:border-primary text-foreground placeholder:text-muted-foreground/50"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="holderName" className="text-muted-foreground text-sm">
            Account Holder Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="holderName"
            value={form.holderName}
            onChange={set("holderName")}
            placeholder="Full name as per bank"
            className="bg-secondary border-border focus:border-primary text-foreground placeholder:text-muted-foreground/50"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="accountNumber"
            className="text-muted-foreground text-sm"
          >
            Account Number <span className="text-destructive">*</span>
          </Label>
          <Input
            id="accountNumber"
            value={form.accountNumber}
            onChange={set("accountNumber")}
            placeholder="Enter account number"
            className="bg-secondary border-border focus:border-primary text-foreground placeholder:text-muted-foreground/50"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ifscCode" className="text-muted-foreground text-sm">
            IFSC Code <span className="text-destructive">*</span>
          </Label>
          <Input
            id="ifscCode"
            value={form.ifscCode}
            onChange={set("ifscCode")}
            placeholder="e.g., SBIN0001234"
            className="bg-secondary border-border focus:border-primary text-foreground placeholder:text-muted-foreground/50 uppercase"
            style={{ textTransform: "uppercase" }}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="mobileNumber"
            className="text-muted-foreground text-sm"
          >
            Mobile Number <span className="text-destructive">*</span>
          </Label>
          <Input
            id="mobileNumber"
            value={form.mobileNumber}
            onChange={set("mobileNumber")}
            placeholder="10-digit mobile number"
            maxLength={10}
            className="bg-secondary border-border focus:border-primary text-foreground placeholder:text-muted-foreground/50"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ibId" className="text-muted-foreground text-sm">
            Internet Banking ID
          </Label>
          <Input
            id="ibId"
            value={form.ibId}
            onChange={set("ibId")}
            placeholder="Net banking username"
            className="bg-secondary border-border focus:border-primary text-foreground placeholder:text-muted-foreground/50"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ibPassword" className="text-muted-foreground text-sm">
            Internet Banking Password
          </Label>
          <div className="relative">
            <Input
              id="ibPassword"
              type={showPass ? "text" : "password"}
              value={form.ibPassword}
              onChange={set("ibPassword")}
              placeholder="Net banking password"
              className="bg-secondary border-border focus:border-primary text-foreground placeholder:text-muted-foreground/50 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="upiId" className="text-muted-foreground text-sm">
            UPI ID
          </Label>
          <Input
            id="upiId"
            value={form.upiId}
            onChange={set("upiId")}
            placeholder="e.g., name@upi"
            className="bg-secondary border-border focus:border-primary text-foreground placeholder:text-muted-foreground/50"
          />
        </div>
      </div>

      {/* Optional QR Code Upload */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center gap-2">
          <QrCode className="w-4 h-4 text-muted-foreground" />
          <Label className="text-muted-foreground text-sm">
            Bank QR Code{" "}
            <span className="text-muted-foreground/50 text-xs">(Optional)</span>
          </Label>
        </div>
        {qrCode ? (
          <div className="flex items-center gap-3">
            <img
              src={qrCode}
              alt="Bank QR Code"
              className="w-20 h-20 object-contain rounded-lg border border-border bg-secondary"
            />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">QR code added</p>
              <button
                type="button"
                onClick={() => {
                  setQrCode(null);
                  if (qrInputRef.current) qrInputRef.current.value = "";
                }}
                className="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 transition-colors"
              >
                <X className="w-3 h-3" />
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div>
            <input
              ref={qrInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleQrUpload}
              className="hidden"
              id="qr-upload"
              data-ocid="bank.qr_upload_button"
            />
            <label
              htmlFor="qr-upload"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-border bg-secondary/50 text-muted-foreground text-xs cursor-pointer hover:border-primary/50 hover:text-primary transition-colors"
            >
              <QrCode className="w-3.5 h-3.5" />
              Upload QR Code Image
            </label>
            <p className="text-xs text-muted-foreground/50 mt-1">
              JPG, PNG, WebP — max 2MB. Only upload if you want to add your bank
              QR.
            </p>
          </div>
        )}
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-11"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit for Approval"
        )}
      </Button>
    </form>
  );
}
