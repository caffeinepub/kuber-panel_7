import { useEffect } from "react";

interface WelcomePopupProps {
  userName: string;
  onDismiss: () => void;
}

export function WelcomePopup({ userName, onDismiss }: WelcomePopupProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 2000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-navy/95 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 animate-fade-in-up">
        {/* Logo with glow */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse-gold" />
          <img
            src="/assets/generated/kuber-logo-transparent.dim_200x200.png"
            alt="Kuber Panel"
            className="w-24 h-24 relative z-10 animate-spin-slow drop-shadow-[0_0_20px_oklch(0.82_0.18_85/0.6)]"
          />
        </div>

        {/* Border box */}
        <div className="border-2 border-primary/50 rounded-2xl px-10 py-8 text-center gold-glow backdrop-blur-md bg-navy-card/80">
          <h1 className="text-3xl font-display font-bold gold-text-gradient mb-2">
            Welcome to Kuber Panel
          </h1>
          <p className="text-muted-foreground text-lg">
            Hello,{" "}
            <span className="text-primary font-semibold">{userName}</span>!
          </p>
          <p className="text-muted-foreground text-sm mt-3">
            Loading your financial dashboard...
          </p>

          {/* Progress bar */}
          <div className="mt-4 h-1 w-48 mx-auto bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full animate-[progress_2s_ease-out_forwards]"
              style={{
                animation: "loadbar 2s ease-out forwards",
              }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes loadbar {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
