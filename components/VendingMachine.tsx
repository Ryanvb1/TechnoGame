"use client";

import { useEffect, useState } from "react";
import { readRainbowBalls, spendRainbowBalls } from "./rainbowBalls";
import {
  DEFAULT_FOOTSTEP_COLOR,
  FOOTSTEP_COLOR_OPTIONS,
  readFootstepColor,
  setFootstepColor,
} from "./footstepColor";

type Slot =
  | { kind: "footstep"; name: string; price: number; color: string }
  | { kind: "placeholder"; name: string; price: number };

// Rounds out the footstep-color options to 15 slots total — the rest are
// inert placeholders until there's something real to sell there.
const PLACEHOLDER_PRICES = [150, 800, 1200, 250, 2000, 90, 1600, 400, 3000, 700, 1000];

const SLOTS: Slot[] = [
  ...FOOTSTEP_COLOR_OPTIONS.map(
    (c): Slot => ({ kind: "footstep", name: c.name, price: c.price, color: c.value })
  ),
  ...PLACEHOLDER_PRICES.map((price): Slot => ({ kind: "placeholder", name: "Coming Soon", price })),
];

export function VendingMachine() {
  // Server-rendered HTML always assumes defaults (no localStorage on the
  // server); this effect syncs in the real values right after mount, same
  // pattern as the rest of the site's progress state.
  const [balance, setBalance] = useState(0);
  const [activeColor, setActiveColor] = useState(DEFAULT_FOOTSTEP_COLOR);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage, an external store the server can't see; see comment above.
    setBalance(readRainbowBalls());
    setActiveColor(readFootstepColor());
  }, []);

  function flash(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2000);
  }

  function buyFootstepColor(slot: Extract<Slot, { kind: "footstep" }>) {
    if (slot.color === activeColor) return;
    if (!spendRainbowBalls(slot.price)) {
      flash("Not enough rainbow balls.");
      return;
    }
    setFootstepColor(slot.color);
    setActiveColor(slot.color);
    setBalance(readRainbowBalls());
    flash(`${slot.name} equipped.`);
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
            slot.kind === "footstep" ? (
              <FootstepSlot key={i} slot={slot} owned={slot.color === activeColor} onBuy={buyFootstepColor} />
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

function FootstepSlot({
  slot,
  owned,
  onBuy,
}: {
  slot: Extract<Slot, { kind: "footstep" }>;
  owned: boolean;
  onBuy: (slot: Extract<Slot, { kind: "footstep" }>) => void;
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
        className="h-3 w-3"
        style={{ clipPath: "circle(50% at 50% 50%)", background: slot.color, boxShadow: `0 0 6px ${slot.color}` }}
      />
      <span className="text-[0.5rem] uppercase leading-tight tracking-[0.1em] text-foreground/80">
        {slot.name}
      </span>
      <span className="text-[0.55rem] text-neon-dim">{owned ? "Equipped" : slot.price}</span>
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
