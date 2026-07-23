// Items granted by victory chests (see VictoryScreen.tsx) — separate from
// the gnome's tube/orbs and the kiosk's rainbow balls, this is stuff you
// can actually equip in the Locker (see Locker.tsx) to change how things
// look elsewhere on the site. Just the one item for now — more (and
// proper per-slot equipping, once there's more than one kind of thing to
// equip) comes later.
export type ItemId = "rainbow-shell";

export const ITEM_DEFINITIONS: Record<ItemId, { name: string; description: string }> = {
  "rainbow-shell": {
    name: "Rainbow Shell",
    description: "Shimmers with every color at once. Equip it to give your snail a new look.",
  },
};

export const INVENTORY_KEY = "techno-inventory";
export const EQUIPPED_ITEM_KEY = "techno-equipped-item";

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
}
