export const KNIGHT_DEFEATED_KEY = "techno-knight-defeated";

export function readKnightDefeated(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KNIGHT_DEFEATED_KEY) === "true";
}

export function markKnightDefeated() {
  window.localStorage.setItem(KNIGHT_DEFEATED_KEY, "true");
}
