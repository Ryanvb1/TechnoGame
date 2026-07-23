"use client";

import { useEffect, useState } from "react";
import { readRainbowBalls, spendRainbowBalls } from "./rainbowBalls";
import { readAirportUnlocked, readCaveUnlocked, unlockAirport, unlockCave } from "./siteAccess";

type AccessTarget = "airport" | "cave";

type Slot =
  | { kind: "access"; name: string; price: number; target: AccessTarget }
  | { kind: "placeholder"; name: string; price: number };

const ACCESS_OPTIONS: { name: string; price: number; target: AccessTarget }[] = [
  { name: "Access Airport", price: 600, target: "airport" },
  { name: "Access Cave", price: 600, target: "cave" },
];

// Rounds out the access options to 15 slots total — the rest are inert
// placeholders until there's something real to sell there.
const PLACEHOLDER_PRICES = [150, 800, 1200, 250, 2000, 90, 1600, 400, 3000, 700, 1000, 500, 2500];

const SLOTS: Slot[] = [
  ...ACCESS_OPTIONS.map((o): Slot => ({ kind: "access", name: o.name, price: o.price, target: o.target })),
  ...PLACEHOLDER_PRICES.map((price): Slot => ({ kind: "placeholder", name: "Coming Soon", price })),
];

export function VendingMachine() {
  // Server-rendered HTML always assumes defaults (no localStorage on the
  // server); this effect syncs in the real values right after mount, same
  // pattern as the rest of the site's progress state.
  const [balance, setBalance] = useState(0);
  const [airportUnlocked, setAirportUnlocked] = useState(false);
  const [caveUnlocked, setCaveUnlocked] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage, an external store the server can't see; see comment above.
    setBalance(readRainbowBalls());
    setAirportUnlocked(readAirportUnlocked());
    setCaveUnlocked(readCaveUnlocked());
  }, []);

  function flash(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2000);
  }

  function buyAccess(slot: Extract<Slot, { kind: "access" }>) {
    const owned = slot.target === "airport" ? airportUnlocked : caveUnlocked;
    if (owned) return;
    if (!spendRainbowBalls(slot.price)) {
      flash("Not enough rainbow balls.");
      return;
    }
    if (slot.target === "airport") {
      unlockAirport();
      setAirportUnlocked(true);
    } else {
      unlockCave();
      setCaveUnlocked(true);
    }
    setBalance(readRainbowBalls());
    flash(`${slot.name} unlocked.`);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative border-2 border-neon-dim/60 bg-background/90 shadow-[0_0_20px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between gap-3 border-b border-neon-dim/40 bg-neon-dim/10 px-3 py-1.5">
          <span className="text-[0.55rem] uppercase tracking-[0.3em] text-neon-dim">Vending</span>
          <span className="text-[0.55rem] uppercase tracking-[0.2em] text-foreground/60">
            {balance.toLocaleString()} balls
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 p-3">
          {SLOTS.map((slot, i) =>
            slot.kind === "access" ? (
              <AccessSlot
                key={i}
                slot={slot}
                owned={slot.target === "airport" ? airportUnlocked : caveUnlocked}
                onBuy={buyAccess}
              />
            ) : (
              <PlaceholderSlot key={i} name={slot.name} price={slot.price} />
            )
          )}
        </div>
        {/* coin slot */}
        <div className="flex justify-center border-t border-neon-dim/40 bg-neon-dim/10 py-1.5">
          <div className="h-1 w-8 bg-black/60" />
        </div>
      </div>
      <p className="h-4 text-[0.6rem] uppercase tracking-[0.2em] text-neon">{message}</p>
    </div>
  );
}

function AccessSlot({
  slot,
  owned,
  onBuy,
}: {
  slot: Extract<Slot, { kind: "access" }>;
  owned: boolean;
  onBuy: (slot: Extract<Slot, { kind: "access" }>) => void;
}) {
  return (
    <button
      onClick={() => onBuy(slot)}
      disabled={owned}
      className={`flex touch-manipulation flex-col items-center gap-1 border px-2 py-3 text-center transition-colors ${
        owned ? "border-neon bg-neon/10" : "border-neon-dim/40 hover:border-neon"
      }`}
    >
      <span
        className="h-3 w-3 rotate-45"
        style={{ background: "var(--neon)", boxShadow: "0 0 6px var(--neon)" }}
      />
      <span className="text-[0.5rem] uppercase leading-tight tracking-[0.1em] text-foreground/80">
        {slot.name}
      </span>
      <span className="text-[0.55rem] text-neon-dim">{owned ? "Unlocked" : slot.price}</span>
    </button>
  );
}

function PlaceholderSlot({ name, price }: { name: string; price: number }) {
  return (
    <div className="flex flex-col items-center gap-1 border border-neon-dim/15 px-2 py-3 text-center opacity-40">
      <span className="h-3 w-3 rotate-45 bg-neon-dim/40" />
      <span className="text-[0.5rem] uppercase leading-tight tracking-[0.1em] text-foreground/50">{name}</span>
      <span className="text-[0.55rem] text-neon-dim/60">{price}</span>
    </div>
  );
}
