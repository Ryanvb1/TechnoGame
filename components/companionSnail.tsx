"use client";

import { createContext, useContext, useEffect, useState } from "react";

// Lets a scene borrow the player's own fixed-corner companion snail (see
// LocationSnail) as an in-fight ally — e.g. the toad fight's pillar-dousing
// SnailAgent in ThroneHallBackground — without a second, independent snail
// ever being on screen at the same time. SectionShell provides this around
// every location page; LocationSnail reads it, and a scene calls
// useHideCompanionSnail(true) for exactly as long as its own stand-in snail
// is visible.
const CompanionSnailContext = createContext<{
  hidden: boolean;
  setHidden: (hidden: boolean) => void;
} | null>(null);

export function CompanionSnailProvider({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState(false);
  return (
    <CompanionSnailContext.Provider value={{ hidden, setHidden }}>
      {children}
    </CompanionSnailContext.Provider>
  );
}

export function useCompanionSnailHidden() {
  const ctx = useContext(CompanionSnailContext);
  return ctx?.hidden ?? false;
}

export function useHideCompanionSnail(active: boolean) {
  const ctx = useContext(CompanionSnailContext);
  useEffect(() => {
    if (!ctx) return;
    ctx.setHidden(active);
    return () => ctx.setHidden(false);
  }, [active, ctx]);
}
