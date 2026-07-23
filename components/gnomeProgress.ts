export const GNOME_MAX_ORBS = 4;
export const GNOME_STORAGE_KEY = "techno-gnome-progress";

export function readGnomeOrbs() {
  if (typeof window === "undefined") return 0;
  const stored = window.localStorage.getItem(GNOME_STORAGE_KEY);
  return stored ? Math.min(GNOME_MAX_ORBS, parseInt(stored, 10) || 0) : 0;
}

// The hidden collectible orbs (see CollectibleOrb.tsx), one placed on each
// of the site's roamable scenes that's actually reachable the moment the
// mission starts. Deliberately excludes the Throne Room — it only unlocks
// once the gnome's tube is already full, so an orb placed there would be
// uncollectable until after the tube it's meant to help fill is maxed out.
// They're a second, exploration-driven way to fill the exact same tube the
// gnome's daily check-in does — not a separate counter — hence
// GNOME_MAX_ORBS also being the orb count.
export const ORB_IDS = ["hub", "pit", "fairyland", "kiosk"] as const;
export type OrbId = (typeof ORB_IDS)[number];

export function orbCollectedKey(id: OrbId) {
  return `techno-orb-collected-${id}`;
}

export function readOrbCollected(id: OrbId): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(orbCollectedKey(id)) === "true";
}

export function readOrbsCollectedCount(): number {
  if (typeof window === "undefined") return 0;
  return ORB_IDS.filter(readOrbCollected).length;
}

// Fired right after an orb is actually recorded as collected, so any
// already-mounted gnome tube on the same page (Gnome.tsx) can top itself
// up immediately instead of only picking up the new count on its next
// mount — localStorage writes alone don't trigger a re-render in the tab
// that made them, only in *other* tabs (via the native `storage` event).
export const GNOME_ORBS_CHANGED_EVENT = "techno-gnome-orbs-changed";

// Each orb can only ever count once, and — same as a check-in — collecting
// one past a full tube is a no-op rather than overshooting it.
export function collectOrb(id: OrbId) {
  if (typeof window === "undefined" || readOrbCollected(id)) return;
  window.localStorage.setItem(orbCollectedKey(id), "true");
  const next = Math.min(GNOME_MAX_ORBS, readGnomeOrbs() + 1);
  window.localStorage.setItem(GNOME_STORAGE_KEY, String(next));
  window.dispatchEvent(new Event(GNOME_ORBS_CHANGED_EVENT));
}

// The "Collect Orbs" bounty behaves like every other mission on the site —
// gated behind its own start screen (see Gnome.tsx) — rather than having
// its five pickups just permanently scattered across every scene. Orbs
// only render once this is set.
export const ORB_MISSION_STARTED_KEY = "techno-orb-mission-started";

export function readOrbMissionStarted(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ORB_MISSION_STARTED_KEY) === "true";
}

export function startOrbMission() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ORB_MISSION_STARTED_KEY, "true");
}

// Collecting the last orb isn't enough on its own — the bounty only
// actually completes (and shows its victory screen) once you bring the
// find back to the gnome in person. This tracks that hand-in separately
// from the orbs themselves, so it only ever happens once.
export const ORB_MISSION_COMPLETED_KEY = "techno-orb-mission-completed";

export function readOrbMissionCompleted(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ORB_MISSION_COMPLETED_KEY) === "true";
}

export function completeOrbMission() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ORB_MISSION_COMPLETED_KEY, "true");
}
