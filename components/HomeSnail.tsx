"use client";

import { useEffect, useState } from "react";
import { readSnailGreeted, markSnailGreeted, readSnailRescued } from "./snailState";
import { ScaredSnail } from "./ScaredSnail";
import { ThoughtBubble } from "./ThoughtBubble";
import { readEquippedItem } from "./inventory";

const GREETING_DISPLAY_MS = 4200;

export function HomeSnail() {
  // This page is statically generated, so the server/build-time HTML always
  // has to assume "not rescued yet" (no localStorage on the server).
  // Starting state at false matches that markup exactly, then this effect
  // syncs in the real value right after mount — the resulting state update
  // is what actually repaints the DOM to match.
  const [rescued, setRescued] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [rainbowShell, setRainbowShell] = useState(false);

  useEffect(() => {
    const saved = readSnailRescued();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage, an external store the server can't see; see comment above.
    setRescued(saved);
    setRainbowShell(readEquippedItem() === "rainbow-shell");
    if (saved && !readSnailGreeted()) {
      setShowGreeting(true);
      markSnailGreeted();
      window.setTimeout(() => setShowGreeting(false), GREETING_DISPLAY_MS);
    }
  }, []);

  if (!rescued) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-10 -translate-x-1/2 sm:bottom-6">
      {showGreeting && (
        <ThoughtBubble className="absolute bottom-full left-1/2 mb-4 w-56 -translate-x-1/2">
          <p>Traveler, you saved my life.</p>
        </ThoughtBubble>
      )}
      <ScaredSnail fear={0} rainbowShell={rainbowShell} />
    </div>
  );
}
