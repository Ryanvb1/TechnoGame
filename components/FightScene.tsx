"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import Link from "next/link";
import { KnightFigure, type SwordPhase } from "./KnightFigure";
import { FightBackground } from "./FightBackground";
import { useSoundEffects } from "./MusicProvider";
import { grantKnightVictoryLoot, markKnightDefeated } from "./throneState";
import { DefeatProgressBar } from "./DefeatProgressBar";
import { VictoryScreen } from "./VictoryScreen";
import { NecklaceIcon } from "./NecklaceIcon";
import { useHideCompanionSnail } from "./companionSnail";

type Stage = "fighting" | "won" | "lost";
type ShieldPhase = "idle" | "telegraph" | "active" | "lowering";
// idle: normal shuffling — the pressure plate can punch him out of this
// too now, not just out of a charge, so long as the plate's off cooldown
// (see PRESSURE_PLATE_COOLDOWN_MS). The plate itself always fires on a
// press (cooldown included) regardless of where he's standing; whether
// that press actually costs him anything comes down to the glove's own
// short reach (see GLOVE_REACH_X, marked with a subtle line on the arena
// floor) — within it, the punch lands for real; outside it, the glove still
// throws (see gloveWhiff) but he's untouched. windup: sword rising
// overhead while he holds his ground — a clean, stationary telegraph
// before he commits to anything. charging: sword already up, now
// sprinting straight for the heart — fast and committed, arriving and
// slamming down the instant he gets there rather than pausing once more
// first; this is also the phase that actually carries him into the
// glove's reach, so it's the plate's most reliable window even though it
// isn't the only one. striking: he's arrived and committed — the
// downswing lands regardless of the plate now, dealing one big hit.
// recovering: walking back out after landing that hit. punched: the
// glove caught him for real — knocked back before the swing ever comes
// down.
type ChargePhase = "idle" | "windup" | "charging" | "striking" | "recovering" | "punched";

const MAX_HEALTH = 450;

// Arena coordinates as percentages of the arena's own width/height, so the
// beam/knight/shield/heart all agree on the same space regardless of
// viewport size.
const KNIGHT_START_X = 76;
// KNIGHT_MIN_X/KNIGHT_MAX_X are declared further down (after HEART_X,
// GLOVE_REACH_X, HIT_RADIUS, and PRESSURE_PLATE_X/PRESSURE_PLATE_HIT_RADIUS
// all exist to derive them from) — see there for why.
// 20% more erratic: he reshuffles position 20% more often (same min/max
// spread, just compressed), rather than jumping further per move.
const KNIGHT_MOVE_MIN_MS = 900 * 0.8;
const KNIGHT_MOVE_MAX_MS = 2200 * 0.8;
// The pacing above no longer gets sampled as a flat uniform spread — see
// erraticDuration — since that reads as smooth/predictable rather than
// erratic. This is just the mean it now centers on, so the same overall
// reshuffle rate survives, only distributed much less evenly: some
// reshuffles come in quick succession, others sit for a while.
const KNIGHT_MOVE_MEAN_MS = (KNIGHT_MOVE_MIN_MS + KNIGHT_MOVE_MAX_MS) / 2;
// How far a single "small twitch" reshuffle can nudge him from wherever he
// already is, as opposed to a full reposition across the whole shuffle
// zone — see pickErraticKnightTarget.
const KNIGHT_JITTER_X = 8;
// How long it takes him to glide to a new spot — a fixed duration again
// (briefly the *mean* of a per-move erratic duration, but a variable glide
// speed read as jerky/teleport-y rather than erratic; the randomness now
// lives entirely in *when* he moves and *where* he goes — see the shuffle
// effect below — while the glide itself always takes this long so the
// motion reads smooth). This drives a JS-side tween of knightX itself (see
// animateKnightTo below), not a CSS transition — knightX is also what
// hit-detection and the shield's own position read, so if it jumped to
// its target instantly (with only the *visual* left position catching up
// over a CSS transition, as this used to work), a shield could be judged
// to deflect the beam the moment he was still mid-shuffle toward that
// spot, well before he (and the shield riding along with him) had
// actually arrived. Tweening the real value makes "where he logically is"
// and "where he's drawn" the same number, always, so a deflect can only
// ever be computed directly above wherever he's actually rendered.
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
// How long each burst stays up. MIN/MAX only survive now as the source of
// SHIELD_ACTIVE_MEAN_MS below — the actual per-burst duration comes from
// erraticDuration, not a flat spread between them (see there for why: a
// flat spread reads as smooth/predictable, not erratic). The mean still
// lands on the same old 1000ms average, so the total time spent blocking
// over a fight is unchanged — some bursts now snap down far faster, others
// hang on far longer, instead of the narrower, more evenly-spread range
// this used to sample from.
const SHIELD_ACTIVE_MIN_MS = 500;
const SHIELD_ACTIVE_MAX_MS = 1500;
const SHIELD_ACTIVE_MEAN_MS = (SHIELD_ACTIVE_MIN_MS + SHIELD_ACTIVE_MAX_MS) / 2;
const SHIELD_LOWER_MS = 500;
// Shield frequency, thrice-buffed now: it already came up 70% more often
// than its original cooldown range (the /1.7), then another 60% on top of
// that (/1.6), and this adds another 80% on top of THAT (frequency =
// 1/period, so a further 80% increase means dividing the already-
// compressed period by another 1.8) — same min/max spread, just
// compressed again, so bursts stay just as short/rapid, only closer
// together. As with SHIELD_ACTIVE above, MIN/MAX now only feed
// SHIELD_COOLDOWN_MEAN_MS — erraticDuration samples the actual gap, so the
// same average frequency survives while individual gaps swing much wider.
const SHIELD_COOLDOWN_MIN_MS = 1000 / 1.7 / 1.6 / 1.8;
const SHIELD_COOLDOWN_MAX_MS = 4800 / 1.7 / 1.6 / 1.8;
const SHIELD_COOLDOWN_MEAN_MS = (SHIELD_COOLDOWN_MIN_MS + SHIELD_COOLDOWN_MAX_MS) / 2;

