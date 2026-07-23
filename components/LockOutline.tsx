import type { ReactNode } from "react";

// The site-wide "locked vs available" signal: a red border/glow when
// locked, neon green when unlocked. Used by every hub destination — the
// four ArrowButtons, Cave, Airport, and any future location prop — so the
// same glance-level cue means the same thing everywhere.
export function LockOutline({
  unlocked,
  children,
  className = "",
}: {
  unlocked: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center border-2 transition-all duration-200 ease-out ${className}`}
      style={{
        borderColor: unlocked ? "var(--neon)" : "#ff4d4d",
        boxShadow: unlocked ? "0 0 10px var(--neon), 0 0 20px var(--neon-dim)" : "0 0 8px rgba(255,77,77,0.45)",
      }}
    >
      {children}
    </div>
  );
}
