// Every tunable number for the Cave Bear fight in one place, shared by
// CaveBearFight and both phase hooks — same reason FightScene keeps its
// MAX_HEALTH/arena-percentage constants near its top, just pulled into its
// own file since this fight is split across several small ones instead of
// living in one big component.

// 300 divides cleanly into every damage fraction the design calls for:
// 50% (Falling Panels) -> 150, 33% (Roar / Charged Throw) -> ~100, 25%
// (Scratch) -> 75, 20% (Quick Throw) -> 60.
export const MAX_PLAYER_HEALTH = 300;
export const MAX_BEAR_HEALTH = 300;

// Falling Panels replaced Body Slam outright (same damage value carried
// over) — one miss on the recite check costs as much as the old slam did.
export const PANELS_DAMAGE = 150;
// Per strike, not per Scratch instance — a full 3-strike combo that lands
// every hit costs 225, well above the old single-strike total.
export const SCRATCH_DAMAGE = 75;
export const ROAR_DAMAGE = 100;
// The bow is always fully drawn — one click, one shot, no charge tradeoff
// — so there's a single damage value rather than a charged/quick split.
// Set to 1/5 (20%) of the bear's own health per the user, i.e. the "Quick
// Throw" fraction from the comment above — 5 clean hits to defeat him.
export const BOW_SHOT_DAMAGE = 60;

// Survival Phase timing
// Falling Panels: reveal shows the plates one at a time, then the player
// must recite the order on the 1.5s-per-check clock the user specified.
export const PANELS_REVEAL_LIT_MS = 500; // how long each plate glows during reveal
export const PANELS_REVEAL_GAP_MS = 250; // unlit gap before the next reveal
export const PANELS_CHECK_INTERVAL_MS = 1500; // spec-mandated: 1.5s per recite check
export const PANELS_RESULT_HOLD_MS = 450; // how long the green flash / lava-fall plays before advancing
export const SCRATCH_RESOLVE_FLASH_MS = 350; // no telegraph, per spec — just long enough to read
// Spec-mandated: one Scratch instance is 3 rapid strikes, not one, each
// independently checking the player's position 0.8s apart — so a player
// can dodge into the lit column mid-combo and only eat some of the hits.
export const SCRATCH_STRIKE_COUNT = 3;
export const SCRATCH_STRIKE_INTERVAL_MS = 800;
export const ROAR_TELEGRAPH_MS = 1200; // spec-mandated warning window
export const ROAR_RESOLVE_FLASH_MS = 400;
export const INTER_ATTACK_DELAY_MS = 4000; // spec-mandated gap between attacks
// Spec-mandated: after the Damage Phase hands back to the Survival Phase,
// the bear waits this long before its next attack can start.
export const POST_DAMAGE_PHASE_COOLDOWN_MS = 5000;
export const ATTACKS_PER_SURVIVAL_PHASE = 3;

// Torch
export const TORCH_SWITCH_INTERVAL_MS = 8000; // spec-mandated

// Player movement
export const JUMP_AIRBORNE_MS = 550; // must safely straddle a Body Slam resolve when timed well

// Damage Phase
export const DAMAGE_PHASE_TIMEOUT_MS = 10000; // spec-mandated
export const THROW_ANIM_MS = 500;
export const DRIFT_RETARGET_MIN_MS = 900;
export const DRIFT_RETARGET_MAX_MS = 1700;
export const DRIFT_MIN_PCT = 18;
export const DRIFT_MAX_PCT = 82;
export const BOW_HIT_RADIUS_PCT = 9;

// Misc
export const VICTORY_DELAY_MS = 750; // lets the killing throw's animation read before VictoryScreen covers it
