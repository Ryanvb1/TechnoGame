"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import Link from "next/link";
import { KnightFigure, type SwordPhase } from "./KnightFigure";
import { FightBackground } from "./FightBackground";
import { markKnightDefeated } from "./throneState";
import { DefeatProgressBar } from "./DefeatProgressBar";
import { VictoryScreen } from "./VictoryScreen";

type Stage = "fighting" | "won" | "lost";
type ShieldPhase = "idle" | "telegraph" | "active" | "lowering";
// idle: normal shuffling. charging: sword rising overhead while he strides
// for the heart — this stride+raise *is* the whole warning now, no separate
// glow. The pressure plate can cut this short, but only while he's still on
// his way in and actually within the glove's reach (see GLOVE_REACH_X) —
// press it too early (out of reach) or too late and nothing happens.
// striking: he's arrived and committed — the downswing lands regardless of
// the plate now, dealing one big hit. recovering: walking back out after
// landing that hit. punched: the glove caught him first — knocked back
// before the swing ever comes down.
type ChargePhase = "idle" | "charging" | "striking" | "recovering" | "punched";

const MAX_HEALTH = 450;

// Arena coordinates as percentages of the arena's own width/height, so the
// beam/knight/shield/heart all agree on the same space regardless of
// viewport size.
const KNIGHT_START_X = 76;
const KNIGHT_MIN_X = 58;
const KNIGHT_MAX_X = 90;
// 20% more erratic: he reshuffles position 20% more often (same min/max
// spread, just compressed), rather than jumping further per move.
const KNIGHT_MOVE_MIN_MS = 900 * 0.8;
const KNIGHT_MOVE_MAX_MS = 2200 * 0.8;
// How long it takes him to glide to a new spot. This drives a JS-side
// tween of knightX itself (see animateKnightTo below), not a CSS
// transition — knightX is also what hit-detection and the shield's own
// position read, so if it jumped to its target instantly (with only the
// *visual* left position catching up over a CSS transition, as this used
// to work), a shield could be judged to deflect the beam the moment he was
// still mid-shuffle toward that spot, well before he (and the shield
// riding along with him) had actually arrived. Tweening the real value
// makes "where he logically is" and "where he's drawn" the same number,
// always, so a deflect can only ever be computed directly above wherever
// he's actually rendered.
const KNIGHT_MOVE_TRANSITION_MS = 800;
const HEART_X = 10;
const HIT_RADIUS = 10;
// Lowered from its old spot near the top rail so there's clear space above
// the heart/glove/deflect line for the knight's sword to rise into during
// a charge without crowding the beam/instructions area.
const DEFLECT_Y = 40;
// Where the shield hovers, in arena-relative %, independent of DEFLECT_Y —
// derived from the knight's actual (unscaled) 291px total figure height
// sitting bottom-anchored in the arena: at both the mobile and desktop
// --kscale values his helmet-top lands right around 58-59% down, so the
// shield sits just above that.
const SHIELD_Y = 55;

const TICK_MS = 150;
const KNIGHT_TICK_DAMAGE = 4;
const PLAYER_TICK_DAMAGE = 9 * 1.5; // reflected hits deal 50% more

const TELEGRAPH_MS = 450;
const SHIELD_ACTIVE_MS = 1000; // short, rapid bursts rather than one long block — untouched, only frequency changes below
const SHIELD_LOWER_MS = 500;
// Shield frequency, thrice-buffed now: it already came up 70% more often
// than its original cooldown range (the /1.7), then another 60% on top of
// that (/1.6), and this adds another 80% on top of THAT (frequency =
// 1/period, so a further 80% increase means dividing the already-
// compressed period by another 1.8) — same min/max spread, just
// compressed again, so bursts stay just as short/rapid, only closer
// together.
const SHIELD_COOLDOWN_MIN_MS = 1000 / 1.7 / 1.6 / 1.8;
const SHIELD_COOLDOWN_MAX_MS = 4800 / 1.7 / 1.6 / 1.8;