// The charge attack — periodic, independent of the shield cycle. He winds
// up (sword rising) and strides straight for the heart; unanswered, the
// swing that follows lands one massive hit rather than a drawn-out tick.
const CHARGE_COOLDOWN_MIN_MS = 7000;
const CHARGE_COOLDOWN_MAX_MS = 14000;
// The wind-up — sword rising while he holds his ground, stationary; the
// telegraph itself, and the whole reason the plate has a readable window
// at all before he ever starts moving.
const CHARGE_WINDUP_MS = 900;
// The sprint that follows, sword already overhead — eased IN (building
// speed) rather than out, since the warning already happened during the
// windup; this is just the fast, committed dash home, arriving right into
// the slam rather than settling first.
const CHARGE_SPRINT_MS = 500;
// Stops just short of the heart itself rather than right on top of it, so
// the heart (and the strike that eventually lands on it) stay visible.
const CHARGE_TARGET_X = HEART_X + 10;
// How much clear runway he needs — past the glove's own reach line
// (KNIGHT_MIN_X), which his ordinary idle shuffling can now bring him
// right up against — before a charge is allowed to begin. Starting a
// charge from right against that line would carry him across it almost
// immediately once the sprint starts, giving the plate no fair "he's just
// now crossing" moment to react to. See the charge cooldown effect below
// (attemptCharge) for how this gets used: simplest fix is just to wait
// and not start the charge yet, not to re-position him or touch the
// crossing logic itself.
const CHARGE_START_MARGIN_X = 15;
const CHARGE_START_RETRY_MS = 500;
// How close (in the same knightX space as CHARGE_TARGET_X) he actually has
// to be for the pressure plate's punch to land — fairly short and
// centered on the heart. The plate itself always activates on a press
// (see triggerPlatePunch), whether or not he's in this zone; standing
// outside it just means the swing whiffs instead of costing him anything
// (see the matching boundary line in the JSX below). 16 bumped up 15%,
// then back down 15% from there.
const GLOVE_REACH_X = 16 * 1.15 * 0.85;
const STRIKE_MS = 260; // the downswing itself, start to floor
const STRIKE_IMPACT_MS = 170; // how far into that swing the blade actually connects
const SLAM_DAMAGE = 140;
const RETREAT_MS = 700; // walking back out after landing the hit
const PRESSURE_PLATE_X = 93;
const PRESSURE_PLATE_HIT_RADIUS = 6;
// How far left his ordinary shuffling/idle is now allowed to drift —
// exactly to the glove's own reach boundary (the same line GloveRangeZone
// draws, HEART_X + GLOVE_REACH_X), never past it. He used to shuffle no
// closer than KNIGHT_START_X's old neighborhood (58), nowhere near that
// line — letting him actually reach it means the plate can land outside
// of a charge too, not just during one.
const KNIGHT_MIN_X = Math.min(100, HEART_X + GLOVE_REACH_X);
// How far right he's allowed to drift — pulled back from the pressure
// plate's own hit zone (PRESSURE_PLATE_X ± PRESSURE_PLATE_HIT_RADIUS) by
// the tick-damage beam's own HIT_RADIUS on top of that, so aiming to just
// damage him near his rightmost position can never also land on the plate
// as an accidental side effect of the same press.
const KNIGHT_MAX_X = PRESSURE_PLATE_X - PRESSURE_PLATE_HIT_RADIUS - HIT_RADIUS;
const PUNCH_MS = 550;
// How long the plate is locked out after any activation, landed or
// whiffed — otherwise the beam could just be pulled off the plate and
// dropped back on the instant he steps into range.
const PRESSURE_PLATE_COOLDOWN_MS = 2000;
// How long a fresh activation stays "live" waiting for him to actually be
// in reach before it gives up and resolves as a whiff. He's only ever
// inside GLOVE_REACH_X for a sliver of the charge's sprint (eased IN, so
// he's moving fastest right as he crosses into range) — without this
// buffer that window is on the order of a couple of animation frames,
// well under human reaction time, which is what made the plate feel like
// it just didn't work. This widens the window a press can land in without
// resurrecting the old exploit: it's still a small fraction of the
// windup+sprint he takes to actually arrive (CHARGE_WINDUP_MS +
// CHARGE_SPRINT_MS), so parking early and forgetting about it still times
// out long before he ever gets close.
const PLATE_ACTIVATION_BUFFER_MS = 250;

