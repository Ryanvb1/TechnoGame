"use client";

import { useEffect, useState } from "react";
import { readCaveUnlocked } from "./siteAccess";
import { LockOutline } from "./LockOutline";
import { useSceneTravel } from "./PageTransition";

const MESSAGE_MS = 2200;

// A rocky outcrop with a dark arched mouth, tucked in the bottom-left
// corner of the hub. Locked by default; purchasable in the kiosk's vending
// machine (see VendingMachine.tsx). Once unlocked it's a real destination
// (see app/cave/page.tsx) — "down" as in descending into it, mirrored by
// that page's own backDirection="up" to climb back out. One of the
// gnome's hidden orbs (see gnomeProgress.ts) used to sit tucked into the
// mound's shoulder here, but that put it behind a locked destination — it
// now lives in AmbientDetails.tsx, tucked behind one of the hub's floating
// shard clusters instead, so it's reachable without unlocking anything.
export function Cave() {
  const [unlocked, setUnlocked] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const travel = useSceneTravel();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage, an external store the server can't see; see comment above.
    setUnlocked(readCaveUnlocked());
  }, []);

  function handleClick() {
    if (unlocked) {
      travel("/cave");
      return;
    }
    setShowMessage(true);
    window.setTimeout(() => setShowMessage(false), MESSAGE_MS);
  }

  return (
    <div className="fixed bottom-6 left-6 z-20 sm:bottom-10 sm:left-10">
      {showMessage && (
        <div className="pointer-events-none absolute bottom-full left-0 mb-3 w-36 border border-neon-dim bg-background/95 px-3 py-2 text-center text-[0.6rem] uppercase tracking-[0.2em] text-foreground shadow-[0_0_15px_var(--neon-dim)]">
          Locked
        </div>
      )}
      <button
        onClick={handleClick}
        aria-label={unlocked ? "Enter the cave" : "A locked cave entrance"}
        className="group relative flex touch-manipulation flex-col items-center justify-end outline-none"
      >
        {/* Grows upward from this box's own fixed bottom edge, same as the
            "Locked" tooltip above, so it stays on screen instead of the
            cave being just an unlabeled image. */}
        <span className="mb-1 text-[0.55rem] uppercase tracking-[0.3em] text-neon-dim transition-colors group-hover:text-neon">
          Cave
        </span>
        <LockOutline unlocked={unlocked} className={`p-2 ${unlocked ? "" : "opacity-50"}`}>
        <div
          className="relative h-[108px] w-[152px]"
          style={{ filter: unlocked ? "drop-shadow(0 0 10px var(--neon-dim))" : "none" }}
        >
          {/* distant dimmer rock layer for depth */}
          <div
            className="absolute bottom-0 h-[92px] w-full opacity-60 blur-[0.5px]"
            style={{
              clipPath:
                "polygon(0% 100%, 4% 62%, 18% 48%, 34% 66%, 48% 40%, 64% 60%, 78% 36%, 92% 58%, 100% 46%, 100% 100%)",
              background: "linear-gradient(180deg, #4c4740 0%, #2e2a24 100%)",
            }}
          />
          {/* main rocky mound — jagged across the left/center, then a
              clean diagonal shoulder on the right (82%→100%) that the orb
              above sits half-tucked behind */}
          <div
            className="absolute bottom-0 h-full w-full"
            style={{
              clipPath:
                "polygon(0% 100%, 2% 58%, 8% 44%, 14% 60%, 20% 34%, 28% 52%, 36% 24%, 44% 44%, 50% 16%, 58% 40%, 66% 20%, 74% 42%, 82% 26%, 100% 58%, 100% 100%)",
              background: "linear-gradient(160deg, #7a7168 0%, #4f473c 55%, #2a2620 100%)",
            }}
          />
          {/* worn rock rim around the opening — a lighter halo poking out
              past the black mouth below, so the hole itself reads as
              carved *into* the rock instead of blending flat against it */}
          <div
            className="absolute bottom-0 left-[38%] h-[74px] w-[66px] -translate-x-1/2"
            style={{
              clipPath: "polygon(50% 0%, 86% 20%, 100% 100%, 0% 100%, 14% 20%)",
              background: "linear-gradient(180deg, #8a7d68 0%, #5c5142 100%)",
            }}
          />
          {/* the mouth itself — solid black, no gradient softness, so the
              silhouette against the rock is unmistakable */}
          <div
            className="absolute bottom-0 left-[38%] h-[68px] w-[58px] -translate-x-1/2"
            style={{
              clipPath: "polygon(50% 0%, 85% 19%, 100% 100%, 0% 100%, 15% 19%)",
              background: "#000000",
              boxShadow: "inset 0 10px 20px rgba(0,0,0,0.9)",
            }}
          />
          {/* nested inner arch, darker still at its core, with the faint
              cold glow deep inside — something's in there */}
          <div
            className="absolute bottom-0 left-[38%] h-[46px] w-[38px] -translate-x-1/2"
            style={{
              clipPath: "polygon(50% 0%, 82% 22%, 100% 100%, 0% 100%, 18% 22%)",
              background: "radial-gradient(closest-side, rgba(40,70,100,0.22) 0%, #000000 80%)",
            }}
          />
          {/* stalactites hanging just inside the mouth's lip */}
          <div
            className="absolute bottom-[62px] left-[34%] h-3 w-2"
            style={{ clipPath: "polygon(50% 100%, 0% 0%, 100% 0%)", background: "#1c1712" }}
          />
          <div
            className="absolute bottom-[60px] left-[46%] h-4 w-2"
            style={{ clipPath: "polygon(50% 100%, 0% 0%, 100% 0%)", background: "#140f0b" }}
          />
          {/* loose boulders scattered at the base, in front of the mound */}
          <div
            className="absolute bottom-0 left-[4px] h-3 w-4"
            style={{
              clipPath: "polygon(0% 100%, 10% 30%, 55% 0%, 95% 35%, 100% 100%)",
              background: "linear-gradient(160deg, #6b6358 0%, #362f28 100%)",
            }}
          />
          <div
            className="absolute bottom-0 right-2 h-4 w-5"
            style={{
              clipPath: "polygon(0% 100%, 8% 40%, 48% 5%, 90% 30%, 100% 100%)",
              background: "linear-gradient(160deg, #756c60 0%, #3a332b 100%)",
            }}
          />
          {/* moss/vine patches, echoing the vines/leaves on the locked chest */}
          <div
            className="absolute bottom-4 left-2 h-3 w-4 rotate-[-15deg]"
            style={{ background: "#4a7a3a", clipPath: "polygon(0% 50%, 50% 0%, 100% 50%, 50% 100%)" }}
          />
          <div
            className="absolute bottom-7 right-3 h-3 w-4 rotate-[20deg]"
            style={{ background: "#5c9645", clipPath: "polygon(0% 50%, 50% 0%, 100% 50%, 50% 100%)" }}
          />
          <div
            className="absolute bottom-2 left-[42%] h-2 w-3 rotate-[8deg]"
            style={{ background: "#4a7a3a", clipPath: "polygon(0% 50%, 50% 0%, 100% 50%, 50% 100%)" }}
          />
        </div>
        </LockOutline>
      </button>
    </div>
  );
}
