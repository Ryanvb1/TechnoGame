import { GNOME_STORAGE_KEY } from "./gnomeProgress";
import { TACTIC_VIEWED_KEY } from "./tacticState";
import { SNAIL_GREETED_KEY } from "./snailState";

// All the browser-local "game progress" this site tracks. Add new keys here
// as new progress mechanics are introduced so Reset stays complete.
const PROGRESS_KEYS = [GNOME_STORAGE_KEY, TACTIC_VIEWED_KEY, SNAIL_GREETED_KEY];

export function resetGameProgress() {
  for (const key of PROGRESS_KEYS) {
    window.localStorage.removeItem(key);
  }
}
