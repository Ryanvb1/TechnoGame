"use client";

import { useEffect, useRef, useState } from "react";
import { Throne } from "./Throne";
import { Knight, KnightReplayTrigger } from "./Knight";
import { Molotov } from "./Molotov";
import { BossFightStartMenu } from "./BossFightStartMenu";
import { ThroneHallBackground, type BeamShot, type PillarFightState } from "./ThroneHallBackground";
import { ThroneApproachFootsteps } from "./ThroneApproachFootsteps";
import { DefeatProgressBar } from "./DefeatProgressBar";
import { ReplayMissionButton } from "./ReplayMissionButton";
import { VictoryScreen } from "./VictoryScreen";
import { RainbowShellIcon } from "./RainbowShellIcon";
import { addToInventory } from "./inventory";
import { readKnightDefeated, readToadDefeated, markToadDefeated } from "./throneState";
import { useHideCompanionSnail } from "./companionSnail";
import {
  BEAM_TRAVEL_MS,
  PILLAR_COLORS,
  REFLECT_TRAVEL_MS,
  SLIME_DURATION_MS,
  SNAIL_MAX_TRAVEL_MS,
  SNAIL_MIN_TRAVEL_MS,
  SNAIL_SPEED_PX_PER_MS,
  advancePillarRotation,
  colorForPillar,
  pillarForColor,
  readPillarRotation,
} from "./pillarColors";

// "briefing" sits between the footsteps finishing and the molotov becoming
// throwable — the toad's already risen by then, but the boss-fight start
// menu gates actually being able to act on him until it's dismissed.
type Sequence = "idle" | "approaching" | "briefing" | "revealed" | "angry" | "fighting" | "won" | "lost";

const SNAIL_ENTRANCE_DELAY_MS = 900;
const BUBBLE_HOLD_MS = 1600;
const ANGRY_INTRO_MS = 2800;
// The instant the beam lands, a pillar that isn't already slimed gets one
// last window to be saved before it's locked in — slime applied anywhere
// inside this buffer still counts, but once it expires the pillar catches
// and nothing (not even slime applied a moment later) can save it anymore.
// This is a single hard checkpoint, deliberately not re-checked again once
// the fire's actually up — see the fight effect below for why that overlap
// used to let a too-late slime still get credited as a reflect.
const SLIME_BUFFER_MS = 1000;
// Once the buffer above has expired without a save, the pillar is already
// doomed — this is purely the cosmetic delay before the fire visual gives
// way to the burned/destroyed state, not a second chance.
const FIRE_BURN_MS = 1500;
// Travel + hold + fade, matching (with a little slack) the beam-grow /
// beam-fade-out timings in ThroneHallBackground so state doesn't clear the
// beam element mid-fade.
const BEAM_VISIBLE_MS = BEAM_TRAVEL_MS + 450;
const REFLECT_VISIBLE_MS = REFLECT_TRAVEL_MS + 400;
// The wind-up before the toad actually strikes a pillar — applies to the
// very first attack as much as every one after a reflect, so the pace
// never suddenly snaps back to instant. This (plus FIRE_BURN_MS above) is
// "the toad's attack speed": long enough to actually think about which
// base to slime next, not just react to whichever one is already on fire.
const ATTACK_DELAY_MS = 5000;
const LOSE_PAUSE_MS = 900; // lets the burn read before the defeat screen appears
const DEFEAT_DISPLAY_MS = 3200; // how long "Defeat" holds before auto-resetting to idle
// Matches ToadBoss.tsx's own "toad-rise" animation duration — the briefing
// menu waits this long before appearing so it never overlaps him still
// cresting into view.
const TOAD_RISE_MS = 4500;
const TOAD_MAX_HEALTH = PILLAR_COLORS.length;

function emptyPillarStatuses(): PillarFightState[] {
  return Array.from({ length: PILLAR_COLORS.length }, () => ({ status: "pending" as const }));
}

