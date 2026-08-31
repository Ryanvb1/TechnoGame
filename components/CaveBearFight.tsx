"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { CaveBear, type CaveBearAction, type ScratchLean } from "./CaveBear";
import { CaveBearArenaGrid } from "./CaveBearArenaGrid";
import { CaveBearSpearAim } from "./CaveBearSpearAim";
import { CaveBearHealthBars } from "./CaveBearHealthBars";
import { useCaveBearSurvivalPhase } from "./useCaveBearSurvivalPhase";
import { useCaveBearDamagePhase } from "./useCaveBearDamagePhase";
import { useSnailCosmetics } from "./useSnailCosmetics";
import { useCaveBearControls } from "./caveBearInput";
import { useHideCompanionSnail } from "./companionSnail";
import { DefeatProgressBar } from "./DefeatProgressBar";
import { useSoundEffects } from "./MusicProvider";
import { clampColumn, clampRow, type Quadrant } from "./caveBearGrid";
import {
  INITIAL_ATTACK_DELAY_MS,
  JUMP_AIRBORNE_MS,
  MAX_BEAR_HEALTH,
  MAX_PLAYER_HEALTH,
  POST_DAMAGE_PHASE_COOLDOWN_MS,
  VICTORY_DELAY_MS,
} from "./caveBearFightConfig";

type Stage = "survival" | "damage" | "won" | "lost";

const START_QUADRANT: Quadrant = { row: 1, col: 1 };

