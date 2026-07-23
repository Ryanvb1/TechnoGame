import {
  GNOME_STORAGE_KEY,
  ORB_IDS,
  ORB_MISSION_COMPLETED_KEY,
  ORB_MISSION_STARTED_KEY,
  orbCollectedKey,
} from "./gnomeProgress";
import { TACTIC_VIEWED_KEY } from "./tacticState";
import {
  SNAIL_GREETED_KEY,
  SNAIL_PLEA_VIEWED_KEY,
  SNAIL_PULL_PROGRESS_KEY,
  SNAIL_RESCUED_KEY,
} from "./snailState";
import { KNIGHT_DEFEATED_KEY } from "./throneState";
import { RAINBOW_BALLS_KEY } from "./rainbowBalls";
import { FOOTSTEP_COLOR_KEY } from "./footstepColor";
import { AIRPORT_ACCESS_KEY, CAVE_ACCESS_KEY } from "./siteAccess";
import { EQUIPPED_ITEM_KEY, INVENTORY_KEY } from "./inventory";

// All the browser-local "game progress" this site tracks. Add new keys here
// as new progress mechanics are introduced so Reset stays complete.
const PROGRESS_KEYS = [
  GNOME_STORAGE_KEY,
  TACTIC_VIEWED_KEY,
  SNAIL_GREETED_KEY,
  SNAIL_PLEA_VIEWED_KEY,
  SNAIL_RESCUED_KEY,
  SNAIL_PULL_PROGRESS_KEY,
  KNIGHT_DEFEATED_KEY,
  RAINBOW_BALLS_KEY,
  FOOTSTEP_COLOR_KEY,
  ORB_MISSION_STARTED_KEY,
  ORB_MISSION_COMPLETED_KEY,
  ...ORB_IDS.map(orbCollectedKey),
  AIRPORT_ACCESS_KEY,
  CAVE_ACCESS_KEY,
  INVENTORY_KEY,
  EQUIPPED_ITEM_KEY,
];

export function resetGameProgress() {
  for (const key of PROGRESS_KEYS) {
    window.localStorage.removeItem(key);
  }
}
