export const FOOTSTEP_COLOR_KEY = "techno-footstep-color";
export const DEFAULT_FOOTSTEP_COLOR = "var(--neon)";

export function readFootstepColor(): string {
  if (typeof window === "undefined") return DEFAULT_FOOTSTEP_COLOR;
  return window.localStorage.getItem(FOOTSTEP_COLOR_KEY) || DEFAULT_FOOTSTEP_COLOR;
}
