"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import Link from "next/link";
import { KnightFigure } from "./KnightFigure";
import { FightBackground } from "./FightBackground";
import { markKnightDefeated } from "./throneState";

type Stage = "fighting" | "won" | "lost";
type ShieldPhase = "idle" | "telegraph" | "active" | "lowering";

const MAX_HEALTH = 450;

// Arena coordinates as percentages of the arena's own width/height, so the
// beam/knight/shield/heart all agree on the same space regardless of
// viewport size.
const KNIGHT_START_X = 76;
const KNIGHT_MIN_X = 58;
const KNIGHT_MAX_X = 90;
const KNIGHT_MOVE_MIN_MS = 900;
const KNIGHT_MOVE_MAX_MS = 2200;
const HEART_X = 10;
const HIT_RADIUS = 10;
const DEFLECT_Y = 24;
// Where the shield hovers, in arena-relative %, independent of DEFLECT_Y —
// derived from the knight's actual (unscaled) 291px total figure height
// sitting bottom-anchored in the arena: at both the mobile and desktop
// --kscale values his helmet-top lands right around 58-59% down, so the
// shield sits just above that.
const SHIELD_Y = 55;

const TICK_MS = 150;
const KNIGHT_TICK_DAMAGE = 4;
const PLAYER_TICK_DAMAGE = 9;

const TELEGRAPH_MS = 450;
const SHIELD_ACTIVE_MS = 1540; // 1100 * 1.4
const SHIELD_LOWER_MS = 500;
const SHIELD_COOLDOWN_MIN_MS = 1000;
const SHIELD_COOLDOWN_MAX_MS = 4800;

