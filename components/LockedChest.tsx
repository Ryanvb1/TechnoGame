"use client";

import { useState } from "react";

const LOCK_MESSAGE_MS = 2200;

// A small, moss-green chest tangled in vines, tucked in the corner —
// locked for now. No unlock mechanic yet, it just tells you it's locked.
export function LockedChest() {
  const [showMessage, setShowMessage] = useState(false);

  function handleClick() {
    setShowMessage(true);
    window.setTimeout(() => setShowMessage(false), LOCK_MESSAGE_MS);
  }

  return (
    <div className="fixed bottom-6 right-6 z-20 sm:bottom-10 sm:right-10">
      {showMessage && (
        <div className="pointer-events-none absolute bottom-full right-0 mb-3 w-36 border border-neon-dim bg-background/95 px-3 py-2 text-center text-[0.6rem] uppercase tracking-[0.2em] text-foreground shadow-[0_0_15px_var(--neon-dim)]">
          Locked
        </div>
      )}
      <button
        onClick={handleClick}
        aria-label="A locked chest, tangled in vines"
        className="group relative flex touch-manipulation flex-col items-center justify-end outline-none"
        style={{ minWidth: 76, height: 56 }}
      >
        <div className="relative h-[48px] w-[64px]">
          {/* body */}
          <div
            className="absolute bottom-0 h-[30px] w-full"
            style={{
              background: "linear-gradient(180deg, #3f5c34 0%, #24361c 100%)",
              boxShadow: "0 3px 6px rgba(0,0,0,0.4)",
            }}
          />
          {/* lid */}
          <div
            className="absolute top-0 h-[20px] w-full"
            style={{
              clipPath: "polygon(6% 100%, 0% 30%, 18% 0%, 82% 0%, 100% 30%, 94% 100%)",
              background: "linear-gradient(180deg, #4a6b3c 0%, #2c4322 100%)",
            }}
          />
          {/* metal band */}
          <div className="absolute inset-y-0 left-1/2 w-[6px] -translate-x-1/2 bg-[#6b6255]" />

          {/* padlock plate with a keyhole */}
          <div
            className="absolute left-1/2 top-[22px] h-[14px] w-[12px] -translate-x-1/2"
            style={{ background: "#8a7d5c", boxShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
          >
            <div
              className="absolute left-1/2 top-[3px] h-[4px] w-[4px] -translate-x-1/2"
              style={{ clipPath: "circle(50% at 50% 50%)", background: "#2a2018" }}
            />
            <div
              className="absolute left-1/2 top-[6px] h-[4px] w-[2px] -translate-x-1/2"
              style={{ background: "#2a2018" }}
            />
          </div>

          {/* vines wrapping around it */}
          <div
            className="absolute -left-2 top-2 h-[34px] w-[7px] rotate-[10deg]"
            style={{
              background: "#4a7a3a",
              clipPath: "polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)",
            }}
          />
          <div
            className="absolute -right-2 bottom-1 h-[26px] w-[6px] rotate-[-12deg]"
            style={{
              background: "#4a7a3a",
              clipPath: "polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)",
            }}
          />
          {/* leaves */}
          <div
            className="absolute -left-3 top-0 h-3 w-4 rotate-[-20deg]"
            style={{ background: "#5c9645", clipPath: "polygon(0% 50%, 50% 0%, 100% 50%, 50% 100%)" }}
          />
          <div
            className="absolute -right-3 bottom-3 h-3 w-4 rotate-[25deg]"
            style={{ background: "#5c9645", clipPath: "polygon(0% 50%, 50% 0%, 100% 50%, 50% 100%)" }}
          />
        </div>
      </button>
    </div>
  );
}
