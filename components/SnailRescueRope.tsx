"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent } from "react";
import { ScaredSnail } from "./ScaredSnail";
import { ThoughtBubble } from "./ThoughtBubble";
import { DefeatProgressBar } from "./DefeatProgressBar";
import { useSnailCosmetics } from "./useSnailCosmetics";
import { useSoundEffects } from "./MusicProvider";
import {
  markSnailPleaViewed,
  markSnailRescued,
  readSnailPleaViewed,
  readSnailPullProgress,
  readSnailRescued,
  writeSnailPullProgress,
} from "./snailState";

// Only mounted once the mission briefing's been dismissed (see PitGate), so
// this timer — and the rest of the encounter below — only ever starts once
// the player can actually see the room.
const PLEA_DISPLAY_MS = 3000;

// He's pulled up automatically over time — the player's job is purely to
// keep him alive along the way, not to drive the climb itself. A full,
// undisturbed climb takes this long.
const CLIMB_DURATION_MS = 35000;
const CLIMB_RATE_PER_MS = 100 / CLIMB_DURATION_MS;

// He's a true pendulum: a fixed anchor at the top, and an arm whose length
// (not just his Y position) shrinks as he climbs — so the swing itself
// visibly tightens as he's pulled up, exactly like a rope getting shorter.
// x/y are both derived from the same (armLength, angle) pair, which is
// what actually produces the arc — dipping lowest at the center of each
// swing and rising back up at the two extremes — rather than a flat
// horizontal slide.
const ARM_LENGTH_START_PCT = 76; // at 0% progress, near the bottom
const ARM_LENGTH_END_PCT = 18; // at 100% progress, near the anchor
const MAX_SWING_ANGLE_RAD = (33 * Math.PI) / 180;

// Holding the speed button raises the swing's angular rate (a shorter
// period), releasing it decays straight back to the base rate. Because
// this drives one continuously-accumulating phase rather than a fresh
// sin(t) each frame, changing the rate never jumps his position — only how
// fast he continues on from wherever he already is.
const BASE_SWING_PERIOD_MS = 3400;
const BOOST_SWING_PERIOD_MS = 1500;
const BASE_OMEGA = (2 * Math.PI) / BASE_SWING_PERIOD_MS;
const BOOST_OMEGA = (2 * Math.PI) / BOOST_SWING_PERIOD_MS;

// Down to a single geyser, dead center of the swing band, cycling through
// idle -> telegraph (a rumbling warning) -> erupt (dangerous) -> back to
// idle on its own randomized clock. Eruptions reach almost the full
// height of the screen — there's no safe altitude to climb to, only
// timing.
const GEYSER_X_PCTS = [50];
const GEYSER_IDLE_MIN_MS = 1800;
const GEYSER_IDLE_MAX_MS = 4200;
// Telegraph (the charging-up/shaking warning before it erupts) extended
// by another 0.5s on top of the original 550ms.
const GEYSER_TELEGRAPH_MS = 1050;
const GEYSER_ERUPT_MS = 600;
const GEYSER_HIT_RADIUS_PCT = 6;

const MAX_HEALTH = 3;
// A brief window of immunity right after a hit, so lingering in an already-
// erupting column doesn't chew through health in a single frame's worth of
// ticks.
const INVULNERABLE_MS = 1100;
const HIT_FLASH_MS = 380;
const HIT_NOTICE_MS = 1350;
// How long "Defeat" holds before handing back to the mission briefing —
// matches ThroneRoomScene's own DEFEAT_DISPLAY_MS for the same beat.
const DEFEAT_DISPLAY_MS = 3200;

type GeyserPhase = "idle" | "telegraph" | "erupt";
type GeyserState = { phase: GeyserPhase; until: number };

function randomIdleMs() {
  return GEYSER_IDLE_MIN_MS + Math.random() * (GEYSER_IDLE_MAX_MS - GEYSER_IDLE_MIN_MS);
}

