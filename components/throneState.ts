import { addToInventory } from "./inventory";
import { addRainbowBalls } from "./rainbowBalls";

export const KNIGHT_DEFEATED_KEY = "techno-knight-defeated";
export const TOAD_DEFEATED_KEY = "techno-toad-defeated";

// Flat, generous drop for actually beating him (vs. the crate's randomized
// 200-500 roll, see rainbowBalls.ts) — every win re-grants it, same as the
// crate, since replaying the fight is meant to stay worth doing.
export const KNIGHT_BALL_DROP = 400;

// Shared by every path that can complete the knight fight — the real fight
// (FightScene's own victory chest) and both insta-complete shortcuts
// (Knight.tsx / KnightReplayTrigger, which don't route through that chest)
// — so all three grant identical loot rather than the shortcuts silently
// skipping it.
export function grantKnightVictoryLoot() {
  addToInventory("knight-badge");
  addRainbowBalls(KNIGHT_BALL_DROP);
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
