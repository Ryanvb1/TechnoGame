export const FOOTSTEP_COLOR_KEY = "techno-footstep-color";
export const DEFAULT_FOOTSTEP_COLOR = "var(--neon)";

export type FootstepColorOption = {
  name: string;
  value: string;
  price: number;
};

// Sold in the kiosk's vending machine — buying one re-dyes every footstep
// print site-wide (the hub transitions, the throne approach) until you
// buy a different one.
export const FOOTSTEP_COLOR_OPTIONS: FootstepColorOption[] = [
  { name: "Crimson Steps", value: "#ff4d4d", price: 600 },
  { name: "Azure Steps", value: "#4dabf7", price: 600 },
  { name: "Violet Steps", value: "#a374ff", price: 600 },
  { name: "Gold Steps", value: "#ffd24d", price: 600 },
];

export function readFootstepColor(): string {
  if (typeof window === "undefined") return DEFAULT_FOOTSTEP_COLOR;
  return window.localStorage.getItem(FOOTSTEP_COLOR_KEY) || DEFAULT_FOOTSTEP_COLOR;
}

export function setFootstepColor(value: string) {
  window.localStorage.setItem(FOOTSTEP_COLOR_KEY, value);
}
