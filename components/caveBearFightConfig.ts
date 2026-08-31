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
// One hit, no combo — reverted back from a briefly-tried 3-strike burst.
export const SCRATCH_DAMAGE = 75;
export const ROAR_DAMAGE = 100;
// The bow is always fully drawn — one click, one shot, no charge tradeoff
// — so there's a single damage value rather than a charged/quick split.
// Each clean hit removes exactly one third of the bear's maximum health,
// so three hits defeat him from full health.
export const BOW_SHOT_DAMAGE = MAX_BEAR_HEALTH / 3;

// Survival Phase timing
// Falling Panels: reveal shows the plates one at a time, then the player
// must recite the order on the 1.5s-per-check clock the user specified.
// Only 4 of the 6 plates are drawn into the sequence each time (not every
// one) — a fresh random subset in a fresh random order.
export const PANELS_SEQUENCE_LENGTH = 4;
export const PANELS_REVEAL_LIT_MS = 500; // how long each plate glows during reveal
export const PANELS_REVEAL_GAP_MS = 250; // unlit gap before the next reveal
export const PANELS_CHECK_INTERVAL_MS = 1500; // spec-mandated: 1.5s per recite check
export const PANELS_RESULT_HOLD_MS = 450; // how long the green flash / lava-fall plays before advancing
export const SCRATCH_RESOLVE_FLASH_MS = 720; // full articulated wind-up, extension, contact, and follow-through
// Reverted to a single strike per Scratch instance (a 3-rapid-strikes
// combo was tried and didn't stick) — one check against the player's
// position, once.
export const SCRATCH_STRIKE_COUNT = 1;
export const SCRATCH_STRIKE_INTERVAL_MS = 800; // how long the strike's flash/claw marks hold before resolving
export const SCRATCH_FOLLOWUP_DELAY_MS = 600;
// The rocks now complete their fall 0.15s faster than the previous 1.2s.
export const ROAR_TELEGRAPH_MS = 1050;
export const ROAR_RESOLVE_FLASH_MS = 400;
// Each Roar chooses a fresh count in this inclusive range.
export const ROAR_WAVE_MIN = 2;
export const ROAR_WAVE_MAX = 4;
export const INTER_ATTACK_DELAY_MS = 4000; // spec-mandated gap between attacks
export const INITIAL_ATTACK_DELAY_MS = 4000;
// Spec-mandated: after the Damage Phase hands back to the Survival Phase,
// the bear waits this long before its next attack can start.
export const POST_DAMAGE_PHASE_COOLDOWN_MS = 5000;
export const ATTACKS_PER_SURVIVAL_PHASE = 3;

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