export function FightScene() {
  const [playerHealth, setPlayerHealth] = useState(MAX_HEALTH);
  const [knightHealth, setKnightHealth] = useState(MAX_HEALTH);
  const [stage, setStage] = useState<Stage>("fighting");
  const [beamX, setBeamX] = useState(50);
  const [shieldPhase, setShieldPhase] = useState<ShieldPhase>("idle");
  const [knightX, setKnightX] = useState(KNIGHT_START_X);

  const arenaRef = useRef<HTMLDivElement>(null);
  const beamXRef = useRef(beamX);
  const knightXRef = useRef(knightX);
  const shieldedRef = useRef(false);
  const stageRef = useRef<Stage>(stage);

  useEffect(() => {
    beamXRef.current = beamX;
  }, [beamX]);
  useEffect(() => {
    knightXRef.current = knightX;
  }, [knightX]);
  useEffect(() => {
    shieldedRef.current = shieldPhase === "active";
  }, [shieldPhase]);
  useEffect(() => {
    stageRef.current = stage;
    if (stage === "won") markKnightDefeated();
  }, [stage]);

  const updateBeamFromClientX = useCallback((clientX: number) => {
    const rect = arenaRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setBeamX(Math.min(96, Math.max(4, pct)));
  }, []);

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    if (stage !== "fighting") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateBeamFromClientX(e.clientX);
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (stage !== "fighting") return;
    updateBeamFromClientX(e.clientX);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (stage !== "fighting") return;
    if (e.key === "ArrowLeft") setBeamX((x) => Math.max(4, x - 4));
    if (e.key === "ArrowRight") setBeamX((x) => Math.min(96, x + 4));
  }

  // The knight's shield cycle — a brief telegraph (rising, harmless) before
  // it's actually up and able to deflect the beam.
  useEffect(() => {
    if (stage !== "fighting") return;
    let telegraphTimer: number;
    let activeTimer: number;
    let lowerTimer: number;
    let cooldownTimer: number;

    function scheduleNext() {
      const delay =
        SHIELD_COOLDOWN_MIN_MS + Math.random() * (SHIELD_COOLDOWN_MAX_MS - SHIELD_COOLDOWN_MIN_MS);
      cooldownTimer = window.setTimeout(() => {
        if (stageRef.current !== "fighting") return;
        setShieldPhase("telegraph");
        telegraphTimer = window.setTimeout(() => {
          if (stageRef.current !== "fighting") return;
          setShieldPhase("active");
          activeTimer = window.setTimeout(() => {
            if (stageRef.current !== "fighting") return;
            setShieldPhase("lowering");
            lowerTimer = window.setTimeout(() => {
              if (stageRef.current !== "fighting") return;
              setShieldPhase("idle");
              scheduleNext();
            }, SHIELD_LOWER_MS);
          }, SHIELD_ACTIVE_MS);
        }, TELEGRAPH_MS);
      }, delay);
    }

    scheduleNext();
    return () => {
      window.clearTimeout(telegraphTimer);
      window.clearTimeout(activeTimer);
      window.clearTimeout(lowerTimer);
      window.clearTimeout(cooldownTimer);
    };
  }, [stage]);

  // The knight shuffles side to side at random, as if trying to dodge out
  // from under the beam.
  useEffect(() => {
    if (stage !== "fighting") return;
    let moveTimer: number;

    function scheduleMove() {
      const delay = KNIGHT_MOVE_MIN_MS + Math.random() * (KNIGHT_MOVE_MAX_MS - KNIGHT_MOVE_MIN_MS);
      moveTimer = window.setTimeout(() => {
        if (stageRef.current !== "fighting") return;
        setKnightX(KNIGHT_MIN_X + Math.random() * (KNIGHT_MAX_X - KNIGHT_MIN_X));
        scheduleMove();
      }, delay);
    }

    scheduleMove();
    return () => window.clearTimeout(moveTimer);
  }, [stage]);

  // Damage tick — whoever the beam is currently resting on takes damage,
  // read from refs so the interval always sees the latest aim/shield state.
  useEffect(() => {
    if (stage !== "fighting") return;
    const id = window.setInterval(() => {
      const overlap = Math.abs(beamXRef.current - knightXRef.current) <= HIT_RADIUS;
      if (!overlap) return;
      if (shieldedRef.current) {
        setPlayerHealth((h) => {
          const next = Math.max(0, h - PLAYER_TICK_DAMAGE);
          if (next <= 0) setStage("lost");
          return next;
        });
      } else {
        setKnightHealth((h) => {
          const next = Math.max(0, h - KNIGHT_TICK_DAMAGE);
          if (next <= 0) setStage("won");
          return next;
        });
      }
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [stage]);

  function instaKill() {
    if (stage !== "fighting") return;
    setKnightHealth(0);
    setStage("won");
  }

  function reset() {
    setPlayerHealth(MAX_HEALTH);
    setKnightHealth(MAX_HEALTH);
    setShieldPhase("idle");
    setBeamX(50);
    setKnightX(KNIGHT_START_X);
    setStage("fighting");
  }

  const shielded = shieldPhase === "active";
  const overlapping = Math.abs(beamX - knightX) <= HIT_RADIUS;
  const deflecting = shielded && overlapping;
  const damagingKnight = !shielded && overlapping && stage === "fighting";

  return (
    <main className="relative flex min-h-screen flex-col items-center gap-6 px-6 py-10 sm:px-16">
      <FightBackground />

      <Link
        href="/throne-room"
        className="fixed left-8 top-8 z-40 text-xs uppercase tracking-[0.3em] text-neon-dim transition-colors hover:text-neon sm:left-12 sm:top-12"
      >
        ← Retreat
      </Link>

      <h1 className="text-3xl font-bold uppercase tracking-widest text-neon sm:text-5xl">
        Trial by Combat
      </h1>

      <div className="flex w-full max-w-xl items-end gap-4">
        <HealthBar label="You" value={playerHealth} max={MAX_HEALTH} color="var(--neon)" />
        <span className="pb-1 text-lg font-bold uppercase tracking-[0.3em] text-neon-dim">VS</span>
        <HealthBar label="Knight" value={knightHealth} max={MAX_HEALTH} color="#e04b3b" align="right" />
      </div>

      {stage === "fighting" && (
        <div className="flex flex-col items-center gap-2">
          <p className="max-w-md text-center text-[0.65rem] uppercase tracking-[0.2em] text-foreground/50">
            Move to aim the beam at the knight. Pull it off him when his
            shield rises, or he&apos;ll bounce it straight into you.
          </p>
          <button
            onClick={instaKill}
            className="touch-manipulation text-[0.55rem] uppercase tracking-[0.2em] text-foreground/30 transition-colors hover:text-foreground/60"
          >
            Insta-Kill (test)
          </button>
        </div>
      )}

      <div
        ref={arenaRef}
        role="slider"
        tabIndex={0}
        aria-label="Aim the laser beam"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(beamX)}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onKeyDown={handleKeyDown}
        className="relative h-[300px] w-full max-w-2xl touch-none outline-none [--kscale:0.42] sm:h-[380px] sm:[--kscale:0.55]"
      >
        {/* overhead rail the emitter rides along */}
        <div className="absolute inset-x-0 top-0 h-[3px] bg-neon-dim/50 shadow-[0_0_8px_var(--neon-dim)]" />
        {/* emitter */}
        <div
          className="absolute top-0 h-4 w-7 -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${beamX}%`,
            background: "var(--neon)",
            boxShadow: "0 0 10px var(--neon), 0 0 20px var(--neon-dim)",
          }}
        />

        {/* vertical beam — stops short and bends at the shield when the
            knight successfully deflects it, otherwise runs to the floor */}
        <div
          className="absolute w-[3px] -translate-x-1/2 transition-[height,background,box-shadow] duration-150"
          style={{
            left: `${beamX}%`,
            top: 0,
            height: deflecting ? `${DEFLECT_Y}%` : "100%",
            background: deflecting ? "#ff4d4d" : damagingKnight ? "#baffd9" : "var(--neon)",
            boxShadow: deflecting
              ? "0 0 10px #ff4d4d, 0 0 20px rgba(255,77,77,0.6)"
              : damagingKnight
                ? "0 0 14px var(--neon), 0 0 28px var(--neon)"
                : "0 0 6px var(--neon-dim)",
          }}
        />
        {deflecting && (
          <div
            className="absolute h-[3px] -translate-y-1/2"
            style={{
              top: `${DEFLECT_Y}%`,
              left: `${Math.min(beamX, HEART_X)}%`,
              width: `${Math.abs(beamX - HEART_X)}%`,
              background: "#ff4d4d",
              boxShadow: "0 0 10px #ff4d4d, 0 0 20px rgba(255,77,77,0.6)",
            }}
          />
        )}

        {/* the player, represented for now as a flat heart mounted on the
            wall rather than a standing figure */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${HEART_X}%`, top: `${DEFLECT_Y}%` }}
        >
          <Heart hit={deflecting} />
        </div>

        {/* the shield — always mounted (even at rest, invisible down by his
            side) so phase changes animate as a continuous raise/lower
            instead of popping in and out */}
        <Shield phase={shieldPhase} x={knightX} y={SHIELD_Y} />

        {/* the knight, mirrored to face the player's side, shuffling side
            to side to dodge the beam */}
        <div
          className="absolute bottom-0 -translate-x-1/2 transition-[left] duration-[800ms] ease-in-out"
          style={{ left: `${knightX}%` }}
        >
          <div
            className="origin-bottom transition-[filter] duration-150"
            style={{
              transform: "scaleX(calc(var(--kscale) * -1)) scaleY(var(--kscale))",
              filter: damagingKnight ? "brightness(1.6)" : "brightness(1)",
            }}
          >
            <KnightFigure />
          </div>
        </div>
      </div>

      {stage !== "fighting" && (
        <div className="flex flex-col items-center gap-4">
          <p className="text-lg uppercase tracking-[0.3em] text-neon">
            {stage === "won" ? "The knight yields." : "You have fallen."}
          </p>
          <div className="flex gap-6">
            <button
              onClick={reset}
              className="touch-manipulation border border-neon-dim px-5 py-2 text-xs uppercase tracking-[0.2em] text-neon-dim transition-colors hover:text-neon"
            >
              Fight Again
            </button>
            <Link
              href="/throne-room"
              className="touch-manipulation border border-neon-dim px-5 py-2 text-xs uppercase tracking-[0.2em] text-neon-dim transition-colors hover:text-neon"
            >
              Return to Throne Room
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}

function HealthBar({
  label,
  value,
  max,
  color,
  align = "left",
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  align?: "left" | "right";
}) {
  const pct = (value / max) * 100;
  return (
    <div className="flex flex-1 flex-col gap-1">
      <span
        className={`text-[0.6rem] uppercase tracking-[0.2em] text-foreground/70 ${
          align === "right" ? "text-right" : ""
        }`}
      >
        {label}
      </span>
      <div className="relative h-3 w-full border border-white/20 bg-white/5">
        <div
          className="h-full transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}` }}
        />
      </div>
    </div>
  );
}