// The charge attack — periodic, independent of the shield cycle. He winds
// up (sword rising) and strides straight for the heart; unanswered, the
// swing that follows lands one massive hit rather than a drawn-out tick.
const CHARGE_COOLDOWN_MIN_MS = 7000;
const CHARGE_COOLDOWN_MAX_MS = 14000;
// The whole approach — sword rising and stride happening together, eased
// out so he closes the final stretch slowly (see GLOVE_REACH_X) instead of
// arriving at full speed, giving the plate a real, readable window rather
// than a frame-perfect one.
const CHARGE_APPROACH_MS = 1400;
// Stops just short of the heart itself rather than right on top of it, so
// the heart (and the strike that eventually lands on it) stay visible.
const CHARGE_TARGET_X = HEART_X + 10;
// How close (in the same knightX space as CHARGE_TARGET_X) he actually has
// to be for the pressure plate to land the punch — the plate itself can be
// stepped on at any time, but it only does anything once he's within the
// glove's real reach, so pressing early or from a normal shuffle position
// does nothing.
const GLOVE_REACH_X = 16;
const STRIKE_MS = 260; // the downswing itself, start to floor
const STRIKE_IMPACT_MS = 170; // how far into that swing the blade actually connects
const SLAM_DAMAGE = 140;
const RETREAT_MS = 700; // walking back out after landing the hit
const PRESSURE_PLATE_X = 93;
const PRESSURE_PLATE_HIT_RADIUS = 6;
const PUNCH_MS = 550;

