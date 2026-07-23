// Purchasable in the kiosk's vending machine (see VendingMachine.tsx) —
// buying one doesn't unlock a destination yet (there's nothing built
// behind the Cave/Airport props on the hub yet), just marks that this
// particular prop has been paid for, so it can read differently from the
// still-locked default once it has been.
export const AIRPORT_ACCESS_KEY = "techno-airport-access";
export const CAVE_ACCESS_KEY = "techno-cave-access";

export function readAirportUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(AIRPORT_ACCESS_KEY) === "true";
}

export function unlockAirport() {
  window.localStorage.setItem(AIRPORT_ACCESS_KEY, "true");
}

export function readCaveUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(CAVE_ACCESS_KEY) === "true";
}

export function unlockCave() {
  window.localStorage.setItem(CAVE_ACCESS_KEY, "true");
}