// Owns the whole Cave Bear encounter once CaveScene commits to it — health,
// stage, player position — and wires the two phase hooks + input hook
// together. Mounts <CaveBear> itself (rather than CaveScene's own always-on
// button) so it can transform it for the Body Slam windup and the Damage
// Phase drift.
export function CaveBearFight({
  floorRef,
  onVictory,
  onRetreat,
}: {
  // CaveBackground's floor-content-slot ref, forwarded down through
  // CaveScene — the survival phase's quadrant grid portals straight into
  // it so the quadrants are a real subdivision of that floor, not a
  // separate flat panel.
  floorRef: RefObject<HTMLDivElement | null>;
  onVictory: () => void;
  onRetreat: () => void;
}) {
  const cosmetics = useSnailCosmetics();
  const playSound = useSoundEffects();
  useHideCompanionSnail(true);

  // The ref is populated by CaveBackground once it mounts (a sibling
  // rendered before this component in CaveScene's JSX, so it's already
  // committed by the time this effect runs) — mirrored into state since a
  // ref mutation alone wouldn't trigger the re-render needed to start
  // portaling into it.
  const [floorSlot, setFloorSlot] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    setFloorSlot(floorRef.current);
  }, [floorRef]);

  const [stage, setStage] = useState<Stage>("survival");
  const [playerHealth, setPlayerHealth] = useState(MAX_PLAYER_HEALTH);
  const [bearHealth, setBearHealth] = useState(MAX_BEAR_HEALTH);
  const [playerQuadrant, setPlayerQuadrant] = useState<Quadrant>(START_QUADRANT);
  const [jumping, setJumping] = useState(false);

  const playerQuadrantRef = useRef<Quadrant>(START_QUADRANT);
  const jumpingRef = useRef(false);
  const jumpTimerRef = useRef<number | undefined>(undefined);
  const arenaRef = useRef<HTMLDivElement>(null);
  // Whether the Survival Phase we're about to (re-)enter follows a Damage
  // Phase — true for every re-entry (the only way back into Survival, per
  // the Stage state machine), false for the fight's very first Survival
  // Phase and after Fight Again. Read by useCaveBearSurvivalPhase to apply
  // the 5s post-Damage-Phase cooldown; state (not a ref) since it's read
  // during render.
  const [cameFromDamagePhase, setCameFromDamagePhase] = useState(false);

  useEffect(() => {
    playerQuadrantRef.current = playerQuadrant;
  }, [playerQuadrant]);
  useEffect(() => {
    jumpingRef.current = jumping;
  }, [jumping]);
  useEffect(() => () => window.clearTimeout(jumpTimerRef.current), []);

  // Win/loss transitions are decided right where the damage lands (same
  // idiom as FightScene's setPlayerHealth/setKnightHealth updaters), not
  // via a separate effect watching health — a bare effect synchronously
  // calling setState in reaction to a value change is exactly what this
  // project's lint config flags.
  const applyPlayerDamage = useCallback((amount: number) => {
    playSound("player-hit");
    setPlayerHealth((h) => {
      const next = Math.max(0, h - amount);
      if (next <= 0) setStage((s) => (s === "won" ? s : "lost"));
      return next;
    });
  }, [playSound]);
  const applyBearDamage = useCallback(
    (amount: number) => {
      if (amount <= 0) return;
      playSound("enemy-hit");
      setBearHealth((h) => {
        const next = Math.max(0, h - amount);
        if (next <= 0) {
          setStage((s) => (s === "lost" ? s : "won"));
          // Lets the killing throw's own animation read before CaveScene's
          // VictoryScreen covers the screen.
          window.setTimeout(onVictory, VICTORY_DELAY_MS);
        }
        return next;
      });
    },
    [onVictory, playSound],
  );

  const handleMoveCol = useCallback((delta: -1 | 1) => {
    setPlayerQuadrant((q) => ({ ...q, col: clampColumn(q.col + delta) }));
  }, []);
  const handleMoveRow = useCallback((delta: -1 | 1) => {
    setPlayerQuadrant((q) => ({ ...q, row: clampRow(q.row + delta) }));
  }, []);
  const handleJump = useCallback(() => {
    if (jumpingRef.current) return;
    playSound("jump");
    setJumping(true);
    jumpTimerRef.current = window.setTimeout(() => setJumping(false), JUMP_AIRBORNE_MS);
  }, [playSound]);

  useCaveBearControls({ enabled: stage === "survival", onMoveCol: handleMoveCol, onMoveRow: handleMoveRow, onJump: handleJump });

  const { activeAttack, litColumn } = useCaveBearSurvivalPhase({
    active: stage === "survival",
    playerQuadrantRef,
    startDelayMs: cameFromDamagePhase ? POST_DAMAGE_PHASE_COOLDOWN_MS : INITIAL_ATTACK_DELAY_MS,
    onDamage: applyPlayerDamage,
    // Guarded: applyPlayerDamage may have already moved the stage on to
    // "lost" by the time this fires (the effect's own cleanup — triggered
    // by "active" flipping false — clears its timers first regardless, but
    // this stays defensive/symmetric with the damage-phase guard below).
    onComplete: () => setStage((s) => (s === "survival" ? "damage" : s)),
  });

  const { bearDriftX, aimX, shot, handlePointerMove, handleShoot } = useCaveBearDamagePhase({
    active: stage === "damage",
    arenaRef,
    onDamage: applyBearDamage,
    // Same guard — the killing throw's onDamage call flips bearHealth to
    // 0 (and stage to "won") well before this THROW_ANIM_MS-later
    // callback fires; without the guard it would clobber "won" back to
    // "survival". Also flips cameFromDamagePhase so the Survival Phase this
    // hands off to applies the 5s cooldown before its first attack — safe
    // to set unconditionally even when the guard above no-ops, since a
    // "won" stage means the Survival Phase hook stays inactive regardless.
    onComplete: () => {
      setStage((s) => (s === "damage" ? "survival" : s));
      setCameFromDamagePhase(true);
    },
  });

  const previousStageRef = useRef<Stage>("survival");
  useEffect(() => {
    if (previousStageRef.current === stage) return;
    previousStageRef.current = stage;
    if (stage === "won") playSound("victory");
    if (stage === "lost") playSound("defeat");
    if (stage === "damage") playSound("boss-roar");
  }, [playSound, stage]);

  useEffect(() => {
    if (!activeAttack) return;
    if (activeAttack.kind === "scratch") playSound("impact");
    if (activeAttack.kind === "roar") playSound(activeAttack.stage === "telegraph" ? "boss-roar" : "impact");
    if (activeAttack.kind === "panels" && activeAttack.stage === "reveal" && activeAttack.litQuadrant) playSound("plate");
  }, [activeAttack, playSound]);

  useEffect(() => {
    if (!shot) return;
    playSound("throw");
  }, [playSound, shot]);

  function resetFight() {
    setCameFromDamagePhase(false);
    setPlayerHealth(MAX_PLAYER_HEALTH);
    setBearHealth(MAX_BEAR_HEALTH);
    setPlayerQuadrant(START_QUADRANT);
    playerQuadrantRef.current = START_QUADRANT;
    setJumping(false);
    setStage("survival");
  }

  // Drives CaveBear's own pose/animation — the scratch's arm swipe, roar's
  // rear-back + resolve, and a gentle idle sway while he drifts in the
  // Damage Phase. Falling Panels is a floor-only mechanic (nothing for the
  // bear's body to physically do), so it just leaves him idle like the
  // gaps between attacks.
  const bearAction: CaveBearAction =
    stage === "damage"
      ? "damage-idle"
      : !activeAttack || activeAttack.kind === "panels"
        ? "idle"
        : activeAttack.kind === "scratch"
          ? "scratch"
          : activeAttack.stage === "telegraph"
            ? "roar-telegraph"
            : "roar-resolve";

  // Which side of the floor a Scratch actually rakes — away from the lit
  // (safe) column, so the bear's own lean/reach points toward the columns
  // really getting clawed instead of a fixed generic motion.
  const scratchLean: ScratchLean = litColumn === 0 ? "right" : litColumn === 2 ? "left" : "center";

  // Which of the 3 rapid strikes in a live Scratch this is — forwarded to
  // CaveBear so it can replay the arm swipe for each one.
  const scratchStrike = activeAttack?.kind === "scratch" ? activeAttack.strike : 0;

  // Rattles this whole panel (health bars, bear, everything) in sync with
  // the same instant the floor-embedded arena grid shakes (see its own
  // identical condition) — set directly on this always-mounted root so
  // toggling the animation string restarts it cleanly with no key tricks.
  const shaking = activeAttack?.kind === "roar" && activeAttack.stage === "resolve";

  return (
    <div
      className="relative flex w-full flex-col items-center gap-4"
      style={{ animation: shaking ? "roar-screen-shake 450ms ease-in-out" : "none" }}
    >
      {stage !== "lost" && <CaveBearHealthBars playerHealth={playerHealth} bearHealth={bearHealth} />}

      <div ref={arenaRef} className="relative flex w-full max-w-md flex-col items-center gap-3 sm:max-w-lg">
        {stage !== "lost" && (
          <div
            className="relative z-20 flex justify-center transition-transform duration-300 ease-out"
            style={{
              transform:
                stage === "damage"
                  ? `translateX(${bearDriftX - 50}%) scale(1.1)`
                  : activeAttack?.kind === "scratch"
                    ? "translateY(58px) scale(1.78)"
                    : "translateY(34px) scale(1.55)",
              transformOrigin: "50% 100%",
            }}
          >
            <CaveBear phase="enraged" action={bearAction} scale={1} scratchLean={scratchLean} scratchStrike={scratchStrike} />
          </div>
        )}

        {stage === "damage" && (
          <div
            className="relative h-36 w-full cursor-crosshair touch-none select-none border border-neon-dim/30"
            onPointerMove={handlePointerMove}
          >
            <CaveBearSpearAim bearDriftX={bearDriftX} aimX={aimX} shot={shot} onShoot={handleShoot} />
          </div>
        )}
      </div>

      {stage === "survival" &&
        floorSlot &&
        createPortal(
          <CaveBearArenaGrid
            playerQuadrant={playerQuadrant}
            jumping={jumping}
            litColumn={litColumn}
            activeAttack={activeAttack}
            cosmetics={cosmetics}
          />,
          floorSlot,
        )}

      {stage === "survival" && activeAttack?.kind === "panels" && (
        <p className="relative z-30 mt-10 animate-[fire-glow-pulse_1.2s_ease-in-out_infinite] text-center text-[0.6rem] uppercase tracking-[0.2em] text-neon sm:mt-12">
          {activeAttack.stage === "reveal" ? "Watch the order the plates light up..." : "Recite the order — get to the next plate!"}
        </p>
      )}
      {stage === "survival" && activeAttack?.kind !== "panels" && (
        <p className="relative z-30 mt-10 text-center text-[0.6rem] uppercase tracking-[0.2em] text-foreground/50 sm:mt-12">
          WASD to move &middot; Space to jump &middot; stay clear of the lit column&apos;s opposite side
        </p>
      )}
      {stage === "damage" && (
        <p className="animate-[fire-glow-pulse_1.2s_ease-in-out_infinite] text-center text-[0.6rem] uppercase tracking-[0.2em] text-neon">
          Aim &middot; click the bow to fire
        </p>
      )}

      {(stage === "survival" || stage === "damage") && (
        <button
          onClick={onRetreat}
          className="touch-manipulation text-[0.55rem] uppercase tracking-[0.2em] text-foreground/30 transition-colors hover:text-foreground/60"
        >
          Retreat
        </button>
      )}

      {stage === "lost" && (
        <div className="flex flex-col items-center gap-4">
          <p className="animate-[defeat-flicker_1.4s_ease-in-out] text-lg uppercase tracking-[0.3em] text-neon">You have fallen.</p>
          <DefeatProgressBar percent={((MAX_BEAR_HEALTH - bearHealth) / MAX_BEAR_HEALTH) * 100} />
          <div className="flex gap-6">
            <button
              onClick={resetFight}
              className="touch-manipulation border border-neon-dim px-5 py-2 text-xs uppercase tracking-[0.2em] text-neon-dim transition-colors hover:text-neon"
            >
              Fight Again
            </button>
            <button
              onClick={onRetreat}
              className="touch-manipulation border border-neon-dim px-5 py-2 text-xs uppercase tracking-[0.2em] text-neon-dim transition-colors hover:text-neon"
            >
              Retreat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
