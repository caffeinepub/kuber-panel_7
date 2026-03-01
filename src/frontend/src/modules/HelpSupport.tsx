import { Button } from "@/components/ui/button";
import { getSupportLink } from "@/lib/storage";
import { Clock, ExternalLink, MessageCircle, Phone } from "lucide-react";

export function HelpSupport() {
  const supportLink = getSupportLink();

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">
            Help &amp; Support
          </h2>
          <p className="text-muted-foreground text-sm">
            We're here to help you
          </p>
        </div>
      </div>

      {/* Main support card */}
      <div className="bg-card border border-primary/30 rounded-xl p-8 card-glow text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="relative z-10">
          <div className="w-16 h-16 rounded-full bg-[#0088cc]/20 border border-[#0088cc]/30 flex items-center justify-center mx-auto mb-4">
            <svg
              viewBox="0 0 24 24"
              className="w-8 h-8 text-[#0088cc]"
              fill="currentColor"
              role="img"
              aria-label="Telegram"
            >
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.88 13.47l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.832.952z" />
            </svg>
          </div>
          <h3 className="text-xl font-display font-bold text-foreground mb-2">
            Telegram Support
          </h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
            Join our official Telegram support group for instant help, updates,
            and assistance from our team.
          </p>
          <Button
            onClick={() =>
              window.open(supportLink, "_blank", "noopener,noreferrer")
            }
            className="bg-[#0088cc] hover:bg-[#0077b5] text-white font-semibold gap-2 px-6"
          >
            <ExternalLink className="w-4 h-4" />
            Click to Join Support Group
          </Button>
          <p className="text-xs text-muted-foreground mt-4 font-mono break-all">
            {supportLink}
          </p>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">
                Operating Hours
              </h4>
              <p className="text-sm text-muted-foreground">
                Mon–Sat: 9:00 AM – 8:00 PM IST
              </p>
              <p className="text-sm text-muted-foreground">
                Sunday: 10:00 AM – 5:00 PM IST
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">
                Response Time
              </h4>
              <p className="text-sm text-muted-foreground">
                Telegram: Within 30 minutes
              </p>
              <p className="text-sm text-muted-foreground">
                Urgent issues: Within 2 hours
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-base font-semibold text-foreground mb-4">
          Common Questions
        </h3>
        <div className="space-y-3">
          {[
            {
              q: "How long does bank account approval take?",
              a: "Bank accounts are typically reviewed within 24–48 hours.",
            },
            {
              q: "When are withdrawals processed?",
              a: "Withdrawal requests are processed within 1–3 business days.",
            },
            {
              q: "How do I activate my panel?",
              a: "Go to the Activation Panel section and enter your unique activation code.",
            },
          ].map((item) => (
            <div key={item.q} className="border-l-2 border-primary/40 pl-4">
              <p className="text-sm font-medium text-foreground">{item.q}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
