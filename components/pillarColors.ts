export const PILLAR_ROTATION_KEY = "techno-pillar-rotation";

// Shared timing for the snail/slime/fire-beam choreography — used by both
// ThroneRoomScene (which drives the actual state machine on these delays)
// and ThroneHallBackground (whose CSS transitions/animations need to run
// for the exact same durations so the visuals stay in sync with the logic).
//
// The snail's own crawl time isn't a fixed duration — ThroneRoomScene
// measures the real on-screen distance from wherever he currently is to
// the clicked pillar's base (getBoundingClientRect on both ends, since
// they live in unrelated layout containers with no shared percentage
// space) and divides by this speed, clamped to the bounds below so a
// neighboring pillar doesn't feel instant and a far corner doesn't feel
// like a wait.
export const SNAIL_SPEED_PX_PER_MS = 0.35; // ~350px/s, a deliberate crawl
export const SNAIL_MIN_TRAVEL_MS = 450;
export const SNAIL_MAX_TRAVEL_MS = 2600;
export const SLIME_DURATION_MS = 5000; // how long a laid puddle stays reflective
export const BEAM_TRAVEL_MS = 1100; // the toad's fire, mouth -> pillar base
export const REFLECT_TRAVEL_MS = 520; // reflected fire, pillar base -> mouth (snappier, it's already lit)

// Fixed semantic order — this is also the order the toad burns pillars in
// during the fight, so "index into this array" IS "burn order".
export const PILLAR_COLOR_NAMES = ["red", "orange", "yellow", "green", "blue", "purple"] as const;
export const PILLAR_COLORS = ["#e0304f", "#e8791f", "#f6c94c", "#3fae4a", "#2f6fd1", "#8a3fe0"];

export function readPillarRotation(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(window.localStorage.getItem(PILLAR_ROTATION_KEY) || "0", 10) || 0;
}

// Called when the toad fight is lost or retreated from, so the colors land
// on different physical pillars next time.
export function advancePillarRotation(): number {
  const next = (readPillarRotation() + 1) % PILLAR_COLORS.length;
  window.localStorage.setItem(PILLAR_ROTATION_KEY, String(next));
  return next;
}

// Which color sits on the pillar at a given physical position (0-5,
// enumerated nearest-row-last: [row0-left, row0-right, row1-left,
// row1-right, row2-left, row2-right]), given the current rotation offset.
export function colorForPillar(position: number, rotation: number): string {
  return PILLAR_COLORS[(position + rotation) % PILLAR_COLORS.length];
}

// The inverse: which physical pillar position currently holds a given
// color index, given the same rotation offset.
export function pillarForColor(colorIndex: number, rotation: number): number {
  const count = PILLAR_COLORS.length;
  return ((((colorIndex - rotation) % count) + count) % count);
}
