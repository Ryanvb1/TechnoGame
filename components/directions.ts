export type Direction = "up" | "down" | "left" | "right";

export const ARROW_CLIP_PATH: Record<Direction, string> = {
  up: "polygon(50% 0%, 0% 100%, 100% 100%)",
  down: "polygon(0% 0%, 100% 0%, 50% 100%)",
  left: "polygon(0% 50%, 100% 0%, 100% 100%)",
  right: "polygon(0% 0%, 100% 50%, 0% 100%)",
};
