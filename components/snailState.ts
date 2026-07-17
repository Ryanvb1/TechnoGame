export const SNAIL_GREETED_KEY = "techno-snail-greeted";

export function readSnailGreeted(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(SNAIL_GREETED_KEY) === "true";
}

export function markSnailGreeted() {
  window.localStorage.setItem(SNAIL_GREETED_KEY, "true");
}