export function ThroneRoomScene() {
  // Server-rendered HTML always assumes the knight hasn't been defeated yet
  // (no localStorage on the server); this effect syncs in the real value
  // right after mount, same pattern as the rest of the site's progress state.
  const [knightDefeated, setKnightDefeated] = useState(false);
  // Same reasoning as knightDefeated above — persisted across visits so a
  // Replay Toad trigger (see below) can show up without the player having
  // to re-win within the same page session first.
  const [toadDefeated, setToadDefeated] = useState(false);
  const [sequence, setSequence] = useState<Sequence>("idle");
  const [pillarRotation, setPillarRotation] = useState(0);
  const [pillarStatuses, setPillarStatuses] = useState<PillarFightState[]>(emptyPillarStatuses());
  const [molotovThrown, setMolotovThrown] = useState(false);
  const [molotovTarget, setMolotovTarget] = useState<{ dx: number; dy: number } | null>(null);
  const [snailRevealed, setSnailRevealed] = useState(false);
  const [snailBubble, setSnailBubble] = useState(false);
  const [toadHealth, setToadHealth] = useState(TOAD_MAX_HEALTH);
  const [toadHit, setToadHit] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [toadRisen, setToadRisen] = useState(false);
  const [slimeActive, setSlimeActive] = useState<boolean[]>(() => Array(PILLAR_COLORS.length).fill(false));
  const [snailPos, setSnailPos] = useState<number | null>(null);
  const [snailTravelMs, setSnailTravelMs] = useState(SNAIL_MIN_TRAVEL_MS);
  const [beamShot, setBeamShot] = useState<BeamShot | null>(null);
  const [reflectShot, setReflectShot] = useState<BeamShot | null>(null);
  const [pillarColorsChanged, setPillarColorsChanged] = useState(false);

  const pillarRotationRef = useRef(0);
  // Skips the pop on the very first render's rotation sync (there's
  // nothing for the player to compare it against yet) so it only fires on
  // rotations that happen live, in front of them — see the effect below.
  const pillarRotationMountedRef = useRef(false);
  const slimeActiveRef = useRef<boolean[]>(slimeActive);
  const snailTravelingRef = useRef(false);
  const introTimers = useRef<number[]>([]);
  const snailTimers = useRef<number[]>([]);
  const slimeExpireTimers = useRef<(number | null)[]>(Array(PILLAR_COLORS.length).fill(null));
  const molotovOriginRef = useRef<HTMLDivElement>(null);
  const toadMouthRef = useRef<HTMLDivElement>(null);
  const snailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage, an external store the server can't see; see comment above.
    setKnightDefeated(readKnightDefeated());
    setToadDefeated(readToadDefeated());
    setPillarRotation(readPillarRotation());
  }, []);

  // Borrows the player's own companion snail (see LocationSnail) for the
  // fight's pillar-dousing ally rather than having two independent snails
  // on screen at once — hidden for exactly as long as SnailAgent (rendered
  // by ThroneHallBackground below) is revealed.
  useHideCompanionSnail(snailRevealed);

  useEffect(() => {
    pillarRotationRef.current = pillarRotation;
  }, [pillarRotation]);

  // Re-arms the victory screen for this specific "won" transition —
  // including replays, since the ReplayMissionButton above sends sequence
  // back through "briefing"/"fighting" before it can become "won" again.
  useEffect(() => {
    if (sequence !== "won") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- re-arms the victory screen for this specific "won" transition (including replays, which route back through "briefing"/"fighting" first), not a one-time mount default.
    setShowVictory(true);
    setToadDefeated(true);
    markToadDefeated();
  }, [sequence]);

  // Every rotation after the first re-shuffles which star sits on which
  // pillar (a retreat or a burned pillar both advance it) — pulse every
  // star for a beat so that change actually registers with the player
  // instead of silently landing between fights.
  useEffect(() => {
    if (!pillarRotationMountedRef.current) {
      pillarRotationMountedRef.current = true;
      return;
    }
    setPillarColorsChanged(true);
    const timer = window.setTimeout(() => setPillarColorsChanged(false), 1000);
    return () => window.clearTimeout(timer);
  }, [pillarRotation]);

  // Read at the exact moments the fight sequence effect below needs to
  // check for slime (a click-triggered React state update elsewhere would
  // otherwise be stale inside that effect's closures).
  useEffect(() => {
    slimeActiveRef.current = slimeActive;
  }, [slimeActive]);

  // Clear any pending intro/snail/slime timers on unmount so they can't
  // fire state updates after the fact. These refs are mutable accumulators
  // (timer IDs get pushed onto them well after this effect first runs),
  // not DOM nodes — the cleanup deliberately reads whatever's in them *at
  // unmount time*, not a snapshot from mount, so capturing `.current` up
  // front would clear stale empty arrays instead.
  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps -- see comment above.
      introTimers.current.forEach((id) => window.clearTimeout(id));
      snailTimers.current.forEach((id) => window.clearTimeout(id));
      slimeExpireTimers.current.forEach((id) => id && window.clearTimeout(id));
    };
  }, []);

  function handleApproach() {
    if (sequence !== "idle") return;
    setSequence("approaching");
  }

  function handleMolotovClick() {
    if (sequence !== "revealed") return;
    const origin = molotovOriginRef.current;
    const mouth = toadMouthRef.current;
    if (origin && mouth) {
      const originRect = origin.getBoundingClientRect();
      const mouthRect = mouth.getBoundingClientRect();
      setMolotovTarget({
        dx: mouthRect.left + mouthRect.width / 2 - (originRect.left + originRect.width / 2),
        dy: mouthRect.top + mouthRect.height / 2 - (originRect.top + originRect.height / 2),
      });
    }
    setMolotovThrown(true);
    setSequence("angry");
    introTimers.current.push(
      window.setTimeout(() => {
        setSnailRevealed(true);
        setSnailBubble(true);
      }, SNAIL_ENTRANCE_DELAY_MS),
      window.setTimeout(() => setSnailBubble(false), SNAIL_ENTRANCE_DELAY_MS + BUBBLE_HOLD_MS),
      window.setTimeout(() => {
        setPillarStatuses(emptyPillarStatuses());
        setToadHealth(TOAD_MAX_HEALTH);
        setSlimeActive(Array(PILLAR_COLORS.length).fill(false));
        setSequence("fighting");
      }, ANGRY_INTRO_MS)
    );
  }

  // Applies (or refreshes) slime at a pillar's base, resetting its
  // independent 5s countdown regardless of whether it was already active.
  function applySlime(position: number) {
    setSlimeActive((prev) => {
      const next = [...prev];
      next[position] = true;
      return next;
    });
    const prevTimer = slimeExpireTimers.current[position];
    if (prevTimer) window.clearTimeout(prevTimer);
    slimeExpireTimers.current[position] = window.setTimeout(() => {
      setSlimeActive((prev) => {
        const next = [...prev];
        next[position] = false;
        return next;
      });
      slimeExpireTimers.current[position] = null;
    }, SLIME_DURATION_MS);
  }

  // How long the crawl to a given on-screen point should take, based on
  // the snail's actual current position — the two live in unrelated
  // layout containers (see pillarBaseXY's comment in ThroneHallBackground)
  // so there's no shared percentage space to compute this from; real
  // measured pixels are the only reliable common ground.
  function computeTravelMs(basePoint: { x: number; y: number }): number {
    const snailEl = snailRef.current;
    if (!snailEl) return SNAIL_MIN_TRAVEL_MS;
    const snailRect = snailEl.getBoundingClientRect();
    const dx = basePoint.x - (snailRect.left + snailRect.width / 2);
    const dy = basePoint.y - snailRect.bottom;
    const distance = Math.hypot(dx, dy);
    const ms = Math.round(distance / SNAIL_SPEED_PX_PER_MS);
    return Math.min(SNAIL_MAX_TRAVEL_MS, Math.max(SNAIL_MIN_TRAVEL_MS, ms));
  }

  // Sends the snail crawling to a pillar's base; once he arrives he lays
  // the slime himself. Only one trip at a time — a pillar clicked while
  // he's already en route elsewhere is ignored until he's free again.
  function dispatchSnail(position: number, basePoint: { x: number; y: number }) {
    if (snailPos === position) {
      if (!snailTravelingRef.current) applySlime(position);
      return;
    }
    if (snailTravelingRef.current) return;
    const travelMs = computeTravelMs(basePoint);
    snailTravelingRef.current = true;
    setSnailTravelMs(travelMs);
    setSnailPos(position);
    const travelTimer = window.setTimeout(() => {
      snailTravelingRef.current = false;
      applySlime(position);
    }, travelMs);
    snailTimers.current.push(travelTimer);
  }

  function handlePillarClick(position: number, basePoint: { x: number; y: number }) {
    if (sequence !== "fighting") return;
    const status = pillarStatuses[position]?.status;
    if (status === "saved" || status === "burned") return;
    dispatchSnail(position, basePoint);
  }

  function resetEncounter() {
    setPillarStatuses(emptyPillarStatuses());
    setToadHealth(TOAD_MAX_HEALTH);
    setToadHit(false);
    setSlimeActive(Array(PILLAR_COLORS.length).fill(false));
    setSnailPos(null);
    setBeamShot(null);
    setReflectShot(null);
    setMolotovThrown(false);
    setMolotovTarget(null);
    setSnailRevealed(false);
    setSnailBubble(false);
    setSequence("idle");

    snailTravelingRef.current = false;
    snailTimers.current.forEach((id) => window.clearTimeout(id));
    snailTimers.current = [];
    slimeExpireTimers.current.forEach((id) => id && window.clearTimeout(id));
    slimeExpireTimers.current = Array(PILLAR_COLORS.length).fill(null);
  }

  function handleRetreat() {
    advancePillarRotation();
    setPillarRotation(readPillarRotation());
    resetEncounter();
  }

  // Straight back to the briefing, not straight back into the fight — same
  // as every other mission's replay trigger. resetEncounter() clears the
  // just-finished fight's state (toad health, pillar statuses, slime, ...);
  // the setSequence right after overrides the "idle" it lands on, in the
  // same batch, so this ends up at "briefing" with everything else already
  // fresh. Shared by both the persisted top-of-screen trigger (shown on any
  // later visit once the toad's already been beaten) and the one shown
  // right after a fresh win.
  function replayToad() {
    resetEncounter();
    setSequence("briefing");
  }

  // Owns the whole fight: targets colors in order, fires a beam at each
  // pillar, and checks for slime at two points — right as the beam lands,
  // and again at the end of the SLIME_BUFFER_MS grace window — so both a
  // pre-slimed pillar and one slimed reactively in that last second count
  // as a reflect. Past that second checkpoint the pillar is locked in as
  // burned regardless of anything slimed afterward (no third check) — a
  // single burn ends the fight immediately (no playing out the rest of a
  // fight that's already lost); reaching the far end of the color order
  // therefore always means every pillar was reflected.
  useEffect(() => {
    if (sequence !== "fighting") return;
    let cancelled = false;
    let impactTimer: number;
    let bufferTimer: number;
    let burnTimer: number;
    let beamClearTimer: number;
    let reflectClearTimer: number;
    let advanceTimer: number;
    let loseTimer: number;

    function targetColor(colorIndex: number) {
      if (cancelled) return;
      if (colorIndex >= PILLAR_COLORS.length) {
        setSequence("won");
        return;
      }
      const position = pillarForColor(colorIndex, pillarRotationRef.current);

      setPillarStatuses((prev) => {
        const next = [...prev];
        next[position] = { status: "targeted" };
        return next;
      });
      setBeamShot({ position, key: colorIndex });
      beamClearTimer = window.setTimeout(() => {
        if (!cancelled) setBeamShot(null);
      }, BEAM_VISIBLE_MS);

      let settled = false;
      function resolve(reflected: boolean) {
        if (settled) return;
        settled = true;
        window.clearTimeout(impactTimer);
        window.clearTimeout(bufferTimer);
        window.clearTimeout(burnTimer);
        if (reflected) {
          setToadHealth((h) => Math.max(0, h - 1));
          setPillarStatuses((prev) => {
            const next = [...prev];
            next[position] = { status: "saved" };
            return next;
          });
          setReflectShot({ position, key: colorIndex });
          setToadHit(true);
          reflectClearTimer = window.setTimeout(() => {
            if (cancelled) return;
            setReflectShot(null);
            setToadHit(false);
          }, REFLECT_VISIBLE_MS);
          advanceTimer = window.setTimeout(() => targetColor(colorIndex + 1), ATTACK_DELAY_MS);
        } else {
          setPillarStatuses((prev) => {
            const next = [...prev];
            next[position] = { status: "burned" };
            return next;
          });
          advancePillarRotation();
          setPillarRotation(readPillarRotation());
          loseTimer = window.setTimeout(() => {
            if (!cancelled) setSequence("lost");
          }, LOSE_PAUSE_MS);
        }
      }

      impactTimer = window.setTimeout(() => {
        if (cancelled) return;
        if (slimeActiveRef.current[position]) {
          resolve(true);
          return;
        }
        // Not slimed the instant the beam lands — one last second before
        // it's locked in, still not visibly on fire yet so the player
        // isn't reacting to a lie.
        bufferTimer = window.setTimeout(() => {
          if (cancelled) return;
          if (slimeActiveRef.current[position]) {
            resolve(true);
            return;
          }
          // The buffer's up — catches now, and it's already doomed. The
          // fire visual below is purely cosmetic from here: nothing
          // slimed after this point gets a further check.
          setPillarStatuses((prev) => {
            const next = [...prev];
            next[position] = { status: "burning" };
            return next;
          });
          burnTimer = window.setTimeout(() => {
            if (!cancelled) resolve(false);
          }, FIRE_BURN_MS);
        }, SLIME_BUFFER_MS);
      }, BEAM_TRAVEL_MS);
    }

    // Same wind-up as every later attack — he doesn't strike the instant
    // the fight starts, so the player has a beat to get oriented first.
    const startTimer = window.setTimeout(() => targetColor(0), ATTACK_DELAY_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(startTimer);
      window.clearTimeout(impactTimer);
      window.clearTimeout(bufferTimer);
      window.clearTimeout(burnTimer);
      window.clearTimeout(beamClearTimer);
      window.clearTimeout(reflectClearTimer);
      window.clearTimeout(advanceTimer);
      window.clearTimeout(loseTimer);
    };
  }, [sequence]);

  // Defeat isn't a dead end the player has to click out of — the whole
  // encounter resets itself back to "approach the throne again" once the
  // Defeat screen has had its moment.
  useEffect(() => {
    if (sequence !== "lost") return;
    const timer = window.setTimeout(() => resetEncounter(), DEFEAT_DISPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [sequence]);

  // He stays put through defeat rather than vanishing the instant a
  // pillar falls — the Defeat screen reads as "frozen mid-fight", not as
  // the boss having already retreated. He also stays visible (now sunk)
  // through "won" rather than popping out the instant his health hits
  // zero — see toadDead below for why that moment comes well before the
  // sequence itself advances to "won".
  const showToadBoss =
    sequence === "briefing" ||
    sequence === "revealed" ||
    sequence === "angry" ||
    sequence === "fighting" ||
    sequence === "won" ||
    sequence === "lost";
  const pillarColors = knightDefeated
    ? Array.from({ length: PILLAR_COLORS.length }, (_, i) => colorForPillar(i, pillarRotation))
    : undefined;

  // Tracks the toad's own rise animation (see ToadBoss.tsx), independent of
  // `sequence` itself — showToadBoss only flips false→true once, right as
  // he first mounts for a fresh approach; a replay's reset routes straight
  // back to "briefing" without ever unmounting him (he's included in
  // showToadBoss the whole way through "won"), so this doesn't re-delay a
  // briefing he's already fully risen for.
  useEffect(() => {
    if (!showToadBoss) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resets so the next fresh approach waits out the rise again; see comment above.
      setToadRisen(false);
      return;
    }
    const timer = window.setTimeout(() => setToadRisen(true), TOAD_RISE_MS);
    return () => window.clearTimeout(timer);
  }, [showToadBoss]);

  return (
    <>
      <KnightReplayTrigger />
      {/* Same idea as KnightReplayTrigger, but for the toad — persisted
          across visits (see throneState.ts) rather than only appearing
          right after a fresh win (see the "won" block below), and offset
          to the right of the knight's own trigger since defeating the toad
          always implies the knight's already down too, so both can be on
          screen at once. */}
      {toadDefeated && sequence === "idle" && (
        <ReplayMissionButton label="Replay Toad" align="right" onClick={replayToad} />
      )}
      <ThroneHallBackground
        showToadBoss={showToadBoss}
        toadHit={toadHit}
        // Dies the instant his health is drained (the 6th/last reflection
        // lands), not when the player loses — toadHealth hits 0 right in
        // the same resolve() call that reflects that final hit, well
        // before the fight sequence itself advances to "won" (which waits
        // out the same ATTACK_DELAY_MS gap every other reflect gets).
        toadDead={toadHealth <= 0}
        toadMouthRef={toadMouthRef}
        pillarColors={pillarColors}
        pillarColorsChanged={pillarColorsChanged}
        pillarStates={sequence === "fighting" || sequence === "won" || sequence === "lost" ? pillarStatuses : undefined}
        slimeActive={slimeActive}
        onPillarClick={sequence === "fighting" ? handlePillarClick : undefined}
        snailRevealed={snailRevealed}
        snailBubble={snailBubble}
        snailPos={snailPos}
        snailRef={snailRef}
        snailTravelMs={snailTravelMs}
        beamShot={beamShot}
        reflectShot={reflectShot}
      />
      {sequence === "lost" && (
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
            {/* How many pillars you'd already reflected (toad health drained)
                before one finally burned — this fight's "distance". */}
            <DefeatProgressBar percent={((TOAD_MAX_HEALTH - toadHealth) / TOAD_MAX_HEALTH) * 100} />
          </div>
        </div>
      )}
      <div className="relative flex flex-col items-center gap-6">
        <div className="relative">
          {/* Knight stands beside the pile rather than flowing below it —
              flowing below pushed the page tall enough that he'd render
              past the fold, effectively cut off at the bottom. */}
          {knightDefeated ? (
            <button
              onClick={handleApproach}
              disabled={sequence !== "idle"}
              aria-label="Approach the throne"
              className="group relative block touch-manipulation outline-none disabled:cursor-default"
            >
              {sequence === "idle" && (
                <div
                  className="pointer-events-none absolute inset-0 -z-10 animate-[fire-glow-pulse_2.4s_ease-in-out_infinite]"
                  style={{
                    background: "radial-gradient(closest-side, rgba(57,255,143,0.3), transparent 70%)",
                  }}
                />
              )}
              <div
                style={{
                  // Same white outline Molotov/the pillar stars use to flag
                  // themselves as "the thing to click" — the chair itself
                  // is the affordance now, no separate "Approach" label.
                  filter:
                    sequence === "idle"
                      ? "drop-shadow(0 0 1.5px #fff) drop-shadow(0 0 1.5px #fff) drop-shadow(0 0 6px rgba(255,255,255,0.85))"
                      : "none",
                }}
              >
                <Throne />
              </div>
            </button>
          ) : (
            <Throne />
          )}
          {!knightDefeated && (
            <div className="absolute bottom-[21%] right-[2%]">
              <Knight />
            </div>
          )}

          {knightDefeated && (
            <Molotov
              active={sequence === "revealed"}
              thrown={molotovThrown}
              onClick={handleMolotovClick}
              originRef={molotovOriginRef}
              target={molotovTarget}
            />
          )}
        </div>

        {sequence === "approaching" && (
          <ThroneApproachFootsteps onComplete={() => setSequence("briefing")} />
        )}

        {sequence === "briefing" && toadRisen && (
          <BossFightStartMenu
            title="The Toad"
            concept="hard"
            gameplay="easy"
            rewardRarity="epic"
            onBegin={() => setSequence("revealed")}
            onBack={() => setSequence("idle")}
            // Skips straight to the won outcome — no reload needed here
            // (unlike the knight's), since this whole encounter's state
            // already lives in this same component.
            onInstaComplete={() => {
              setToadHealth(0);
              setSequence("won");
            }}
          />
        )}

        {sequence === "fighting" && (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[0.55rem] uppercase tracking-[0.2em] text-foreground/40">Toad</span>
              <div className="flex gap-1">
                {Array.from({ length: PILLAR_COLORS.length }).map((_, i) => (
                  <div
                    key={i}
                    className="h-2 w-5 transition-[background,box-shadow] duration-300"
                    style={{
                      background: i < toadHealth ? "var(--neon)" : "rgba(255,255,255,0.08)",
                      boxShadow: i < toadHealth ? "0 0 6px var(--neon)" : "none",
                    }}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={handleRetreat}
              className="touch-manipulation text-[0.55rem] uppercase tracking-[0.2em] text-foreground/30 transition-colors hover:text-foreground/60"
            >
              Retreat
            </button>
          </div>
        )}

        {sequence === "won" && showVictory && (
          <VictoryScreen
            title="The Toad is Beaten Back"
            rewardRarity="epic"
            itemName="Rainbow Shell"
            itemIcon={<RainbowShellIcon size={56} />}
            // The named Rainbow Shell is what the chest actually shows;
            // the toad's own badge (see inventory.ts and Locker.tsx) rides
            // along silently alongside it. Both idempotent, so replaying
            // this fight after already owning them is harmless.
            onReveal={() => {
              addToInventory("rainbow-shell");
              addToInventory("toad-badge");
            }}
            onClose={() => setShowVictory(false)}
          />
        )}

        {sequence === "won" && (
          <>
            <ReplayMissionButton label="Replay Toad" align="right" onClick={replayToad} />
            <div className="flex flex-col items-center gap-4">
              <p className="text-lg uppercase tracking-[0.3em] text-neon">The toad is beaten back.</p>
              <button
                onClick={resetEncounter}
                className="touch-manipulation border border-neon-dim px-5 py-2 text-xs uppercase tracking-[0.2em] text-neon-dim transition-colors hover:text-neon"
              >
                Step Back
              </button>
            </div>
          </>
        )}
        {/* "lost" gets no button here — the Defeat overlay above handles
            that beat, then resets the whole encounter on its own */}
      </div>
    </>
  );
}
