export const RAINBOW_BALLS_KEY = "techno-rainbow-balls";
export const RAINBOW_BALLS_CHANGED_EVENT = "techno-rainbow-balls-changed";
export const MIN_DROP = 200;
export const MAX_DROP = 500;

export function readRainbowBalls(): number {
  if (typeof window === "undefined") return 0;
  const stored = window.localStorage.getItem(RAINBOW_BALLS_KEY);
  return stored ? parseInt(stored, 10) || 0 : 0;
}

export function rollRainbowBallDrop(): number {
  return MIN_DROP + Math.floor(Math.random() * (MAX_DROP - MIN_DROP + 1));
}

// Rolls a fresh drop, adds it to the running total, and returns the new
// total — the crate opener uses the return value directly rather than
// reading storage back a second time.
export function addRainbowBalls(amount: number): number {
  const next = readRainbowBalls() + amount;
  window.localStorage.setItem(RAINBOW_BALLS_KEY, String(next));
  window.dispatchEvent(new Event(RAINBOW_BALLS_CHANGED_EVENT));
  return next;
}

// Attempts to spend from the balance; returns false (and leaves the
// balance untouched) if there isn't enough.
export function spendRainbowBalls(amount: number): boolean {
  const current = readRainbowBalls();
  if (current < amount) return false;
  window.localStorage.setItem(RAINBOW_BALLS_KEY, String(current - amount));
  window.dispatchEvent(new Event(RAINBOW_BALLS_CHANGED_EVENT));
  return true;
}
