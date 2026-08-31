// Items granted by victory chests (see VictoryScreen.tsx) — separate from
// the gnome's tube/orbs and the kiosk's rainbow balls, this is stuff you
// can actually equip in the Locker (see Locker.tsx) to change how things
// look elsewhere on the site. Boss trophies use their original persisted
// IDs for save compatibility, but are necklaces in the UI and can be worn
// by the player snail.
export type ShellItemId = "rainbow-shell" | "black-shell" | "white-shell";
export type NecklaceItemId = "knight-badge" | "toad-badge" | "cave-bear-badge" | "transformer-badge";
export type MiscItemId = "forest-chest-key";
export type ItemId = ShellItemId | NecklaceItemId | MiscItemId;

export const SHELL_ITEM_IDS: ShellItemId[] = ["rainbow-shell", "black-shell", "white-shell"];
export const NECKLACE_ITEM_IDS: NecklaceItemId[] = [
  "knight-badge",
  "toad-badge",
  "cave-bear-badge",
  "transformer-badge",
];
export const MISC_ITEM_IDS: MiscItemId[] = ["forest-chest-key"];

export const ITEM_DEFINITIONS: Record<ItemId, { name: string; description: string }> = {
  "rainbow-shell": {
    name: "Rainbow Shell",
    description: "Shimmers with every color at once. Equip it to give your snail a new look.",
  },
  "black-shell": {
    name: "Black Shell",
    description: "A deep black shell with a polished charcoal spiral.",
  },
  "white-shell": {
    name: "White Shell",
    description: "A bright porcelain-white shell with a silver spiral.",
  },
  "knight-badge": {
    name: "Knight's Necklace",
    description: "A silver pendant proving you bested the knight in trial by combat.",
  },
  "toad-badge": {
    name: "Toad Necklace",
    description: "A moss-green pendant claimed from the throne hall's toad.",
  },
  "cave-bear-badge": {
    name: "Cave Bear Necklace",
    description: "A brown pendant claimed from the bear that once ruled the cave.",
  },
  "transformer-badge": {
    name: "Transformer Necklace",
    description: "A blue pendant salvaged from the grounded airport transformer.",
  },
  "forest-chest-key": {
    name: "Forest Chest Key",
    description: "A green key taken from the cave bear. Fits the vine-locked chest in the kiosk.",
  },
};

export const INVENTORY_KEY = "techno-inventory";
export const EQUIPPED_ITEM_KEY = "techno-equipped-item";
export const EQUIPPED_SHELL_KEY = "techno-equipped-shell";
export const EQUIPPED_NECKLACE_KEY = "techno-equipped-necklace";
export const FOREST_CHEST_OPENED_KEY = "techno-forest-chest-opened";

// Fired right after the equipped item actually changes, so any snail
// already mounted on the same page (LocationSnail, HomeSnail) can update
// its look immediately instead of only picking up the new equip on its
// next mount — localStorage writes alone don't trigger a re-render in the
// tab that made them, only in *other* tabs (via the native `storage`
// event). Same pattern as GNOME_ORBS_CHANGED_EVENT in gnomeProgress.ts.
export const EQUIPPED_ITEM_CHANGED_EVENT = "techno-equipped-item-changed";

export const NECKLACE_COLORS: Record<NecklaceItemId, string> = {
  "knight-badge": "#9aa5ad",
  "toad-badge": "#7fae4a",
  "cave-bear-badge": "#8a5a2b",
  "transformer-badge": "#4dabf7",
};

// Fired right after a new item is actually added, so the Locker — if it's
// already mounted on the same page when that happens (the kiosk's own
// vine-locked chest, opened right next to it) — can pick the addition up
// immediately instead of only seeing it on its next mount. Every other
// item grant so far has happened on a different page than the Locker, so
// this gap never showed up before. Same pattern as
// GNOME_ORBS_CHANGED_EVENT/EQUIPPED_ITEM_CHANGED_EVENT.
export const INVENTORY_CHANGED_EVENT = "techno-inventory-changed";

export function readInventory(): ItemId[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(INVENTORY_KEY);
    if (!raw) return [];
    const stored = JSON.parse(raw) as unknown;
    if (!Array.isArray(stored)) return [];
    const validIds = new Set<ItemId>([
      ...SHELL_ITEM_IDS,
      ...NECKLACE_ITEM_IDS,
      ...MISC_ITEM_IDS,
    ]);
    return stored.filter((id): id is ItemId => typeof id === "string" && validIds.has(id as ItemId));
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
  window.dispatchEvent(new Event(INVENTORY_CHANGED_EVENT));
}

function isShellItem(id: ItemId | null): id is ShellItemId {
  return id !== null && SHELL_ITEM_IDS.includes(id as ShellItemId);
}

function isNecklaceItem(id: ItemId | null): id is NecklaceItemId {
  return id !== null && NECKLACE_ITEM_IDS.includes(id as NecklaceItemId);
}

function migrateLegacyEquipment() {
  if (typeof window === "undefined") return;
  const legacy = window.localStorage.getItem(EQUIPPED_ITEM_KEY) as ItemId | null;
  if (!legacy) return;
  if (isShellItem(legacy) && !window.localStorage.getItem(EQUIPPED_SHELL_KEY)) {
    window.localStorage.setItem(EQUIPPED_SHELL_KEY, legacy);
  }
  if (isNecklaceItem(legacy) && !window.localStorage.getItem(EQUIPPED_NECKLACE_KEY)) {
    window.localStorage.setItem(EQUIPPED_NECKLACE_KEY, legacy);
  }
  window.localStorage.removeItem(EQUIPPED_ITEM_KEY);
}

export function readEquippedShell(): ShellItemId | null {
  if (typeof window === "undefined") return null;
  migrateLegacyEquipment();
  const stored = window.localStorage.getItem(EQUIPPED_SHELL_KEY) as ItemId | null;
  return isShellItem(stored) ? stored : null;
}

export function readEquippedNecklace(): NecklaceItemId | null {
  if (typeof window === "undefined") return null;
  migrateLegacyEquipment();
  const stored = window.localStorage.getItem(EQUIPPED_NECKLACE_KEY) as ItemId | null;
  return isNecklaceItem(stored) ? stored : null;
}

export function setEquippedShell(id: ShellItemId | null) {
  if (typeof window === "undefined") return;
  migrateLegacyEquipment();
  if (id) window.localStorage.setItem(EQUIPPED_SHELL_KEY, id);
  else window.localStorage.removeItem(EQUIPPED_SHELL_KEY);
  window.dispatchEvent(new Event(EQUIPPED_ITEM_CHANGED_EVENT));
}

export function setEquippedNecklace(id: NecklaceItemId | null) {
  if (typeof window === "undefined") return;
  migrateLegacyEquipment();
  if (id) window.localStorage.setItem(EQUIPPED_NECKLACE_KEY, id);
  else window.localStorage.removeItem(EQUIPPED_NECKLACE_KEY);
  window.dispatchEvent(new Event(EQUIPPED_ITEM_CHANGED_EVENT));
}

export function readEquippedItem(): ItemId | null {
  return readEquippedShell() ?? readEquippedNecklace();
}

// Compatibility helper for older callers that predate separate equipment
// categories. New UI should use the category-specific setters above.
export function setEquippedItem(id: ItemId | null) {
  if (isShellItem(id) || id === null) setEquippedShell(id);
  else if (isNecklaceItem(id)) setEquippedNecklace(id);
}
