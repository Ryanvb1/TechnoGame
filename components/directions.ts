export type Direction = "up" | "down" | "left" | "right";

export const ARROW_CLIP_PATH: Record<Direction, string> = {
  up: "polygon(50% 0%, 0% 100%, 100% 100%)",
  down: "polygon(0% 0%, 100% 0%, 50% 100%)",
  left: "polygon(0% 50%, 100% 0%, 100% 100%)",
  right: "polygon(0% 0%, 100% 50%, 0% 100%)",
};

// Which screen axis a direction travels along, and which way on that axis.
export const DIRECTION_AXIS: Record<Direction, "x" | "y"> = {
  up: "y",
  down: "y",
  left: "x",
  right: "x",
};

export const DIRECTION_SIGN: Record<Direction, 1 | -1> = {
  up: -1,
  down: 1,
  left: -1,
  right: 1,
};