function Heart({ hit }: { hit: boolean }) {
  return (
    <div
      className="h-9 w-9 rotate-45 transition-all duration-150"
      style={{
        background: hit ? "#ff5c5c" : "#8a1f1f",
        boxShadow: hit ? "0 0 22px #ff5c5c, 0 0 40px rgba(255,92,92,0.6)" : "0 0 10px rgba(138,31,31,0.5)",
      }}
    />
  );
}

// Per-phase resting pose for the shield arm: how far down/rotated it sits
// (as if tucked at his side) versus raised overhead, and how long the
// transition into that phase should take — so raising and lowering read as
// a deliberate arm motion instead of a plain opacity fade.
const SHIELD_POSE: Record<ShieldPhase, { dropPx: number; rotateDeg: number; opacity: number; ms: number }> = {
  idle: { dropPx: 26, rotateDeg: 16, opacity: 0, ms: 200 },
  telegraph: { dropPx: 6, rotateDeg: 4, opacity: 0.8, ms: TELEGRAPH_MS },
  active: { dropPx: 0, rotateDeg: 0, opacity: 1, ms: 160 },
  lowering: { dropPx: 26, rotateDeg: 16, opacity: 0, ms: SHIELD_LOWER_MS },
};

function Shield({ phase, x, y }: { phase: ShieldPhase; x: number; y: number }) {
  const active = phase === "active";
  const pose = SHIELD_POSE[phase];
  return (
    <div
      className="absolute"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        // sized directly off the knight's own torso width (116px unscaled)
        // via the shared --kscale custom property, so it always covers
        // exactly his body's width regardless of viewport
        width: "calc(116px * var(--kscale))",
        height: "calc(38px * var(--kscale))",
        transform: `translate(-50%, calc(-50% + ${pose.dropPx}px)) rotate(${pose.rotateDeg}deg)`,
        transformOrigin: "50% 100%",
        transitionProperty: "transform, opacity, background, box-shadow",
        transitionDuration: `${pose.ms}ms`,
        transitionTimingFunction: "ease-in-out",
        opacity: pose.opacity,
        clipPath: "polygon(50% 0%, 100% 18%, 92% 70%, 50% 100%, 8% 70%, 0% 18%)",
        background: active
          ? "linear-gradient(160deg, #f0f4f8 0%, #b7c0ca 45%, #6b737c 100%)"
          : "linear-gradient(160deg, #b7c0ca 0%, #8a929c 45%, #4b525a 100%)",
        boxShadow: active ? "0 0 16px rgba(255,255,255,0.8), 0 0 28px #ff4d4d" : "none",
      }}
    />
  );
}
