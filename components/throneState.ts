import { addToInventory } from "./inventory";

export const KNIGHT_DEFEATED_KEY = "techno-knight-defeated";
export const TOAD_DEFEATED_KEY = "techno-toad-defeated";

// Shared by every path that can complete the knight fight: the real fight
// and its instant-complete shortcuts. VictoryScreen grants the rarity-based
// rainbow-ball payout centrally when the reward chest opens.
export function grantKnightVictoryLoot() {
  addToInventory("knight-badge");
}

export function readKnightDefeated(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KNIGHT_DEFEATED_KEY) === "true";
}

export function markKnightDefeated() {
  window.localStorage.setItem(KNIGHT_DEFEATED_KEY, "true");
}

export function readToadDefeated(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(TOAD_DEFEATED_KEY) === "true";
}

export function markToadDefeated() {
  window.localStorage.setItem(TOAD_DEFEATED_KEY, "true");
}
