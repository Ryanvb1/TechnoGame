"use client";

import { useEffect, useState } from "react";
import { readAirportUnlocked } from "./siteAccess";
import { LockOutline } from "./LockOutline";

const MESSAGE_MS = 2200;

// A runway with a small terminal building beside it, tucked in the
// top-right corner of the hub. Locked by default; purchasable in the
// kiosk's vending machine (see VendingMachine.tsx) — buying it doesn't
// unlock a destination yet (nothing's built behind it), just changes what
// clicking it tells you. The runway is what actually reads as "airport"
// at a glance; the terminal is deliberately plain next to it.
export function Airport() {
  const [unlocked, setUnlocked] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage, an external store the server can't see; see comment above.
    setUnlocked(readAirportUnlocked());
  }, []);

  function handleClick() {
    setShowMessage(true);
    window.setTimeout(() => setShowMessage(false), MESSAGE_MS);
  }

  return (
    <div className="fixed right-6 top-6 z-20 sm:right-10 sm:top-10">
      {showMessage && (
        <div className="pointer-events-none absolute top-full right-0 mt-3 w-36 border border-neon-dim bg-background/95 px-3 py-2 text-center text-[0.6rem] uppercase tracking-[0.2em] text-foreground shadow-[0_0_15px_var(--neon-dim)]">
          {unlocked ? "Coming Soon" : "Locked"}
        </div>
      )}
      <button
        onClick={handleClick}
        aria-label={unlocked ? "The airport, access purchased" : "A locked airport"}
        className="group relative flex touch-manipulation flex-col items-end justify-end outline-none"
      >
        <LockOutline unlocked={unlocked} className={`p-2 ${unlocked ? "" : "opacity-50"}`}>
        <div
          className="relative h-12 w-[196px]"
          style={{ filter: unlocked ? "drop-shadow(0 0 10px var(--neon-dim))" : "none" }}
        >
          {/* runway, stretching left from the tower's base — the piece
              that actually signals "airport" rather than just "tower" */}
          <div className="absolute bottom-0 left-0 h-5 w-[132px]" style={{ background: "#34383a" }}>
            {/* worn edge lines */}
            <div className="absolute inset-x-0 top-0 h-px bg-white/15" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-white/15" />
            {/* dashed centerline */}
            <div className="absolute left-0 top-1/2 flex w-full -translate-y-1/2 justify-around px-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-[2px] w-4 bg-[#e8e8ec]/70" />
              ))}
            </div>
            {/* threshold stripes where the runway meets the tower apron */}
            <div className="absolute right-2 top-[3px] flex h-[14px] gap-[3px]">
              <div className="h-full w-[3px] bg-[#e8e8ec]/80" />
              <div className="h-full w-[3px] bg-[#e8e8ec]/80" />
              <div className="h-full w-[3px] bg-[#e8e8ec]/80" />
            </div>
            {/* edge lights */}
            {[10, 42, 74, 106].map((left) => (
              <div key={left} className="absolute -top-1 h-1 w-1" style={{ left }}>
                <div
                  className="h-full w-full animate-[fire-glow-pulse_2.2s_ease-in-out_infinite]"
                  style={{ clipPath: "circle(50% at 50% 50%)", background: "#ffd98a", boxShadow: "0 0 5px #ffd98a" }}
                />
              </div>
            ))}
            {[10, 42, 74, 106].map((left) => (
              <div key={`b${left}`} className="absolute -bottom-1 h-1 w-1" style={{ left }}>
                <div
                  className="h-full w-full animate-[fire-glow-pulse_2.2s_ease-in-out_infinite]"
                  style={{ clipPath: "circle(50% at 50% 50%)", background: "#ffd98a", boxShadow: "0 0 5px #ffd98a" }}
                />
              </div>
            ))}
          </div>

          {/* simple flat-roofed terminal, sitting beside the runway's near
              end */}
          <div className="absolute bottom-0 right-2 h-12 w-[58px]">
            {/* roof strip */}
            <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: "#5c6469" }} />
            {/* body */}
            <div
              className="absolute inset-x-0 top-1.5 bottom-0"
              style={{ background: "linear-gradient(180deg, #b0b8bf 0%, #7f868c 100%)" }}
            />
            {/* row of lit windows */}
            <div className="absolute inset-x-2 top-4 flex justify-between">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-3 w-2"
                  style={{ background: "linear-gradient(180deg, #7dd3fc 0%, #0ea5e9 100%)" }}
                />
              ))}
            </div>
            {/* entrance */}
            <div className="absolute bottom-0 left-1/2 h-4 w-3 -translate-x-1/2" style={{ background: "#2a2e30" }} />
          </div>
        </div>
        </LockOutline>
      </button>
    </div>
  );
}
