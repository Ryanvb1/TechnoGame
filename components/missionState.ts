import { readInventory } from "./inventory";

export const CAVE_BEAR_DEFEATED_KEY = "techno-cave-bear-defeated";
export const TRANSFORMER_DEFEATED_KEY = "techno-transformer-defeated";

// Inventory fallbacks migrate saves created before dedicated completion
// flags existed.
export function readCaveBearDefeated() {
  if (typeof window === "undefined") return false;
  return (
    window.localStorage.getItem(CAVE_BEAR_DEFEATED_KEY) === "true" ||
    readInventory().includes("cave-bear-badge")
  );
}

export function markCaveBearDefeated() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CAVE_BEAR_DEFEATED_KEY, "true");
}

export function readTransformerDefeated() {
  if (typeof window === "undefined") return false;
  return (
    window.localStorage.getItem(TRANSFORMER_DEFEATED_KEY) === "true" ||
    readInventory().includes("transformer-badge")
  );
}

export function markTransformerDefeated() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TRANSFORMER_DEFEATED_KEY, "true");
}