export function FightScene() {
  const [playerHealth, setPlayerHealth] = useState(MAX_HEALTH);
  const [knightHealth, setKnightHealth] = useState(MAX_HEALTH);
  const [stage, setStage] = useState<Stage>("fighting");
  const [beamX, setBeamX] = useState(50);
  const [shieldPhase, setShieldPhase] = useState<ShieldPhase>("idle");
  const [knightX, setKnightX] = useState(KNIGHT_START_X);
  const [chargePhase, setChargePhase] = useState<ChargePhase>("idle");
  const [showVictory, setShowVictory] = useState(false);

  const arenaRef = useRef<HTMLDivElement>(null);
  const beamXRef = useRef(beamX);
  const knightXRef = useRef(knightX);
  const knightAnimRef = useRef<number | null>(null);
  const shieldedRef = useRef(false);
  const stageRef = useRef<Stage>(stage);
  const chargePhaseRef = useRef<ChargePhase>(chargePhase);

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
    if (stage === "won") {
      markKnightDefeated();
      // eslint-disable-next-line react-hooks/set-state-in-effect -- re-arms the victory screen for this specific "won" transition (including replays via reset(), which sends stage back to "fighting" first) rather than a one-time mount default.
      setShowVictory(true);
    }
  }, [stage]);
  useEffect(() => {
    chargePhaseRef.current = chargePhase;
  }, [chargePhase]);

  // Tweens knightX itself, frame by frame, from wherever he currently is to
  // a new target — see KNIGHT_MOVE_TRANSITION_MS above for why this has to
  // be the real state value and not just a CSS transition on top of it.
  // Shared tween — the normal shuffle, the charge-in, and the punch-launch
  // are all "move knightX from wherever it is to some target over some
  // duration with some easing", differing only in those three numbers
  // (plus what happens once it lands).
  const tweenKnightTo = useCallback(
    (target: number, durationMs: number, ease: (t: number) => number, onComplete?: () => void) => {
      if (knightAnimRef.current !== null) cancelAnimationFrame(knightAnimRef.current);
      const start = knightXRef.current;
      const startTime = performance.now();
      function step(now: number) {
        if (stageRef.current !== "fighting") {
          knightAnimRef.current = null;
          return;
        }
        const t = Math.min(1, (now - startTime) / durationMs);
        setKnightX(start + (target - start) * ease(t));
        if (t < 1) {
          knightAnimRef.current = requestAnimationFrame(step);
        } else {
          knightAnimRef.current = null;
          onComplete?.();
        }
      }
      knightAnimRef.current = requestAnimationFrame(step);
    },
    []
  );

  const animateKnightTo = useCallback(
    (target: number) => {
      tweenKnightTo(target, KNIGHT_MOVE_TRANSITION_MS, (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2));
    },
    [tweenKnightTo]
  );

  // Strides straight for the heart, sword rising the whole way, then flips
  // into the strike itself once he arrives — see the CHARGE_* constants
  // above. Eased out (slow finish) rather than in, so the final stretch —
  // where the pressure plate can still catch him — takes a real, readable
  // beat instead of closing in an instant.
  const beginCharge = useCallback(() => {
    setChargePhase("charging");
    // Puts the shield away cleanly rather than leaving it visually up
    // (or mid-raise) while he charges — the two attacks don't overlap.
    setShieldPhase("idle");
    tweenKnightTo(CHARGE_TARGET_X, CHARGE_APPROACH_MS, (t) => 1 - Math.pow(1 - t, 3), () => {
      setChargePhase("striking");
    });
  }, [tweenKnightTo]);

  // The pressure-plate interrupt: launches him back out to his normal
  // range, fast in and settling — a real knockback, not just a fade.
  const triggerPunch = useCallback(() => {
    setChargePhase("punched");
    tweenKnightTo(KNIGHT_MAX_X, PUNCH_MS, (t) => 1 - Math.pow(1 - t, 3), () => {
      setChargePhase("idle");
    });
  }, [tweenKnightTo]);

  // The calm walk back out after a swing actually lands — same destination
  // as the punch-launch, deliberately slower/gentler since nothing hit him.
  const retreat = useCallback(() => {
    tweenKnightTo(KNIGHT_MAX_X, RETREAT_MS, (t) => 1 - Math.pow(1 - t, 3), () => {
      setChargePhase("idle");
    });
  }, [tweenKnightTo]);

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
        // Doesn't raise the shield while the charge attack owns him —
        // just tries again next cooldown instead of stacking up a raise
        // that beginCharge would immediately put back down anyway.
        if (chargePhaseRef.current !== "idle") {
          scheduleNext();
          return;
        }
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
        // The charge attack owns knightX (and knightAnimRef) for the
        // whole charging → striking → recovering/punched sequence — skip
        // this shuffle rather than fighting it for the same tween, and
        // just try again next cooldown.
        if (chargePhaseRef.current !== "idle") {
          scheduleMove();
          return;
        }
        animateKnightTo(KNIGHT_MIN_X + Math.random() * (KNIGHT_MAX_X - KNIGHT_MIN_X));
        scheduleMove();
      }, delay);
    }

    scheduleMove();
    return () => {
      window.clearTimeout(moveTimer);
      if (knightAnimRef.current !== null) {
        cancelAnimationFrame(knightAnimRef.current);
        knightAnimRef.current = null;
      }
    };
  }, [stage, animateKnightTo]);

  // Damage tick — whoever the beam is currently resting on takes damage,
  // read from refs so the interval always sees the latest aim/shield state.
  useEffect(() => {
    if (stage !== "fighting") return;
    const id = window.setInterval(() => {
      // The charge attack has its own separate damage tick (below) once
      // he's actually at the heart — this one's about aiming at wherever
      // he normally stands, which doesn't apply mid-charge/attack.
      if (chargePhaseRef.current !== "idle") return;
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

  // The charge attack's own cooldown cycle — independent of the shield's,
  // so the two can't line up predictably. Driven off chargePhase itself
  // rather than a self-contained recursive scheduler (contrast the
  // shield's own cycle above): whenever it's back to "idle" — the very
  // first render, or after a punch/retreat tween lands and resets it —
  // this effect re-fires and queues up the next cooldown from there.
  useEffect(() => {
    if (stage !== "fighting" || chargePhase !== "idle") return;
    const delay = CHARGE_COOLDOWN_MIN_MS + Math.random() * (CHARGE_COOLDOWN_MAX_MS - CHARGE_COOLDOWN_MIN_MS);
    const cooldownTimer = window.setTimeout(() => {
      if (stageRef.current === "fighting") beginCharge();
    }, delay);
    return () => window.clearTimeout(cooldownTimer);
  }, [stage, chargePhase, beginCharge]);

  // The strike itself: the blade connects partway through the downswing
  // (STRIKE_IMPACT_MS), dealing its one big hit, then once the swing's
  // fully played out he starts walking back out.
  useEffect(() => {
    if (chargePhase !== "striking") return;
    const impactTimer = window.setTimeout(() => {
      if (stageRef.current !== "fighting") return;
      setPlayerHealth((h) => {
        const next = Math.max(0, h - SLAM_DAMAGE);
        if (next <= 0) setStage("lost");
        return next;
      });
    }, STRIKE_IMPACT_MS);
    const advanceTimer = window.setTimeout(() => {
      if (stageRef.current === "fighting") setChargePhase("recovering");
    }, STRIKE_MS);
    return () => {
      window.clearTimeout(impactTimer);
      window.clearTimeout(advanceTimer);
    };
  }, [chargePhase]);

  // Walks him back out once the hit's actually landed.
  useEffect(() => {
    if (chargePhase !== "recovering") return;
    retreat();
  }, [chargePhase, retreat]);

  // The pressure-plate interrupt — the plate itself is always steppable,
  // but it only actually punches him away while he's still on his way in
  // ("charging", before the swing itself is committed) *and* he's
  // physically close enough for the glove to reach (GLOVE_REACH_X) —
  // stepping on it early, from across the arena, does nothing; the knight
  // has to actually be there. Reacting to beamX/knightX crossing into
  // range, mid-effect, is the point here (this *is* the interrupt), not
  // derivable state that belongs in render.
  useEffect(() => {
    if (chargePhase !== "charging") return;
    const onPlate = Math.abs(beamX - PRESSURE_PLATE_X) <= PRESSURE_PLATE_HIT_RADIUS;
    const inGloveReach = Math.abs(knightX - HEART_X) <= GLOVE_REACH_X;
    if (onPlate && inGloveReach) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- triggerPunch's first setState (chargePhase -> "punched") immediately guards this same condition false on the next run, so this can't cascade past one extra render.
      triggerPunch();
    }
  }, [beamX, knightX, chargePhase, triggerPunch]);

  function reset() {
    if (knightAnimRef.current !== null) {
      cancelAnimationFrame(knightAnimRef.current);
      knightAnimRef.current = null;
    }
    setPlayerHealth(MAX_HEALTH);
    setKnightHealth(MAX_HEALTH);
    setShieldPhase("idle");
    setChargePhase("idle");
    setBeamX(50);
    setKnightX(KNIGHT_START_X);
    setStage("fighting");
  }

  const shielded = shieldPhase === "active";
  const overlapping = Math.abs(beamX - knightX) <= HIT_RADIUS;
  const deflecting = shielded && overlapping;
  const damagingKnight = !shielded && overlapping && stage === "fighting";
  // No more warning glow for the charge sequence — the sword rising (see
  // swordPhase below) is the entire tell now. The only filter left is a
  // washed-out stagger right after the punch lands, plus the ordinary
  // brightness bump whenever the beam's actually hurting him.
  const knightFilter = chargePhase === "punched" ? "brightness(0.7) saturate(0.3)" : damagingKnight ? "brightness(1.6)" : "brightness(1)";
  // Raised for the whole approach (rising in step with the stride, see
  // CHARGE_APPROACH_MS), swung down for the brief strike itself, and back
  // to resting for everything else — recovering after a landed hit and
  // staggering after a punch both just drop it back down.
  const swordPhase: SwordPhase =
    chargePhase === "charging" ? "raised" : chargePhase === "striking" ? "slamming" : "rest";

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
          <Heart hit={deflecting || chargePhase === "striking"} />
        </div>

        {/* the pressure plate — always steppable, lighting up while he's
            actually mid-approach so there's some ambient sense of when it
            matters, even though stepping on it does nothing once he's
            already out of the glove's reach */}
        <PressurePlate x={PRESSURE_PLATE_X} armed={chargePhase === "charging"} />

        {/* the boxing glove buried under the heart — invisible until the
            plate's stepped on, then it's what actually launches him */}
        <BoxingGlove x={HEART_X} y={DEFLECT_Y} punching={chargePhase === "punched"} />

        {/* the shield — always mounted (even at rest, invisible down by his
            side) so phase changes animate as a continuous raise/lower
            instead of popping in and out */}
        <Shield phase={shieldPhase} x={knightX} y={SHIELD_Y} />

        {/* the knight, mirrored to face the player's side, shuffling side
            to side to dodge the beam — no CSS transition on `left` here:
            knightX is already smoothly tweened frame by frame (see
            animateKnightTo above), so this is always his true position */}
        <div className="absolute bottom-0 -translate-x-1/2" style={{ left: `${knightX}%` }}>
          <div
            className="origin-bottom transition-[filter] duration-150"
            style={{
              transform: "scaleX(calc(var(--kscale) * -1)) scaleY(var(--kscale))",
              filter: knightFilter,
            }}
          >
            <KnightFigure swordPhase={swordPhase} />
          </div>
        </div>
      </div>

      {stage === "won" && showVictory && (
        <VictoryScreen title="The Knight Yields" rewardRarity="rare" onClose={() => setShowVictory(false)} />
      )}

      {stage !== "fighting" && (
        <div className="flex flex-col items-center gap-4">
          <p className="text-lg uppercase tracking-[0.3em] text-neon">
            {stage === "won" ? "The knight yields." : "You have fallen."}
          </p>
          {stage === "lost" && (
            // How much of the knight's own health you'd worn down before
            // falling — the closest thing to "distance" a beam duel has.
            <DefeatProgressBar percent={((MAX_HEALTH - knightHealth) / MAX_HEALTH) * 100} />
          )}
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

// Sits on the arena floor at the far right — easy to overlook until the
// charge attack starts (armed), when it lights up to actually draw the
// eye there.
function PressurePlate({ x, armed }: { x: number; armed: boolean }) {
  return (
    <div
      className="absolute bottom-0 h-2 w-[7%] -translate-x-1/2 transition-[background,box-shadow] duration-200"
      style={{
        left: `${x}%`,
        background: armed ? "linear-gradient(180deg,#ffb238,#e04b3b)" : "linear-gradient(180deg,#5c636b,#2e3338)",
        boxShadow: armed ? "0 0 16px #ff4d4d, 0 0 30px rgba(255,77,77,0.6)" : "0 0 4px rgba(0,0,0,0.4)",
        animation: armed ? "fire-glow-pulse 0.6s ease-in-out infinite" : "none",
      }}
    >
      <div className="absolute inset-x-[15%] top-[2px] h-[2px]" style={{ background: "rgba(255,255,255,0.35)" }} />
    </div>
  );
}

// Buried under the heart, invisible at rest — punches straight out toward
// wherever the knight actually is (CHARGE_TARGET_X) the instant the plate
// interrupts him, then retracts.
function BoxingGlove({ x, y, punching }: { x: number; y: number; punching: boolean }) {
  return (
    <div
      className="absolute -translate-y-1/2 transition-[transform,opacity] ease-out"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: punching ? "translateX(28px) scale(1)" : "translateX(-6px) scale(0.4)",
        opacity: punching ? 1 : 0,
        transitionDuration: punching ? "180ms" : "260ms",
      }}
    >
      <div
        className="h-7 w-9"
        style={{
          clipPath: "polygon(0% 45%, 15% 15%, 45% 0%, 80% 5%, 100% 30%, 95% 65%, 70% 100%, 30% 95%, 5% 75%)",
          background: "linear-gradient(160deg, #ff6b5c 0%, #c4271a 55%, #7a1409 100%)",
          boxShadow: "0 0 14px rgba(255,77,77,0.7)",
        }}
      />
    </div>
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
        // No CSS transition on `left` — x is knightX, already tweened
        // frame by frame at the source (see animateKnightTo in
        // FightScene), so the shield reads his real position directly and
        // rides along with zero extra lag rather than running its own
        // separate transition on top of an already-animated value.
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
