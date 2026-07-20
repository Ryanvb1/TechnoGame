import { DIRECTION_AXIS, DIRECTION_SIGN, type Direction } from "./directions";
import { FootprintIcon } from "./FootprintIcon";
import { readFootstepColor } from "./footstepColor";

export type TravelPhase = "idle" | "leaving" | "arriving";

// Walking off the edge of the old page: a short, tight cluster of strides
// hugging the exit wall (not stretching back toward the center of the screen).
export const LEAVE_MS = 850;
const LEAVE_COUNT = 5;
const LEAVE_STEP_DURATION_MS = 420;
const LEAVE_PROGRESS_START = 0.72; // 0 = center, 1 = wall; prints only occupy this last stretch

// A couple of short strides continuing in from the entry wall, then settling.
export const ARRIVE_MS = 550;
const ARRIVE_COUNT = 3;
const ARRIVE_STEP_DURATION_MS = 360;
const ARRIVE_MAX_PROGRESS = 0.16;

const STEP_OFFSET = 8; // px each print alternates side to side (left/right foot)
// Shifts the whole trail off the screen's dead-center line, so it never walks
// through the hub graphic, a page title, or the wall-mounted back arrow —
// all of which sit right on that center line.
const LANE_OFFSET_PERCENT = 16;

// Foot points "up" by default; rotated to match the direction of travel.
const ROTATION: Record<Direction, number> = {
  up: 0,
  down: 180,
  left: -90,
  right: 90,
};

export function FootstepTrail({
  direction,
  phase,
}: {
  direction: Direction;
  phase: TravelPhase;
}) {
  if (phase === "idle") return null;

  const color = readFootstepColor();
  const axis = DIRECTION_AXIS[direction];
  const sign = DIRECTION_SIGN[direction];
  const isLeaving = phase === "leaving";

  const count = isLeaving ? LEAVE_COUNT : ARRIVE_COUNT;
  const totalMs = isLeaving ? LEAVE_MS : ARRIVE_MS;
  const stepDuration = isLeaving ? LEAVE_STEP_DURATION_MS : ARRIVE_STEP_DURATION_MS;
  const stagger = totalMs / count;
  // Leaving starts at screen center (50) and walks out to the exit wall (0 or 100).
  // Arriving starts at the opposite wall (the one facing the exit wall) and
  // continues a short way inward, as if stepping through from the other side.
  const edgeStart = isLeaving ? 50 : 50 - sign * 50;

  return (
    <div
      key={`${direction}-${phase}`}
      className="pointer-events-none fixed inset-0 z-50"
    >
      {Array.from({ length: count }).map((_, i) => {
        const progress = isLeaving
          ? LEAVE_PROGRESS_START + (i / (LEAVE_COUNT - 1)) * (1 - LEAVE_PROGRESS_START)
          : (i / (ARRIVE_COUNT - 1)) * ARRIVE_MAX_PROGRESS;
        const pos = edgeStart + sign * progress * 50;
        const lane = 50 + LANE_OFFSET_PERCENT;
        const perp = (i % 2 === 0 ? -1 : 1) * STEP_OFFSET;
        const topPercent = axis === "y" ? pos : lane;
        const leftPercent = axis === "x" ? pos : lane;
        const perpX = axis === "y" ? perp : 0;
        const perpY = axis === "x" ? perp : 0;
        const delay = i * stagger;

        return (
          <div
            key={i}
            className="absolute"
            style={{
              top: `${topPercent}%`,
              left: `${leftPercent}%`,
              transform: `translate(-50%, -50%) translate(${perpX}px, ${perpY}px) rotate(${ROTATION[direction]}deg)`,
            }}
          >
            <div
              style={{
                animation: `footstep-fade ${stepDuration}ms ease-out ${delay}ms both`,
              }}
            >
              <FootprintIcon color={color} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
