export const TACTIC_VIEWED_KEY = "techno-tactic-viewed";

export function readTacticViewed(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(TACTIC_VIEWED_KEY) === "true";
}

export function markTacticViewed() {
  window.localStorage.setItem(TACTIC_VIEWED_KEY, "true");
}
