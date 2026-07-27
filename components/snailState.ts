export const SNAIL_GREETED_KEY = "techno-snail-greeted";
export const SNAIL_PLEA_VIEWED_KEY = "techno-snail-plea-viewed";
export const SNAIL_RESCUED_KEY = "techno-snail-rescued";
export const SNAIL_PULL_PROGRESS_KEY = "techno-snail-pull-progress";

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

// Whether the rope-pull mini-game (see SnailRescueRope) has been completed.
// This is now the single source of truth for "has the snail been saved" —
// it used to be inferred from the unrelated gnome-orb count, which is why
// Knight/HomeSnail/SectionShell previously imported gnomeProgress instead.
export function readSnailRescued(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(SNAIL_RESCUED_KEY) === "true";
}

export function markSnailRescued() {
  window.localStorage.setItem(SNAIL_RESCUED_KEY, "true");
}

// Partial pull progress (0-100), persisted so a half-finished rescue isn't
// lost just by navigating away from the page.
export function readSnailPullProgress(): number {
  if (typeof window === "undefined") return 0;
  const stored = window.localStorage.getItem(SNAIL_PULL_PROGRESS_KEY);
  const parsed = stored ? parseFloat(stored) : 0;
  return Number.isFinite(parsed) ? Math.min(100, Math.max(0, parsed)) : 0;
}

export function writeSnailPullProgress(value: number) {
  window.localStorage.setItem(SNAIL_PULL_PROGRESS_KEY, String(value));
}

const SNAIL_LOCATION_COMMENT_PREFIX = "techno-snail-location-";

// Whether the companion snail (see LocationSnail) has already made his
// one-off remark about a given location — keyed per-pathname so each
// place only gets commented on once, same idea as SNAIL_GREETED_KEY but
// per-location instead of a single global flag.
export function readSnailLocationCommented(locationId: string): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(SNAIL_LOCATION_COMMENT_PREFIX + locationId) === "true";
}

export function markSnailLocationCommented(locationId: string) {
  window.localStorage.setItem(SNAIL_LOCATION_COMMENT_PREFIX + locationId, "true");
}