export function SnailRescueRope({
  onDefeat,
  replay = false,
  onComplete,
}: {
  onDefeat: () => void;
  // Plays the whole encounter again after he's already been rescued for
  // good — skips the persisted "already rescued" short-circuit and the
  // "please help me" bubble (he's already been saved once; replaying it
  // doesn't retell that beat), and always starts the climb from 0
  // regardless of whatever pull progress happened to be saved.
  replay?: boolean;
  // Fires once the climb actually completes — only meaningful during a
  // replay, where the caller (PitGate) needs to know when to stop
  // rendering this and hand back to the "Replay" trigger.
  onComplete?: () => void;
}) {
  const cosmetics = useSnailCosmetics();
  const playSound = useSoundEffects();
  // This page is statically generated, so the server/build-time HTML always
  // has to assume "not rescued, no progress" (no localStorage on the
  // server); the effect below syncs in the real values right after mount.
  const [rescued, setRescued] = useState(false);
  const [progress, setProgress] = useState(0);
  const [health, setHealth] = useState(MAX_HEALTH);
  const [snailPos, setSnailPos] = useState({ x: 50, y: ARM_LENGTH_START_PCT });
  const [boosting, setBoosting] = useState(false);
  const [hitFlash, setHitFlash] = useState(false);
  const [damageNotice, setDamageNotice] = useState<number | null>(null);
  const [showPlea, setShowPlea] = useState(false);
  const [geyserPhases, setGeyserPhases] = useState<GeyserPhase[]>(() => GEYSER_X_PCTS.map(() => "idle"));
  const [defeated, setDefeated] = useState(false);
  const [defeatProgress, setDefeatProgress] = useState(0);

  // Refs mirror/own the simulation state the rAF loop below needs on every
  // frame — plain React state for that would mean reading stale closures
  // (or re-subscribing the loop) every single frame.
  const progressRef = useRef(0);
  const healthRef = useRef(MAX_HEALTH);
  const phaseRef = useRef(0); // swing phase, radians — see the swing comment above
  const boostingRef = useRef(false);
  const invulnerableUntilRef = useRef(0);
  const defeatedRef = useRef(false);
  const geysersRef = useRef<GeyserState[]>(GEYSER_X_PCTS.map(() => ({ phase: "idle" as GeyserPhase, until: 0 })));
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const damageNoticeTimerRef = useRef<number | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (replay) {
      // Always a fresh run — ignores whatever pull progress happens to be
      // saved from the original (or a previous replay).
      progressRef.current = 0;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting local simulation state for a fresh replay mount, not syncing from an external store.
      setProgress(0);
      healthRef.current = MAX_HEALTH;
      setHealth(MAX_HEALTH);
      const now = performance.now();
      geysersRef.current = GEYSER_X_PCTS.map(() => ({ phase: "idle", until: now + randomIdleMs() }));
      return;
    }
    const alreadyRescued = readSnailRescued();
    setRescued(alreadyRescued);
    if (!alreadyRescued) {
      const saved = readSnailPullProgress();
      progressRef.current = saved;
      setProgress(saved);
      if (!readSnailPleaViewed()) {
        setShowPlea(true);
        markSnailPleaViewed();
      }
      const now = performance.now();
      geysersRef.current = GEYSER_X_PCTS.map(() => ({ phase: "idle", until: now + randomIdleMs() }));
    }
  }, [replay]);

  // Deliberately its own effect, keyed on showPlea rather than nested in
  // the mount effect above — under React's dev-only Strict Mode, effects
  // run mount -> cleanup -> mount once on initial render. Nesting this
  // timer in the mount effect (and clearing it via the shared timers.current
  // cleanup) meant that first synthetic cleanup canceled it, and since
  // markSnailPleaViewed() had already persisted by then, the second (real)
  // pass's `!readSnailPleaViewed()` guard skipped ever re-arming it —
  // leaving the bubble shown with nothing left to hide it again. Keying
  // this off the boolean state itself instead is idempotent: however many
  // times setup/cleanup runs, exactly one correct timer survives.
  useEffect(() => {
    if (!showPlea) return;
    const id = window.setTimeout(() => setShowPlea(false), PLEA_DISPLAY_MS);
    return () => window.clearTimeout(id);
  }, [showPlea]);

  // Clears pending timers and the animation loop on unmount, and persists
  // wherever the climb had gotten to — see the introTimers pattern in
  // ThroneRoomScene for why this reads `.current` at unmount time rather
  // than a snapshot from mount.
  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps -- see comment above.
      timers.current.forEach((id) => window.clearTimeout(id));
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (damageNoticeTimerRef.current !== null) window.clearTimeout(damageNoticeTimerRef.current);
      writeSnailPullProgress(progressRef.current);
    };
  }, []);

  // The whole encounter runs off one rAF loop: swing phase (and the arc it
  // produces), the automatic climb, each geyser's independent cycle, and
  // hit detection against whichever geysers are currently erupting.
  useEffect(() => {
    if (rescued) return;

    function tick(now: number) {
      const last = lastFrameRef.current ?? now;
      const dt = Math.min(64, now - last); // clamps a tab-backgrounding hiccup to one reasonable step
      lastFrameRef.current = now;

      const omega = boostingRef.current ? BOOST_OMEGA : BASE_OMEGA;
      phaseRef.current += omega * dt;
      const angle = MAX_SWING_ANGLE_RAD * Math.sin(phaseRef.current);

      progressRef.current = Math.min(100, progressRef.current + CLIMB_RATE_PER_MS * dt);
      setProgress(progressRef.current);
      const armLength =
        ARM_LENGTH_START_PCT + (progressRef.current / 100) * (ARM_LENGTH_END_PCT - ARM_LENGTH_START_PCT);
      const nextX = 50 + armLength * Math.sin(angle);
      const nextY = armLength * Math.cos(angle);
      setSnailPos({ x: nextX, y: nextY });

      if (progressRef.current >= 100) {
        writeSnailPullProgress(100);
        markSnailRescued();
        playSound("victory");
        setRescued(true);
        onComplete?.();
        return;
      }

      let justHit = false;
      let justErupted = false;
      const nextPhases = geysersRef.current.map((g, i) => {
        if (now >= g.until) {
          if (g.phase === "idle") {
            g.phase = "telegraph";
            g.until = now + GEYSER_TELEGRAPH_MS;
          } else if (g.phase === "telegraph") {
            g.phase = "erupt";
            justErupted = true;
            g.until = now + GEYSER_ERUPT_MS;
          } else {
            g.phase = "idle";
            g.until = now + randomIdleMs();
          }
        }
        if (
          g.phase === "erupt" &&
          now >= invulnerableUntilRef.current &&
          Math.abs(nextX - GEYSER_X_PCTS[i]) < GEYSER_HIT_RADIUS_PCT
        ) {
          justHit = true;
        }
        return g.phase;
      });
      setGeyserPhases(nextPhases);
      if (justErupted) playSound("fire");

      if (justHit) {
        playSound("player-hit");
        invulnerableUntilRef.current = now + INVULNERABLE_MS;
        healthRef.current = Math.max(0, healthRef.current - 1);
        setHealth(healthRef.current);
        setDamageNotice(healthRef.current);
        if (damageNoticeTimerRef.current !== null) {
          window.clearTimeout(damageNoticeTimerRef.current);
        }
        damageNoticeTimerRef.current = window.setTimeout(() => {
          setDamageNotice(null);
          damageNoticeTimerRef.current = null;
        }, HIT_NOTICE_MS);
        setHitFlash(true);
        timers.current.push(window.setTimeout(() => setHitFlash(false), HIT_FLASH_MS));
        if (healthRef.current <= 0) {
          // Three hits and he's out — freeze here (no further frames) and
          // show Defeat; the climb resets so the next attempt starts
          // clean. Captures how far he'd gotten for the Defeat screen's
          // own progress bar before that same reset wipes it.
          defeatedRef.current = true;
          setDefeated(true);
          playSound("defeat");
          setDefeatProgress(progressRef.current);
          progressRef.current = 0;
          writeSnailPullProgress(0);
          timers.current.push(window.setTimeout(onDefeat, DEFEAT_DISPLAY_MS));
          return;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastFrameRef.current = null;
    };
  }, [rescued, onDefeat, onComplete, playSound]);

  function beginBoost() {
    if (defeatedRef.current) return;
    boostingRef.current = true;
    setBoosting(true);
  }

  function endBoost() {
    boostingRef.current = false;
    setBoosting(false);
  }

  function handlePointerDown(e: PointerEvent<HTMLButtonElement>) {
    // Capture so a release outside the button's bounds (a common touch
    // drift) still reaches onPointerUp here rather than being lost —
    // guarded because some pointer sessions (synthetic events, certain
    // stylus/assistive-tech input) aren't capturable and throw instead.
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Not capturable — onPointerLeave still covers the release.
    }
    beginBoost();
  }

  function handleKeyDown(e: ReactKeyboardEvent<HTMLButtonElement>) {
    if (e.repeat || (e.key !== " " && e.key !== "Enter")) return;
    e.preventDefault();
    beginBoost();
  }

  function handleKeyUp(e: ReactKeyboardEvent<HTMLButtonElement>) {
    if (e.key === " " || e.key === "Enter") endBoost();
  }

  // Space is a mission-wide control, not something that only works after
  // tabbing to or clicking the on-screen speed button.
  useEffect(() => {
    function isTypingTarget(target: EventTarget | null) {
      if (!(target instanceof HTMLElement)) return false;
      return (
        target.isContentEditable ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT"
      );
    }

    function handleWindowKeyDown(event: KeyboardEvent) {
      if (event.code !== "Space" || isTypingTarget(event.target)) return;
      event.preventDefault();
      if (defeatedRef.current) return;
      boostingRef.current = true;
      setBoosting(true);
    }

    function handleWindowKeyUp(event: KeyboardEvent) {
      if (event.code !== "Space") return;
      boostingRef.current = false;
      setBoosting(false);
    }

    window.addEventListener("keydown", handleWindowKeyDown);
    window.addEventListener("keyup", handleWindowKeyUp);
    return () => {
      window.removeEventListener("keydown", handleWindowKeyDown);
      window.removeEventListener("keyup", handleWindowKeyUp);
    };
  }, []);

  if (rescued) return null;

  // Scared by how close to the flames he still is, and doubly so right
  // after taking a hit.
  const fear = Math.min(1, Math.max(0, 1 - progress / 100 + (MAX_HEALTH - health) * 0.15));

  return (
    <>
      {/* the rope — a taut line from the fixed roof anchor to wherever he
          currently is, redrawn every frame as he swings and climbs. An SVG
          line (rather than a rotated bar) so both ends can just be plain
          percentages, matching the snail's own left/top below with no unit
          conversion in between. */}
      <svg
        className="pointer-events-none fixed inset-0 z-40 h-full w-full"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <line
          x1={50}
          y1={0}
          x2={snailPos.x}
          y2={snailPos.y}
          stroke={hitFlash ? "#ff8a6a" : "#9c7a44"}
          strokeWidth={0.5}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {GEYSER_X_PCTS.map((x, i) => (
        <Geyser key={i} xPct={x} phase={geyserPhases[i]} />
      ))}

      {hitFlash && (
        <div
          className="pointer-events-none fixed inset-0 z-40"
          style={{
            background: "rgba(255,35,20,0.16)",
            boxShadow: "inset 0 0 55px rgba(255,35,20,0.95)",
          }}
        />
      )}

      {damageNotice !== null && (
        <div className="pointer-events-none fixed left-1/2 top-24 z-50 -translate-x-1/2 animate-[defeat-shake_220ms_ease-in-out_3] border-2 border-[#ff4d4d] bg-[#240507]/95 px-7 py-4 text-center shadow-[0_0_25px_rgba(255,50,45,0.9)]">
          <p className="text-2xl font-black uppercase tracking-[0.2em] text-[#ff5c5c] sm:text-3xl">
            -1 Heart
          </p>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.22em] text-white">
            {damageNotice} {damageNotice === 1 ? "heart" : "hearts"} remaining
          </p>
        </div>
      )}

      {/* the snail, riding at the rope's end */}
      <div
        className="fixed z-40 -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${snailPos.x}%`, top: `${snailPos.y}%` }}
      >
        <div className="relative flex flex-col items-center">
          {/* knot, doubling as the ledge the snail sits on */}
          <div className="h-3 w-11" style={{ background: "linear-gradient(180deg, #b8935c 0%, #7d5c34 100%)" }} />
          <div className="absolute bottom-full left-1/2 z-10 mb-[-8px] -translate-x-1/2">
            {showPlea && (
              <ThoughtBubble className="absolute bottom-full left-1/2 mb-3 w-48 -translate-x-1/2">
                <p className="font-bold">PLEASE HELP ME!!</p>
              </ThoughtBubble>
            )}
            <ScaredSnail fear={fear} {...cosmetics} />
          </div>
        </div>
      </div>

      {/* HUD: health, climb progress, and the speed control — pinned to
          the top, clear of the swing band below it */}
      <div className="fixed left-1/2 top-4 z-40 flex -translate-x-1/2 flex-col items-center gap-2 sm:top-6">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-start gap-0.5">
            <div className="flex gap-1 text-lg leading-none" aria-label={`${health} of ${MAX_HEALTH} hearts remaining`}>
              {Array.from({ length: MAX_HEALTH }).map((_, i) => (
                <span
                  key={i}
                  className="transition-[color,filter,transform] duration-300"
                  style={{
                    color: i < health ? "#ff5c5c" : "rgba(255,255,255,0.15)",
                    filter: i < health ? "drop-shadow(0 0 4px #ff5c5c)" : "none",
                    transform: hitFlash && i === health ? "scale(1.45)" : "scale(1)",
                  }}
                >
                  ♥
                </span>
              ))}
            </div>
            <span className="text-[0.5rem] font-bold uppercase tracking-[0.16em] text-white/75">
              {health} / {MAX_HEALTH} hearts
            </span>
          </div>
          <div className="h-1.5 w-32 border border-white/20 bg-white/5">
            <div
              className="h-full transition-[width] duration-300 ease-out"
              style={{ width: `${progress}%`, background: "var(--neon)", boxShadow: "0 0 8px var(--neon)" }}
            />
          </div>
        </div>
        <button
          onPointerDown={handlePointerDown}
          onPointerUp={endBoost}
          onPointerLeave={endBoost}
          onPointerCancel={endBoost}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          disabled={defeated}
          aria-label="Hold Space or press and hold to swing faster"
          className={`touch-manipulation select-none border px-4 py-1.5 text-[0.6rem] uppercase tracking-[0.3em] transition-colors ${
            boosting ? "border-neon bg-neon/10 text-neon" : "border-neon-dim text-neon-dim hover:text-neon"
          }`}
        >
          {boosting ? "Swinging Faster" : "Hold Space to Speed Up"}
        </button>
        <p className="max-w-[16rem] text-center text-[0.55rem] uppercase tracking-[0.2em] text-foreground/40">
          Hold Space or the button to swing clear of the geysers below.
        </p>
      </div>

      {/* Defeat — frozen mid-fall rather than a dead end the player has to
          click out of; the whole encounter hands back to the mission
          briefing on its own once this has had its moment (see onDefeat). */}
      {defeated && (
        <div className="pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center gap-6">
          <div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse at 50% 50%, rgba(90,0,10,0.4) 0%, rgba(0,0,0,0.8) 75%)",
            }}
          />
          <p
            className="relative px-4 text-center text-6xl font-bold uppercase tracking-[0.35em] sm:text-8xl"
            style={{
              color: "#c41230",
              textShadow:
                "0 0 10px rgba(220,20,50,0.95), 0 0 30px rgba(180,10,35,0.75), 0 0 70px rgba(120,0,20,0.55)",
              animation: "defeat-flicker 3s ease-in-out infinite, defeat-shake 220ms ease-in-out infinite",
            }}
          >
            Defeat
          </p>
          <div className="relative">
            <DefeatProgressBar percent={defeatProgress} />
          </div>
        </div>
      )}
    </>
  );
}

