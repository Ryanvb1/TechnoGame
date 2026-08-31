// Cave access remains purchasable in the kiosk. The airport is presented
// as unavailable in this version and intentionally has no access key.
export const CAVE_ACCESS_KEY = "techno-cave-access";

export function readCaveUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(CAVE_ACCESS_KEY) === "true";
}

export function unlockCave() {
  window.localStorage.setItem(CAVE_ACCESS_KEY, "true");
}