// A duration that reads as erratic rather than a smooth random spread,
// while its long-run average still lands on meanMs — so callers can swap
// this in for a flat `MIN + Math.random() * (MAX - MIN)` draw without
// shifting the total time whatever it's timing ends up adding up to over
// a full fight. Splits 50/50 between a quick roll centered at
// meanMs*(1-spread) and a long roll centered at meanMs*(1+spread) — each
// still jittered within its own regime, not just two fixed numbers — so
// half the time it's a fast flick and half the time a long stretch,
// instead of everything clustering near the middle. The two centers
// average back to exactly meanMs by construction (spread cancels out:
// (1-spread + 1+spread) / 2 = 1).
function erraticDuration(meanMs: number, spread = 0.7) {
  const isQuick = Math.random() < 0.5;
  const base = meanMs * (isQuick ? 1 - spread : 1 + spread);
  const jitter = base * 0.3 * (Math.random() * 2 - 1);
  return Math.max(30, base + jitter);
}

// Where he shuffles to next: half the time a full reposition anywhere in
// his usual range (same as before), half the time just a small twitch off
// wherever he already is (KNIGHT_JITTER_X) — so a "move" doesn't always
// mean a full cross-arena walk, some read as barely settling before
// fidgeting again.
function pickErraticKnightTarget(currentX: number) {
  const reposition = Math.random() < 0.5;
  if (reposition) {
    return KNIGHT_MIN_X + Math.random() * (KNIGHT_MAX_X - KNIGHT_MIN_X);
  }
  const jitter = (Math.random() * 2 - 1) * KNIGHT_JITTER_X;
  return Math.min(KNIGHT_MAX_X, Math.max(KNIGHT_MIN_X, currentX + jitter));
}

