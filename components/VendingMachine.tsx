"use client";

import { useEffect, useState } from "react";
import { RAINBOW_BALLS_CHANGED_EVENT, readRainbowBalls, spendRainbowBalls } from "./rainbowBalls";
import { readCaveUnlocked, unlockCave } from "./siteAccess";
import { PLACEHOLDER_ICONS } from "./PlaceholderItemIcons";
import { addToInventory, readInventory, type ShellItemId } from "./inventory";
import { SolidShellIcon } from "./SolidShellIcon";
import { useSoundEffects } from "./MusicProvider";

type AccessTarget = "cave";

type Slot =
  | { kind: "access"; name: string; price: number; target: AccessTarget }
  | { kind: "shell"; name: string; price: number; itemId: ShellItemId; color: "black" | "white" }
  | { kind: "placeholder"; name: string; price: number; icon: React.ComponentType<{ size?: number }> };

const ACCESS_OPTIONS: { name: string; price: number; target: AccessTarget }[] = [
  { name: "Access Cave", price: 600, target: "cave" },
];

// Rounds out the access options to 15 slots total — the rest are inert
// placeholders until there's something real to sell there. One distinct
// icon per slot (see PlaceholderItemIcons) rather than the same plain
// diamond repeatedly, so the machine reads as stocked rather
// than one item duplicated.
const PLACEHOLDER_PRICES = [150, 800, 1200, 250, 2000, 90, 1600, 400, 3000, 700, 1000, 500, 2500];

const SLOTS: Slot[] = [
  ...ACCESS_OPTIONS.map((o): Slot => ({ kind: "access", name: o.name, price: o.price, target: o.target })),
  { kind: "shell", name: "Black Shell", price: 400, itemId: "black-shell", color: "black" },
  { kind: "shell", name: "White Shell", price: 400, itemId: "white-shell", color: "white" },
  ...PLACEHOLDER_PRICES.slice(0, 12).map(
    (price, i): Slot => ({ kind: "placeholder", name: "Coming Soon", price, icon: PLACEHOLDER_ICONS[i] }),
  ),
];

export function VendingMachine() {
  const playSound = useSoundEffects();
  // Server-rendered HTML always assumes defaults (no localStorage on the
  // server); this effect syncs in the real values right after mount, same
  // pattern as the rest of the site's progress state.
  const [balance, setBalance] = useState(0);
  const [caveUnlocked, setCaveUnlocked] = useState(false);
  const [ownedShells, setOwnedShells] = useState<ShellItemId[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage, an external store the server can't see; see comment above.
    setBalance(readRainbowBalls());
    setCaveUnlocked(readCaveUnlocked());
    setOwnedShells(readInventory().filter((id): id is ShellItemId => id.endsWith("-shell")));
  }, []);

  useEffect(() => {
    function syncBalance() {
      setBalance(readRainbowBalls());
    }
    window.addEventListener(RAINBOW_BALLS_CHANGED_EVENT, syncBalance);
    return () => window.removeEventListener(RAINBOW_BALLS_CHANGED_EVENT, syncBalance);
  }, []);

  function flash(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2000);
  }

  function buyAccess(slot: Extract<Slot, { kind: "access" }>) {
    const owned = caveUnlocked;
    if (owned) return;
    if (!spendRainbowBalls(slot.price)) {
      flash("Not enough rainbow balls.");
      return;
    }
    unlockCave();
    setCaveUnlocked(true);
    playSound("purchase");
    setBalance(readRainbowBalls());
    flash(`${slot.name} unlocked.`);
  }

  function buyShell(slot: Extract<Slot, { kind: "shell" }>) {
    if (ownedShells.includes(slot.itemId)) return;
    if (!spendRainbowBalls(slot.price)) {
      playSound("denied");
      flash("Not enough rainbow balls.");
      return;
    }
    addToInventory(slot.itemId);
    setOwnedShells((current) => [...current, slot.itemId]);
    playSound("purchase");
    setBalance(readRainbowBalls());
    flash(`${slot.name} purchased.`);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative border-2 border-neon-dim/60 bg-background/90 shadow-[0_0_20px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between gap-3 border-b border-neon-dim/40 bg-neon-dim/10 px-3 py-1">
          <span className="text-[0.55rem] uppercase tracking-[0.3em] text-neon-dim">Vending</span>
          <span className="text-[0.55rem] uppercase tracking-[0.2em] text-foreground/60">
            {balance.toLocaleString()} balls
          </span>
        </div>
        {/* 5 columns (3 rows for the 15 slots) rather than 3 (5 rows) — same
            stock, a shorter machine, so it fits on screen alongside the
            Locker/CrateOpener (see app/crate/page.tsx). */}
        <div className="grid grid-cols-5 gap-1 p-1.5">
          {SLOTS.map((slot, i) =>
            slot.kind === "access" ? (
              <AccessSlot
                key={i}
                slot={slot}
                owned={caveUnlocked}
                onBuy={buyAccess}
              />
            ) : slot.kind === "shell" ? (
              <ShellSlot
                key={i}
                slot={slot}
                owned={ownedShells.includes(slot.itemId)}
                onBuy={buyShell}
              />
            ) : (
              <PlaceholderSlot key={i} name={slot.name} price={slot.price} icon={slot.icon} />
            )
          )}
        </div>
        {/* coin slot */}
        <div className="flex justify-center border-t border-neon-dim/40 bg-neon-dim/10 py-1">
          <div className="h-1 w-8 bg-black/60" />
        </div>
      </div>
      <p className="h-4 text-[0.6rem] uppercase tracking-[0.2em] text-neon">{message}</p>
    </div>
  );
}

