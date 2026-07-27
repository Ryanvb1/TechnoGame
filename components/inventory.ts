// Items granted by victory chests (see VictoryScreen.tsx) — separate from
// the gnome's tube/orbs and the kiosk's rainbow balls, this is stuff you
// can actually equip in the Locker (see Locker.tsx) to change how things
// look elsewhere on the site. The badges aren't equippable (there's
// nothing on-site for them to visually change yet) but still live in the
// same inventory/Locker so every boss's trophy collects in one place.
export type ItemId =
  | "rainbow-shell"
  | "knight-badge"
  | "toad-badge"
  | "cave-bear-badge"
  | "transformer-badge";

export const ITEM_DEFINITIONS: Record<ItemId, { name: string; description: string }> = {
  "rainbow-shell": {
    name: "Rainbow Shell",
    description: "Shimmers with every color at once. Equip it to give your snail a new look.",
  },
  "knight-badge": {
    name: "Knight's Badge",
    description: "Proof you bested the knight in trial by combat.",
  },
  "toad-badge": {
    name: "Toad Badge",
    description: "A slimy trophy from the throne hall's toad.",
  },
  "cave-bear-badge": {
    name: "Cave Bear Badge",
    description: "Claimed from the bear that once ruled the cave.",
  },
  "transformer-badge": {
    name: "Transformer Badge",
    description: "Salvaged from the grounded airport transformer.",
  },
};

export const INVENTORY_KEY = "techno-inventory";
export const EQUIPPED_ITEM_KEY = "techno-equipped-item";

// Fired right after the equipped item actually changes, so any snail
// already mounted on the same page (LocationSnail, HomeSnail) can update
// its look immediately instead of only picking up the new equip on its
// next mount — localStorage writes alone don't trigger a re-render in the
// tab that made them, only in *other* tabs (via the native `storage`
// event). Same pattern as GNOME_ORBS_CHANGED_EVENT in gnomeProgress.ts.
export const EQUIPPED_ITEM_CHANGED_EVENT = "techno-equipped-item-changed";

export function readInventory(): ItemId[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(INVENTORY_KEY);
    return raw ? (JSON.parse(raw) as ItemId[]) : [];
  } catch {
    return [];
  }
}

// Idempotent — replaying a mission that grants an item you already own
// doesn't duplicate it.
export function addToInventory(id: ItemId) {
  if (typeof window === "undefined") return;
  const current = readInventory();
  if (current.includes(id)) return;
  window.localStorage.setItem(INVENTORY_KEY, JSON.stringify([...current, id]));
}

export function readEquippedItem(): ItemId | null {
  if (typeof window === "undefined") return null;
  return (window.localStorage.getItem(EQUIPPED_ITEM_KEY) as ItemId | null) || null;
}

// One equip slot for now (there's only one item to put in it) — pass null
// to unequip.
export function setEquippedItem(id: ItemId | null) {
  if (typeof window === "undefined") return;
  if (id) window.localStorage.setItem(EQUIPPED_ITEM_KEY, id);
  else window.localStorage.removeItem(EQUIPPED_ITEM_KEY);
  window.dispatchEvent(new Event(EQUIPPED_ITEM_CHANGED_EVENT));
}
