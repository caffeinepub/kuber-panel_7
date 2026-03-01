import { KuberLogo } from "@/components/KuberLogo";
import { useEffect } from "react";

interface WelcomePopupProps {
  userName: string;
  onDismiss: () => void;
}

export function WelcomePopup({ userName, onDismiss }: WelcomePopupProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 2500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 animate-fade-in-up">
        {/* Logo with glow */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl animate-pulse-gold scale-150" />
          <KuberLogo
            size={120}
            className="relative z-10 drop-shadow-[0_0_30px_rgba(212,160,23,0.8)]"
          />
        </div>

        {/* Welcome box */}
        <div
          className="border-2 border-primary/60 rounded-2xl px-10 py-7 text-center backdrop-blur-md bg-card/90 shadow-2xl"
          style={{ boxShadow: "0 0 40px oklch(0.82 0.18 85 / 0.25)" }}
        >
          <h1
            className="text-3xl font-bold mb-1"
            style={{
              background: "linear-gradient(135deg, #ffe680, #d4a017, #f5d060)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Welcome to Kuber Panel
          </h1>
          <p className="text-muted-foreground text-base mt-1">
            Hello,{" "}
            <span className="font-semibold" style={{ color: "#d4a017" }}>
              {userName}
            </span>
            !
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            Loading your financial dashboard...
          </p>

          {/* Progress bar */}
          <div className="mt-4 h-1.5 w-52 mx-auto bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, #d4a017, #ffe680)",
                animation: "loadbar 2.5s ease-out forwards",
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
