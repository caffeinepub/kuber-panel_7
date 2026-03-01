import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupportLink, setSupportLink } from "@/lib/storage";
import { ExternalLink, Link2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ChangeSupportLink() {
  const [link, setLink] = useState(getSupportLink);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const currentSaved = getSupportLink();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!link.trim()) {
      toast.error("Please enter a valid link.");
      return;
    }
    if (!link.startsWith("http")) {
      toast.error("Link must start with http:// or https://");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setSupportLink(link.trim());
    setSaved(true);
    toast.success("Support link updated successfully!");
    setLoading(false);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
          <Link2 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">
            Change Help Support ID
          </h2>
          <p className="text-muted-foreground text-sm">
            Update the Telegram/support link for all users
          </p>
        </div>
      </div>

      {/* Current link */}
      <div className="bg-card border border-border rounded-xl p-4">
        <p className="text-xs text-muted-foreground mb-1">
          Current Support Link
        </p>
        <div className="flex items-center gap-2">
          <p className="text-foreground font-mono text-sm break-all flex-1">
            {currentSaved}
          </p>
          <a
            href={currentSaved}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 shrink-0"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Update form */}
      <div className="bg-card border border-border rounded-xl p-6 card-glow">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-sm">
              New Support Link <span className="text-destructive">*</span>
            </Label>
            <Input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://t.me/+yourgroup"
              className="bg-secondary border-border focus:border-primary h-11 text-foreground placeholder:text-muted-foreground/50 font-mono text-sm"
              required
            />
            <p className="text-xs text-muted-foreground">
              This link will be visible to all users on the login page and Help
              Support section.
            </p>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className={`w-full h-11 font-semibold ${
              saved
                ? "bg-success/80 text-foreground hover:bg-success/70"
                : "bg-primary text-primary-foreground hover:bg-primary/90 gold-glow"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : saved ? (
              "✓ Link Updated!"
            ) : (
              <>
                <Link2 className="mr-2 w-4 h-4" />
                Update Support Link
              </>
            )}
          </Button>
        </form>
      </div>

      <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
        <p className="text-warning text-sm">
          ⚠️ This change takes effect immediately for all users. Make sure the
          link is correct before updating.
        </p>
      </div>
    </div>
  );
}
