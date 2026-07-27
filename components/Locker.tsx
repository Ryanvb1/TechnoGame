"use client";

import { useEffect, useState } from "react";
import { ITEM_DEFINITIONS, readEquippedItem, readInventory, setEquippedItem, type ItemId } from "./inventory";
import { RainbowShellIcon } from "./RainbowShellIcon";
import { DefaultShellIcon } from "./DefaultShellIcon";
import { BadgeIcon } from "./BadgeIcon";

// Extend this alongside ITEM_DEFINITIONS as more real loot exists. Each
// boss's badge is the same BadgeIcon shape, recolored to that creature.
const ITEM_ICON: Record<ItemId, React.ReactNode> = {
  "rainbow-shell": <RainbowShellIcon size={26} />,
  "knight-badge": <BadgeIcon color="#9aa5ad" size={26} />,
  "toad-badge": <BadgeIcon color="#7fae4a" size={26} />,
  "cave-bear-badge": <BadgeIcon color="#8a5a2b" size={26} />,
  "transformer-badge": <BadgeIcon color="#4dabf7" size={26} />,
};

// A new area in the kiosk for equipping loot pulled from victory chests
// (see VictoryScreen.tsx) — separate from the vending machine, which
// spends rainbow balls rather than showing off what you've already won.
export function Locker() {
  const [inventory, setInventory] = useState<ItemId[]>([]);
  const [equipped, setEquipped] = useState<ItemId | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage, an external store the server can't see; see the same pattern throughout the site.
    setInventory(readInventory());
    setEquipped(readEquippedItem());
  }, []);

  // Also used for the always-present "Default Shell" tile (id: null) — the
  // same toggle behavior applies: clicking it while something else is
  // equipped switches to it (clears the slot), clicking it while it's
  // already active is a no-op.
  function toggleEquip(id: ItemId | null) {
    const next = equipped === id ? null : id;
    setEquippedItem(next);
    setEquipped(next);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-full max-w-xs border-2 border-neon-dim/60 bg-background/90 shadow-[0_0_20px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between gap-3 border-b border-neon-dim/40 bg-neon-dim/10 px-3 py-1">
          <span className="text-[0.55rem] uppercase tracking-[0.3em] text-neon-dim">Locker</span>
          <span className="text-[0.55rem] uppercase tracking-[0.2em] text-foreground/60">
            {inventory.length} item{inventory.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className="p-2">
          {/* Capped and internally scrollable — the locker keeps growing as
              more bosses drop badges, and it shouldn't be what pushes the
              rest of the kiosk page into needing to scroll (see
              app/crate/page.tsx). */}
          <div className="grid max-h-[190px] grid-cols-3 gap-1.5 overflow-y-auto">
            {/* Always available, regardless of what's been won — equipping
                it is just clearing the equip slot, but it needs its own
                visible tile so "go back to normal" is a real choice here
                rather than something you can only do by unequipping loot. */}
            <button
              onClick={() => toggleEquip(null)}
              className={`flex touch-manipulation flex-col items-center gap-1 border px-1 py-2 text-center transition-colors ${
                equipped === null ? "border-neon bg-neon/10" : "border-neon-dim/40 hover:border-neon"
              }`}
            >
              <DefaultShellIcon size={26} />
              <span className="text-[0.45rem] uppercase leading-tight tracking-[0.1em] text-foreground/80">
                Default Shell
              </span>
              <span className="text-[0.5rem] text-neon-dim">{equipped === null ? "Equipped" : "Equip"}</span>
            </button>
            {inventory.map((id) => {
              const owned = equipped === id;
              return (
                <button
                  key={id}
                  onClick={() => toggleEquip(id)}
                  className={`flex touch-manipulation flex-col items-center gap-1 border px-1 py-2 text-center transition-colors ${
                    owned ? "border-neon bg-neon/10" : "border-neon-dim/40 hover:border-neon"
                  }`}
                >
                  {ITEM_ICON[id]}
                  <span className="text-[0.45rem] uppercase leading-tight tracking-[0.1em] text-foreground/80">
                    {ITEM_DEFINITIONS[id].name}
                  </span>
                  <span className="text-[0.5rem] text-neon-dim">{owned ? "Equipped" : "Equip"}</span>
                </button>
              );
            })}
          </div>
          {inventory.length === 0 && (
            <p className="px-2 pt-4 text-center text-[0.6rem] uppercase tracking-[0.2em] text-foreground/40">
              No loot yet — victories will leave something here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
