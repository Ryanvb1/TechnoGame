"use client";

import { useEffect, useState } from "react";
import { CollectibleOrb } from "./CollectibleOrb";
import { FOREST_CHEST_OPENED_KEY, readInventory } from "./inventory";

const MESSAGE_MS = 2200;

// A small, moss-green chest tangled in vines, tucked in the corner — locked
// until the cave bear's key (see CaveScene.tsx's onReveal) turns up in the
// inventory (see inventory.ts), same "check what's actually in the
// player's pocket" idea as everything else that gates on an owned item
// rather than a separate unlock flag. One of the gnome's hidden orbs (see
// gnomeProgress.ts) sits half-sunken into the lid — no separate prop of
// its own, just DOM order stacking it behind the lid (see CollectibleOrb's
// own comment). The lid itself never animates open (that would expose the
// orb above before it's meant to be found); "unlocked" instead reads the
// same way every other hub destination does — LockOutline's red-to-green
// border — plus the padlock plate itself disappearing once there's
// nothing left to lock.
export function LockedChest() {
  const [hasKey, setHasKey] = useState(false);
  const [opened, setOpened] = useState(false);
  const [message, setMessage] = useState<"locked" | "unlocked" | null>(null);

  useEffect(() => {
    const inventory = readInventory();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage, an external store the server can't see; see the same pattern throughout the site.
    setHasKey(inventory.includes("forest-chest-key"));
    setOpened(window.localStorage.getItem(FOREST_CHEST_OPENED_KEY) === "true");
  }, []);

  function flashMessage(kind: "locked" | "unlocked") {
    setMessage(kind);
    window.setTimeout(() => setMessage(null), MESSAGE_MS);
  }

  function handleClick() {
    if (!hasKey) {
      flashMessage("locked");
      return;
    }
    if (opened) return;
    window.localStorage.setItem(FOREST_CHEST_OPENED_KEY, "true");
    setOpened(true);
    flashMessage("unlocked");
  }

  return (
    <div className="fixed bottom-6 right-6 z-20 sm:bottom-10 sm:right-10">
      {message && (
        <div className="pointer-events-none absolute bottom-full right-0 mb-3 w-36 border border-neon-dim bg-background/95 px-3 py-2 text-center text-[0.6rem] uppercase tracking-[0.2em] text-foreground shadow-[0_0_15px_var(--neon-dim)]">
          {message === "locked" ? "Locked" : "Unlocked!"}
        </div>
      )}
      <button
        onClick={handleClick}
        aria-label={
          !hasKey
            ? "A locked chest, tangled in vines"
            : opened
              ? "An opened chest, tangled in vines"
              : "An unlocked chest, tangled in vines"
        }
        className="group relative flex touch-manipulation flex-col items-center justify-end outline-none"
        style={{ minWidth: 76, height: 56 }}
      >
        <div
          className={`flex items-center justify-center p-1 transition-all duration-200 ${
            hasKey ? "border-2 border-neon shadow-[0_0_10px_var(--neon),0_0_20px_var(--neon-dim)]" : ""
          }`}
        >
          <div className="relative h-[48px] w-[64px]">
            <CollectibleOrb id="kiosk" style={{ left: 40, top: -11 }} />
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

            {/* padlock plate with a keyhole — gone once the key's actually
                turned up, the same beat as the padlock coming off for
                real */}
            {!hasKey && (
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
            )}

            {/* an inviting pulse once it can actually be opened — gone for
                good the instant it has been */}
            {hasKey && !opened && (
              <div
                className="pointer-events-none absolute left-1/2 top-[22px] h-[14px] w-[12px] -translate-x-1/2 animate-[aim-hint-pulse_1.3s_ease-in-out_infinite]"
                style={{ clipPath: "circle(50% at 50% 50%)", background: "var(--neon)", boxShadow: "0 0 8px var(--neon)" }}
              />
            )}

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
        </div>
      </button>
    </div>
  );
}
