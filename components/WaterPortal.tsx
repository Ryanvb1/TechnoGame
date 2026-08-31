"use client";

import { useState } from "react";
import { LockOutline } from "./LockOutline";
import { CautionTape } from "./CautionTape";

const MESSAGE_MS = 2200;

// A shimmering ring of water tucked in the top-left corner of the hub.
// It stays visible as a preview while clearly communicating that the
// destination is unavailable in this version.
export function WaterPortal() {
  const [showMessage, setShowMessage] = useState(false);

  function handleClick() {
    setShowMessage(true);
    window.setTimeout(() => setShowMessage(false), MESSAGE_MS);
  }

  return (
    // Sits below RainbowBallCounter (pinned to this same top-left corner,
    // left-4/top-4) rather than sharing its exact spot.
    <div className="fixed left-6 top-16 z-20 sm:left-10 sm:top-20">
      {showMessage && (
        <div className="pointer-events-none absolute top-full left-0 mt-3 w-36 border border-neon-dim bg-background/95 px-3 py-2 text-center text-[0.6rem] uppercase tracking-[0.2em] text-foreground shadow-[0_0_15px_var(--neon-dim)]">
          Under construction
        </div>
      )}
      <button
        onClick={handleClick}
        data-sfx="portal"
        aria-label="Water portal blocked by caution tape"
        className="group relative flex touch-manipulation flex-col items-start outline-none"
      >
        <LockOutline unlocked={false} className="h-14 w-14 rounded-full p-2 opacity-50 sm:h-16 sm:w-16">
          <div className="relative h-full w-full overflow-hidden rounded-full">
            {/* swirling water body */}
            <div
              className="absolute inset-0 animate-[slow-spin_7s_linear_infinite]"
              style={{
                background:
                  "conic-gradient(from 0deg, #0d3b57, #2a7fb8, #7fd8ff, #2a7fb8, #123a54, #1a5a82, #0d3b57)",
              }}
            />
            {/* still surface sheen + concentric ripples reading as a portal
                rather than a plain spinning disc */}
            <div
              className="absolute inset-0"
              style={{ background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.35), transparent 60%)" }}
            />
            <div className="absolute inset-[18%] rounded-full border border-white/25" />
            <div className="absolute inset-[36%] rounded-full border border-white/20" />
          </div>
          <CautionTape className="absolute left-1/2 top-1/2 z-10 w-24 -translate-x-1/2 -translate-y-1/2 rotate-6" />
        </LockOutline>
        {/* Grows downward from this box's own fixed top edge, same as the
            "Locked" tooltip above. */}
        <span className="mt-1 text-[0.55rem] uppercase tracking-[0.3em] text-neon-dim transition-colors group-hover:text-neon">
          Water Portal
        </span>
      </button>
    </div>
  );
}
