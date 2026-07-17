export const GNOME_MAX_ORBS = 5;
export const GNOME_STORAGE_KEY = "techno-gnome-progress";

export function readGnomeOrbs() {
  if (typeof window === "undefined") return 0;
  const stored = window.localStorage.getItem(GNOME_STORAGE_KEY);
  return stored ? Math.min(GNOME_MAX_ORBS, parseInt(stored, 10) || 0) : 0;
}
