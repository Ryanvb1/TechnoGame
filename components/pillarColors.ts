export const PILLAR_ROTATION_KEY = "techno-pillar-rotation";

// Shared with the "pillar-climb" CSS animation in globals.css and the
// snail-climb div's inline duration in ThroneHallBackground.tsx, so the
// fight logic marks a pillar "saved" exactly when the climb animation
// visually finishes.
export const PILLAR_CLIMB_MS = 900;

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
