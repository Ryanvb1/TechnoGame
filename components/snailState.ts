export const SNAIL_GREETED_KEY = "techno-snail-greeted";
export const SNAIL_PLEA_VIEWED_KEY = "techno-snail-plea-viewed";

export function readSnailGreeted(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(SNAIL_GREETED_KEY) === "true";
}

export function markSnailGreeted() {
  window.localStorage.setItem(SNAIL_GREETED_KEY, "true");
}

export function readSnailPleaViewed(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(SNAIL_PLEA_VIEWED_KEY) === "true";
}

export function markSnailPleaViewed() {
  window.localStorage.setItem(SNAIL_PLEA_VIEWED_KEY, "true");
}