function ShellSlot({
  slot,
  owned,
  onBuy,
}: {
  slot: Extract<Slot, { kind: "shell" }>;
  owned: boolean;
  onBuy: (slot: Extract<Slot, { kind: "shell" }>) => void;
}) {
  return (
    <button
      onClick={() => onBuy(slot)}
      disabled={owned}
      className={`flex touch-manipulation flex-col items-center gap-0.5 border px-1 py-1.5 text-center transition-colors ${
        owned ? "border-neon bg-neon/10" : "border-neon-dim/40 hover:border-neon"
      }`}
    >
      <SolidShellIcon color={slot.color} size={16} />
      <span className="text-[0.45rem] uppercase leading-tight tracking-[0.1em] text-foreground/80">
        {slot.name}
      </span>
      <span className="text-[0.5rem] text-neon-dim">{owned ? "Owned" : slot.price}</span>
    </button>
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
      className={`flex touch-manipulation flex-col items-center gap-0.5 border px-1 py-1.5 text-center transition-colors ${
        owned ? "border-neon bg-neon/10" : "border-neon-dim/40 hover:border-neon"
      }`}
    >
      <span
        className="h-3 w-3 rotate-45"
        style={{ background: "var(--neon)", boxShadow: "0 0 6px var(--neon)" }}
      />
      <span className="text-[0.45rem] uppercase leading-tight tracking-[0.1em] text-foreground/80">
        {slot.name}
      </span>
      <span className="text-[0.5rem] text-neon-dim">{owned ? "Unlocked" : slot.price}</span>
    </button>
  );
}

function PlaceholderSlot({
  name,
  price,
  icon: Icon,
}: {
  name: string;
  price: number;
  icon: React.ComponentType<{ size?: number }>;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 border border-neon-dim/15 px-1 py-1.5 text-center opacity-60 grayscale">
      <Icon size={16} />
      <span className="text-[0.45rem] uppercase leading-tight tracking-[0.1em] text-foreground/50">{name}</span>
      <span className="text-[0.5rem] text-neon-dim/60">{price}</span>
    </div>
  );
}
