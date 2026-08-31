"use client";

import { useEffect, useState } from "react";
import {
  INVENTORY_CHANGED_EVENT,
  ITEM_DEFINITIONS,
  MISC_ITEM_IDS,
  NECKLACE_ITEM_IDS,
  SHELL_ITEM_IDS,
  readEquippedNecklace,
  readEquippedShell,
  readInventory,
  setEquippedNecklace,
  setEquippedShell,
  type ItemId,
  type NecklaceItemId,
  type ShellItemId,
} from "./inventory";
import { RainbowShellIcon } from "./RainbowShellIcon";
import { DefaultShellIcon } from "./DefaultShellIcon";
import { SolidShellIcon } from "./SolidShellIcon";
import { NecklaceIcon } from "./NecklaceIcon";
import { KeyIcon } from "./KeyIcon";

const ITEM_ICON: Record<ItemId, React.ReactNode> = {
  "rainbow-shell": <RainbowShellIcon size={26} />,
  "black-shell": <SolidShellIcon color="black" size={26} />,
  "white-shell": <SolidShellIcon color="white" size={26} />,
  "knight-badge": <NecklaceIcon color="#9aa5ad" size={26} />,
  "toad-badge": <NecklaceIcon color="#7fae4a" size={26} />,
  "cave-bear-badge": <NecklaceIcon color="#8a5a2b" size={26} />,
  "transformer-badge": <NecklaceIcon color="#4dabf7" size={26} />,
  "forest-chest-key": <KeyIcon size={26} />,
};

export function Locker() {
  const [inventory, setInventory] = useState<ItemId[]>([]);
  const [equippedShell, setEquippedShellState] = useState<ShellItemId | null>(null);
  const [equippedNecklace, setEquippedNecklaceState] = useState<NecklaceItemId | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing browser-local inventory/equipment after hydration.
    setInventory(readInventory());
    setEquippedShellState(readEquippedShell());
    setEquippedNecklaceState(readEquippedNecklace());
  }, []);

  useEffect(() => {
    function syncInventory() {
      setInventory(readInventory());
    }
    window.addEventListener(INVENTORY_CHANGED_EVENT, syncInventory);
    return () => window.removeEventListener(INVENTORY_CHANGED_EVENT, syncInventory);
  }, []);

  const shells = SHELL_ITEM_IDS.filter((id) => inventory.includes(id));
  const necklaces = NECKLACE_ITEM_IDS.filter((id) => inventory.includes(id));
  const miscellaneous = MISC_ITEM_IDS.filter((id) => inventory.includes(id));

  function equipShell(id: ShellItemId | null) {
    const next = equippedShell === id ? null : id;
    setEquippedShell(next);
    setEquippedShellState(next);
  }

  function equipNecklace(id: NecklaceItemId) {
    const next = equippedNecklace === id ? null : id;
    setEquippedNecklace(next);
    setEquippedNecklaceState(next);
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

        <div className="max-h-[240px] space-y-3 overflow-y-auto p-2">
          <LockerSection title="Shells">
            <EquipmentTile
              name="Default Shell"
              icon={<DefaultShellIcon size={26} />}
              equipped={equippedShell === null}
              onClick={() => equipShell(null)}
            />
            {shells.map((id) => (
              <EquipmentTile
                key={id}
                name={ITEM_DEFINITIONS[id].name}
                icon={ITEM_ICON[id]}
                equipped={equippedShell === id}
                onClick={() => equipShell(id)}
              />
            ))}
          </LockerSection>

          <LockerSection title="Necklaces" empty={necklaces.length === 0}>
            {necklaces.map((id) => (
              <EquipmentTile
                key={id}
                name={ITEM_DEFINITIONS[id].name}
                icon={ITEM_ICON[id]}
                equipped={equippedNecklace === id}
                onClick={() => equipNecklace(id)}
              />
            ))}
          </LockerSection>

          <LockerSection title="Miscellaneous" empty={miscellaneous.length === 0}>
            {miscellaneous.map((id) => (
              <div
                key={id}
                className="flex flex-col items-center gap-1 border border-neon-dim/25 px-1 py-2 text-center"
              >
                {ITEM_ICON[id]}
                <span className="text-[0.45rem] uppercase leading-tight tracking-[0.1em] text-foreground/75">
                  {ITEM_DEFINITIONS[id].name}
                </span>
                <span className="text-[0.5rem] text-foreground/35">Stored</span>
              </div>
            ))}
          </LockerSection>
        </div>
      </div>
    </div>
  );
}

function LockerSection({
  title,
  children,
  empty = false,
}: {
  title: string;
  children: React.ReactNode;
  empty?: boolean;
}) {
  return (
    <section>
      <div className="mb-1 border-b border-neon-dim/25 pb-1 text-left text-[0.5rem] uppercase tracking-[0.28em] text-neon-dim">
        {title}
      </div>
      {empty ? (
        <p className="py-1 text-center text-[0.48rem] uppercase tracking-[0.15em] text-foreground/30">
          None collected
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-1.5">{children}</div>
      )}
    </section>
  );
}

function EquipmentTile({
  name,
  icon,
  equipped,
  onClick,
}: {
  name: string;
  icon: React.ReactNode;
  equipped: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex touch-manipulation flex-col items-center gap-1 border px-1 py-2 text-center transition-colors ${
        equipped ? "border-neon bg-neon/10" : "border-neon-dim/40 hover:border-neon"
      }`}
    >
      {icon}
      <span className="text-[0.45rem] uppercase leading-tight tracking-[0.1em] text-foreground/80">
        {name}
      </span>
      <span className="text-[0.5rem] text-neon-dim">{equipped ? "Equipped" : "Equip"}</span>
    </button>
  );
}