// A geyser's height (and, while erupting, its width and glow) is driven
// entirely by its current phase — idle is a low flicker, telegraph is a
// short rumbling warning, erupt is the full height of the screen (all the
// way to the anchor point at the top, where the snail actually escapes)
// so there's no safe altitude to climb to, only timing.
function Geyser({ xPct, phase }: { xPct: number; phase: GeyserPhase }) {
  const erupting = phase === "erupt";
  const telegraphing = phase === "telegraph";
  const height = erupting ? "100vh" : telegraphing ? "70px" : "34px";
  const width = erupting ? 90 : 46;
  // The rise into "erupt" has to actually finish well within
  // GEYSER_ERUPT_MS (600ms) or the eruption is already back over before the
  // CSS transition ever reaches full height — it used to share one flat
  // 3000ms duration with every other height change, so it never visibly
  // got there during a live eruption, only during the frozen defeat screen
  // (nothing left to interrupt an in-flight transition). The recede back
  // down to idle can stay leisurely since nothing's timed against it.
  const durationMs = erupting ? 150 : telegraphing ? 300 : 900;
  return (
    <div
      className="pointer-events-none fixed bottom-0 z-20 -translate-x-1/2 transition-[height,width] ease-out"
      style={{ left: `${xPct}%`, width, height, transitionDuration: `${durationMs}ms` }}
    >
      <div
        className={telegraphing ? "h-full w-full animate-[fire-flicker_0.15s_ease-in-out_infinite]" : "h-full w-full"}
        style={{
          clipPath: "polygon(50% 0%, 78% 30%, 62% 26%, 88% 56%, 60% 100%, 12% 100%, 34% 54%, 10% 30%)",
          background: erupting
            ? "linear-gradient(to top, #7a0d02 0%, #ff4d0f 40%, #ffb238 75%, #fff3c4 100%)"
            : "linear-gradient(to top, #7a1200 0%, #ff7a1f 100%)",
          filter: erupting ? "drop-shadow(0 0 18px rgba(255,120,20,0.9))" : "none",
          opacity: telegraphing ? 0.75 : 1,
        }}
      />
    </div>
  );
}