export function FightScene() {
  // This mission has its own fixed player marker and preset combat
  // movement, so the room-wide free-roaming snail must not be duplicated.
  useHideCompanionSnail(true);
  const playSound = useSoundEffects();

  const [playerHealth, setPlayerHealth] = useState(MAX_HEALTH);
  const [knightHealth, setKnightHealth] = useState(MAX_HEALTH);
  const [stage, setStage] = useState<Stage>("fighting");
  const [beamX, setBeamX] = useState(50);
  const [shieldPhase, setShieldPhase] = useState<ShieldPhase>("idle");
  const [knightX, setKnightX] = useState(KNIGHT_START_X);
  const [chargePhase, setChargePhase] = useState<ChargePhase>("idle");
  const [showVictory, setShowVictory] = useState(false);
  // Drives the glove's punch animation on a press that's out of
  // GLOVE_REACH_X — a real swing that just doesn't connect, as opposed to
  // chargePhase "punched" (a swing that did). Separate from chargePhase
  // since a whiff has to animate the glove without touching the knight at
  // all.
  const [gloveWhiff, setGloveWhiff] = useState(false);

  const arenaRef = useRef<HTMLDivElement>(null);
  const beamXRef = useRef(beamX);
  const knightXRef = useRef(knightX);
  const knightAnimRef = useRef<number | null>(null);
  const shieldedRef = useRef(false);
  const stageRef = useRef<Stage>(stage);
  const chargePhaseRef = useRef<ChargePhase>(chargePhase);
  // Gates the pressure plate's own cooldown — a plain ref rather than
  // state since nothing needs to re-render off it, the detection effect
  // below just reads it at trigger time.
  const plateCooldownRef = useRef(false);
  const plateCooldownTimerRef = useRef<number | null>(null);
  // Holds the windup→sprint handoff timer so beginCharge's delayed half
  // can be cancelled the same way a running tween already can be.
  const windupTimerRef = useRef<number | null>(null);
  const gloveWhiffTimerRef = useRef<number | null>(null);
  // Tracks whether the beam was already resting on the plate as of the
  // last check, so the detection effect below can fire on the *rising
  // edge* only (the instant the beam arrives on the plate) rather than on
  // every render it happens to still be parked there — see triggerPlatePunch
  // for why that distinction matters.
  const wasOnPlateRef = useRef(false);
  // Drives the short grace window after an out-of-range activation — see
  // armPendingPunch and PLATE_ACTIVATION_BUFFER_MS. A rAF loop rather than
  // a single setTimeout so it can resolve the instant he steps into reach
  // (or the instant the phase becomes ineligible / the beam leaves the
  // plate) instead of only checking once the buffer fully elapses.
  const pendingPunchRafRef = useRef<number | null>(null);

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
      playSound("victory");
      markKnightDefeated();
      // eslint-disable-next-line react-hooks/set-state-in-effect -- re-arms the victory screen for this specific "won" transition (including replays via reset(), which sends stage back to "fighting" first) rather than a one-time mount default.
      setShowVictory(true);
    } else if (stage === "lost") {
      playSound("defeat");
    }
  }, [playSound, stage]);
  useEffect(() => {
    chargePhaseRef.current = chargePhase;
  }, [chargePhase]);

  // Mount-only: clears the plate's cooldown timer, any pending
  // windup→sprint handoff, any in-flight whiff animation, and any armed
  // pending-punch poll if the component unmounts mid-timer, same as
  // knightAnimRef gets cancelled elsewhere.
  useEffect(() => {
    return () => {
      if (plateCooldownTimerRef.current !== null) {
        window.clearTimeout(plateCooldownTimerRef.current);
      }
      if (windupTimerRef.current !== null) {
        window.clearTimeout(windupTimerRef.current);
      }
      if (gloveWhiffTimerRef.current !== null) {
        window.clearTimeout(gloveWhiffTimerRef.current);
      }
      if (pendingPunchRafRef.current !== null) {
        cancelAnimationFrame(pendingPunchRafRef.current);
      }
    };
  }, []);

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
    (target: number, durationMs: number = KNIGHT_MOVE_TRANSITION_MS) => {
      tweenKnightTo(target, durationMs, (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2));
    },
    [tweenKnightTo]
  );

  // Winds the sword up first, stationary (see CHARGE_WINDUP_MS), then
  // hands off into the sprint itself — straight for the heart, eased IN so
  // he's arriving at full speed, flipping directly into the strike the
  // instant he gets there rather than settling into place first.
  const beginCharge = useCallback(() => {
    playSound("boss-roar");
    setChargePhase("windup");
    // Puts the shield away cleanly rather than leaving it visually up
    // (or mid-raise) while he charges — the two attacks don't overlap.
    setShieldPhase("idle");
    windupTimerRef.current = window.setTimeout(() => {
      windupTimerRef.current = null;
      if (stageRef.current !== "fighting") return;
      setChargePhase("charging");
      tweenKnightTo(CHARGE_TARGET_X, CHARGE_SPRINT_MS, (t) => t * t, () => {
        setChargePhase("striking");
      });
    }, CHARGE_WINDUP_MS);
  }, [playSound, tweenKnightTo]);

  // The pressure-plate interrupt: launches him back out to his normal
  // range, fast in and settling — a real knockback, not just a fade.
  const triggerPunch = useCallback(() => {
    playSound("punch");
    setChargePhase("punched");
    tweenKnightTo(KNIGHT_MAX_X, PUNCH_MS, (t) => 1 - Math.pow(1 - t, 3), () => {
      setChargePhase("idle");
    });
  }, [playSound, tweenKnightTo]);

  // The plate-side wrapper around triggerPunch. Only ever called on a
  // fresh activation edge (the beam just arriving on the plate — see the
  // detection effect below), so every call here starts the cooldown,
  // landed or not: activating the plate is what costs you the 2s, not
  // just landing the hit. That's what stops the beam being parked on the
  // plate and camped through — an activation while he's out of range is a
  // real whiff that burns the cooldown just the same, so the only way to
  // land the punch is to actually bring the beam onto the plate at a
  // moment he's already within GLOVE_REACH_X.
  const triggerPlatePunch = useCallback(
    (landed: boolean) => {
      playSound("plate");
      plateCooldownRef.current = true;
      plateCooldownTimerRef.current = window.setTimeout(() => {
        plateCooldownRef.current = false;
        plateCooldownTimerRef.current = null;
      }, PRESSURE_PLATE_COOLDOWN_MS);
      if (landed) {
        triggerPunch();
      } else {
        setGloveWhiff(true);
        gloveWhiffTimerRef.current = window.setTimeout(() => {
          setGloveWhiff(false);
          gloveWhiffTimerRef.current = null;
        }, PUNCH_MS);
      }
    },
    [playSound, triggerPunch]
  );

  // Keeps a fresh, out-of-range activation "live" for PLATE_ACTIVATION_BUFFER_MS
  // instead of resolving it as a whiff immediately — polled every frame via
  // rAF (reading the same refs the tweens already keep current) rather than
  // relying on beamX/knightX to keep re-triggering the detection effect,
  // since knightX stops changing entirely between shuffles and would
  // otherwise leave this stuck waiting forever. Resolves landed the instant
  // he steps into GLOVE_REACH_X; resolves whiffed the instant the beam
  // leaves the plate, the phase becomes uninterruptible (striking/
  // recovering/punched), or the buffer simply runs out first.
  const armPendingPunch = useCallback(() => {
    const deadline = performance.now() + PLATE_ACTIVATION_BUFFER_MS;
    function poll() {
      if (stageRef.current !== "fighting") {
        pendingPunchRafRef.current = null;
        return;
      }
      const stillOnPlate = Math.abs(beamXRef.current - PRESSURE_PLATE_X) <= PRESSURE_PLATE_HIT_RADIUS;
      const phase = chargePhaseRef.current;
      const uninterruptible = phase === "striking" || phase === "recovering" || phase === "punched";
      if (!stillOnPlate || uninterruptible) {
        pendingPunchRafRef.current = null;
        triggerPlatePunch(false);
        return;
      }
      const inReach = Math.abs(knightXRef.current - HEART_X) <= GLOVE_REACH_X;
      if (inReach) {
        pendingPunchRafRef.current = null;
        triggerPlatePunch(true);
        return;
      }
      if (performance.now() >= deadline) {
        pendingPunchRafRef.current = null;
        triggerPlatePunch(false);
        return;
      }
      pendingPunchRafRef.current = requestAnimationFrame(poll);
    }
    pendingPunchRafRef.current = requestAnimationFrame(poll);
  }, [triggerPlatePunch]);

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
  // it's actually up and able to deflect the beam. Both the gap between
  // raises and how long each one stays up now come from erraticDuration
  // rather than a flat spread — see SHIELD_COOLDOWN_MEAN_MS/
  // SHIELD_ACTIVE_MEAN_MS above for why the same long-run averages (same
  // total time blocking over a fight) survive even though individual
  // gaps/bursts now swing much wider.
  useEffect(() => {
    if (stage !== "fighting") return;
    let telegraphTimer: number;
    let activeTimer: number;
    let lowerTimer: number;
    let cooldownTimer: number;

    function scheduleNext() {
      const delay = erraticDuration(SHIELD_COOLDOWN_MEAN_MS);
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
          playSound("shield");
          const activeMs = erraticDuration(SHIELD_ACTIVE_MEAN_MS);
          activeTimer = window.setTimeout(() => {
            if (stageRef.current !== "fighting") return;
            setShieldPhase("lowering");
            lowerTimer = window.setTimeout(() => {
              if (stageRef.current !== "fighting") return;
              setShieldPhase("idle");
              scheduleNext();
            }, SHIELD_LOWER_MS);
          }, activeMs);
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
  }, [playSound, stage]);

  // The knight shuffles side to side at random, as if trying to dodge out
  // from under the beam — erratic pacing and target (see erraticDuration
  // and pickErraticKnightTarget for how *when* he moves and *where* he
  // goes stay unpredictable: quick flick or long/large stretch, not
  // something comfortably in between), but a smooth, fixed-speed glide
  // between those random points (animateKnightTo with no erratic duration
  // of its own) — variable glide speed used to make the motion itself
  // read as jerky/teleport-y rather than erratic, so the randomness stays
  // in the scheduling and destination only.
  useEffect(() => {
    if (stage !== "fighting") return;
    let moveTimer: number;

    function scheduleMove() {
      const delay = erraticDuration(KNIGHT_MOVE_MEAN_MS);
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
        animateKnightTo(pickErraticKnightTarget(knightXRef.current));
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
        playSound("player-hit");
        setPlayerHealth((h) => {
          const next = Math.max(0, h - PLAYER_TICK_DAMAGE);
          if (next <= 0) setStage("lost");
          return next;
        });
      } else {
        playSound("enemy-hit");
        setKnightHealth((h) => {
          const next = Math.max(0, h - KNIGHT_TICK_DAMAGE);
          if (next <= 0) setStage("won");
          return next;
        });
      }
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [playSound, stage]);

  // The charge attack's own cooldown cycle — independent of the shield's,
  // so the two can't line up predictably. Driven off chargePhase itself
  // rather than a self-contained recursive scheduler (contrast the
  // shield's own cycle above): whenever it's back to "idle" — the very
  // first render, or after a punch/retreat tween lands and resets it —
  // this effect re-fires and queues up the next cooldown from there.
  useEffect(() => {
    if (stage !== "fighting" || chargePhase !== "idle") return;
    let retryTimer: number;

    // Guards the actual start of the charge — see CHARGE_START_MARGIN_X:
    // too close to the glove's own reach line already (his idle shuffling
    // can now bring him right up against it) and the sprint would carry
    // him across that line almost immediately, with no fair "he's just
    // now crossing" moment for the plate. Simplest fix is just to wait and
    // check again rather than starting the charge from there — he keeps
    // idling normally in the meantime.
    function attemptCharge() {
      if (stageRef.current !== "fighting") return;
      if (knightXRef.current <= KNIGHT_MIN_X + CHARGE_START_MARGIN_X) {
        retryTimer = window.setTimeout(attemptCharge, CHARGE_START_RETRY_MS);
        return;
      }
      beginCharge();
    }

    const delay = CHARGE_COOLDOWN_MIN_MS + Math.random() * (CHARGE_COOLDOWN_MAX_MS - CHARGE_COOLDOWN_MIN_MS);
    const cooldownTimer = window.setTimeout(attemptCharge, delay);
    return () => {
      window.clearTimeout(cooldownTimer);
      window.clearTimeout(retryTimer);
    };
  }, [stage, chargePhase, beginCharge]);

  // The strike itself: the blade connects partway through the downswing
  // (STRIKE_IMPACT_MS), dealing its one big hit, then once the swing's
  // fully played out he starts walking back out.
  useEffect(() => {
    if (chargePhase !== "striking") return;
    const impactTimer = window.setTimeout(() => {
      if (stageRef.current !== "fighting") return;
      playSound("player-hit");
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
  }, [chargePhase, playSound]);

  // Walks him back out once the hit's actually landed.
  useEffect(() => {
    if (chargePhase !== "recovering") return;
    retreat();
  }, [chargePhase, retreat]);

  // The pressure-plate interrupt — fires once on the rising edge of the
  // beam landing on the plate, not on every render it happens to still be
  // resting there. Parking the beam on the plate *before* he's in range,
  // then leaving it there while he walks into GLOVE_REACH_X, doesn't knock
  // him back for free — an activation that isn't already in range instead
  // goes through armPendingPunch, which gives it a short buffer
  // (PLATE_ACTIVATION_BUFFER_MS) to actually catch him arriving rather
  // than resolving dead on the spot. That's what keeps this from just
  // being "camp the plate and wait" again: the buffer is a fraction of the
  // full windup+sprint he takes to get there, so an early press still
  // times out long before he's anywhere close — it only helps a press
  // that's already roughly on time.
  //
  // wasOnPlateRef always gets updated so the edge is tracked accurately
  // even on ticks where the activation itself is suppressed below (stage
  // not fighting, an ineligible chargePhase, or the plate still on
  // cooldown) — an activation attempt that gets swallowed for any of
  // those reasons still needs the beam to leave and return before it can
  // try again, same as a normal successful one.
  useEffect(() => {
    if (stage !== "fighting") {
      wasOnPlateRef.current = false;
      return;
    }
    const onPlate = Math.abs(beamX - PRESSURE_PLATE_X) <= PRESSURE_PLATE_HIT_RADIUS;
    const isEdge = onPlate && !wasOnPlateRef.current;
    wasOnPlateRef.current = onPlate;
    if (!isEdge) return;
    if (chargePhase === "striking" || chargePhase === "recovering" || chargePhase === "punched") return;
    if (plateCooldownRef.current) return;
    const inGloveReach = Math.abs(knightX - HEART_X) <= GLOVE_REACH_X;
    if (inGloveReach) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberately synchronous: this is the "already in range the instant the beam lands" case, and the whole point is for the knockback to read as instant rather than trailing a tick behind the press.
      triggerPlatePunch(true);
    } else {
      armPendingPunch();
    }
  }, [beamX, knightX, chargePhase, stage, triggerPlatePunch, armPendingPunch]);

  function reset() {
    if (knightAnimRef.current !== null) {
      cancelAnimationFrame(knightAnimRef.current);
      knightAnimRef.current = null;
    }
    if (plateCooldownTimerRef.current !== null) {
      window.clearTimeout(plateCooldownTimerRef.current);
      plateCooldownTimerRef.current = null;
    }
    if (windupTimerRef.current !== null) {
      window.clearTimeout(windupTimerRef.current);
      windupTimerRef.current = null;
    }
    if (gloveWhiffTimerRef.current !== null) {
      window.clearTimeout(gloveWhiffTimerRef.current);
      gloveWhiffTimerRef.current = null;
    }
    if (pendingPunchRafRef.current !== null) {
      cancelAnimationFrame(pendingPunchRafRef.current);
      pendingPunchRafRef.current = null;
    }
    plateCooldownRef.current = false;
    wasOnPlateRef.current = false;
    setGloveWhiff(false);
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
  // Raised through both the windup (rising, stationary) and the sprint
  // that follows (already up, held overhead), swung down for the brief
  // strike itself, and back to resting for everything else — recovering
  // after a landed hit and staggering after a punch both just drop it
  // back down.
  const swordPhase: SwordPhase =
    chargePhase === "windup" || chargePhase === "charging"
      ? "raised"
      : chargePhase === "striking"
        ? "slamming"
        : "rest";

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

        {/* the player is represented by an anatomical heart mounted on the
            wall rather than a standing figure */}
        <div
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${HEART_X}%`, top: `${DEFLECT_Y}%` }}
        >
          <Heart hit={deflecting || chargePhase === "striking"} />
        </div>

        {/* the glove's reach boundary, marked with a faint vertical line —
            the plate can be pressed any time, but it only actually lands
            the punch while the knight's feet are left of this line
            (GLOVE_REACH_X); drawn before the knight/plate/glove so they
            render on top of it rather than under. */}
        <GloveRangeZone x={HEART_X} reach={GLOVE_REACH_X} />

        {/* the pressure plate — steppable any time, from anywhere in the
            arena, subject only to its own cooldown (see
            PRESSURE_PLATE_COOLDOWN_MS) — but see GloveRangeZone above for
            what actually has to be true for that to do anything. Lights
            up through the whole windup+sprint so there's some ambient
            sense of when it matters most, even though it's not the only
            time it works. */}
        <PressurePlate
          x={PRESSURE_PLATE_X}
          armed={chargePhase === "windup" || chargePhase === "charging"}
        />

        {/* the boxing glove rests just beyond the heart's front edge, then
            throws a punch when the plate is stepped on: chargePhase
            "punched" is a swing
            that actually caught him, gloveWhiff is one that didn't reach
            because he was outside GLOVE_REACH_X. Its reach is passed
            straight through so the punch's tip always travels exactly as
            far as the boundary line (GloveRangeZone above) marks, landed
            or not — the whiff just throws the same full-distance punch
            into empty air. */}
        <BoxingGlove
          x={HEART_X}
          y={DEFLECT_Y}
          reach={GLOVE_REACH_X}
          punching={chargePhase === "punched" || gloveWhiff}
        />

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
        <VictoryScreen
          title="The Knight Yields"
          rewardRarity="rare"
          itemName="Knight's Necklace"
          itemIcon={<NecklaceIcon color="#9aa5ad" size={56} />}
          onReveal={grantKnightVictoryLoot}
          onClose={() => setShowVictory(false)}
        />
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
  const glow = hit
    ? "drop-shadow(0 0 8px #ff5c5c) drop-shadow(0 0 16px rgba(255,92,92,0.7))"
    : "drop-shadow(0 0 5px rgba(138,31,31,0.65))";

  return (
    <svg
      width="48"
      height="58"
      viewBox="0 0 48 58"
      aria-label="Player heart"
      className="overflow-visible transition-[filter] duration-150"
      style={{ filter: glow }}
    >
      {/* Great vessels */}
      <path d="M28 16 C27 9 29 4 35 2 L40 7 C35 9 34 13 35 18" fill="#b52d32" stroke="#64131b" strokeWidth="2" />
      <path d="M20 16 C18 10 14 7 10 7 L9 14 C13 14 15 17 16 21" fill="#7f242d" stroke="#56121a" strokeWidth="2" />
      <path d="M24 15 C22 8 23 4 27 1 L31 5 C28 8 29 12 30 16" fill="#d44a45" stroke="#6d171b" strokeWidth="2" />

      {/* Atria and ventricles form an asymmetric anatomical silhouette. */}
      <path
        d="M23 14 C17 10 10 12 7 18 C3 25 6 35 12 41 C16 46 20 52 23 57 C27 53 31 49 36 44 C43 37 46 28 42 20 C39 14 33 12 28 16 C26 14 25 13 23 14 Z"
        fill={hit ? "#ff5c5c" : "#98252b"}
        stroke="#581119"
        strokeWidth="2"
      />
      <path d="M25 17 C31 20 34 27 33 35 C32 43 27 49 23 55" fill="none" stroke="#d84b4d" strokeWidth="2.5" opacity="0.8" />
      <path d="M11 21 C15 18 19 19 21 23 C18 25 15 28 14 33" fill="none" stroke="#6e1922" strokeWidth="2" />
      <path d="M35 20 C39 24 39 30 37 35" fill="none" stroke="#f0786f" strokeWidth="1.6" opacity="0.65" />
    </svg>
  );
}

// A faint vertical line marking the far edge of the glove's reach — purely
// informational (nothing reacts to it directly), so the player can see at
// a glance how far right the knight can be standing and still get caught
// by the pressure plate, rather than having to infer it from trial and
// error. Only the far edge is drawn: the near edge (x - reach) sits behind
// the left wall at this reach, so there's nothing to mark there. Kept
// low-contrast and unlit (no glow) so it reads as a subtle boundary rather
// than a warning stripe.
function GloveRangeZone({ x, reach }: { x: number; reach: number }) {
  const boundary = Math.min(100, x + reach);
  return (
    <div
      className="absolute inset-y-0 w-px"
      style={{
        left: `${boundary}%`,
        background:
          "linear-gradient(180deg, rgba(255,120,120,0) 0%, rgba(255,120,120,0.16) 20%, rgba(255,120,120,0.16) 85%, rgba(255,120,120,0) 100%)",
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

// Resting just beyond the heart's front edge, the glove punches straight out
// to exactly the reach
// boundary (the same GLOVE_REACH_X line drawn by GloveRangeZone), landed
// or whiffed, then retracts again. `left` itself (not a fixed-px
// transform) is what animates between resting and extended, so the fist's
// tip always travels the true reach distance in real arena pixels — a
// percentage of the actual container width, same as the boundary line —
// rather than some arbitrary short jab that reads as shorter than the
// range it's supposed to represent.
function BoxingGlove({
  x,
  y,
  reach,
  punching,
}: {
  x: number;
  y: number;
  reach: number;
  punching: boolean;
}) {
  const restLeft = x;
  const extendedLeft = Math.min(100, x + reach);
  return (
    <div
      className="absolute z-20 -translate-y-1/2 transition-[left,transform] ease-out"
      style={{
        left: `${punching ? extendedLeft : restLeft}%`,
        top: `${y}%`,
        // At rest the cuff clears the heart's right edge entirely. During
        // a punch its tip is anchored to `left`, so it still lands exactly
        // on the range boundary.
        transform: punching
          ? "translateX(-100%) scale(1) rotate(0deg)"
          : "translateX(28px) scale(0.72) rotate(-4deg)",
        transformOrigin: punching ? "right center" : "left center",
        transitionDuration: punching ? "180ms" : "260ms",
      }}
    >
      <svg
        width="52"
        height="38"
        viewBox="0 0 52 38"
        aria-label="Boxing glove"
        className="overflow-visible"
        style={{ filter: "drop-shadow(0 0 7px rgba(255,77,77,0.72))" }}
      >
        {/* Wide wrist cuff makes the silhouette read as a glove, not a fist. */}
        <path d="M1 10 H17 V34 H1 Z" fill="#8d1712" stroke="#5d0d09" strokeWidth="2" />
        <path d="M4 12 H14 V32 H4 Z" fill="#d33428" />
        <path d="M5 15 H14" stroke="#ff8a76" strokeWidth="2" opacity="0.7" />

        {/* Padded knuckle section. */}
        <path
          d="M14 19 C12 11 17 4 27 2 C35 0 44 2 48 8 C53 15 49 24 42 27 C41 33 36 37 29 37 H23 C16 37 11 33 11 27 C11 23 12 21 14 19 Z"
          fill="#d63227"
          stroke="#6e100b"
          strokeWidth="2"
        />
        <path
          d="M22 5 C29 2 39 3 44 7 C47 9 48 12 48 15"
          fill="none"
          stroke="#ff7969"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.75"
        />

        {/* Folded thumb and its seam separate it from the knuckle pad. */}
        <path
          d="M22 18 C16 17 12 20 12 25 C12 30 16 33 21 33 C25 33 28 30 28 26 C28 22 26 19 22 18 Z"
          fill="#b9231b"
          stroke="#6e100b"
          strokeWidth="2"
        />
        <path d="M24 19 C28 22 29 27 26 31" fill="none" stroke="#f45b4d" strokeWidth="1.5" opacity="0.8" />
      </svg>
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
