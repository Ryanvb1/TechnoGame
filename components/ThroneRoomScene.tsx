"use client";

import { useEffect, useRef, useState } from "react";
import { Throne } from "./Throne";
import { Knight } from "./Knight";
import { Molotov } from "./Molotov";
import { ThroneHallBackground, type PillarFightState } from "./ThroneHallBackground";
import { ThroneApproachFootsteps } from "./ThroneApproachFootsteps";
import { readKnightDefeated } from "./throneState";
import {
  PILLAR_CLIMB_MS,
  PILLAR_COLORS,
  PILLAR_COLOR_NAMES,
  advancePillarRotation,
  colorForPillar,
  pillarForColor,
  readPillarRotation,
} from "./pillarColors";

type Sequence = "idle" | "approaching" | "revealed" | "angry" | "fighting" | "won" | "lost";

const THROW_MS = 550;
const FIRE_BREATH_DELAY_MS = 700;
const SNAIL_ENTRANCE_DELAY_MS = 900;
const BUBBLE_HOLD_MS = 1600;
const ANGRY_INTRO_MS = 2800;
const BURN_TIMEOUT_MS = 8000;

function emptyPillarStatuses(): PillarFightState[] {
  return Array.from({ length: PILLAR_COLORS.length }, () => ({ status: "pending" as const, climbing: false }));
}

export function ThroneRoomScene() {
  // Server-rendered HTML always assumes the knight hasn't been defeated yet
  // (no localStorage on the server); this effect syncs in the real value
  // right after mount, same pattern as the rest of the site's progress state.
  const [knightDefeated, setKnightDefeated] = useState(false);
  const [sequence, setSequence] = useState<Sequence>("idle");
  const [pillarRotation, setPillarRotation] = useState(0);
  const [pillarStatuses, setPillarStatuses] = useState<PillarFightState[]>(emptyPillarStatuses());
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const [molotovThrown, setMolotovThrown] = useState(false);
  const [toadBreathingFire, setToadBreathingFire] = useState(false);
  const [snailRevealed, setSnailRevealed] = useState(false);
  const [snailBubble, setSnailBubble] = useState(false);

  const pillarRotationRef = useRef(0);
  const currentColorIndexRef = useRef(0);
  const resolveRef = useRef<((saved: boolean) => void) | null>(null);
  const introTimers = useRef<number[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage, an external store the server can't see; see comment above.
    setKnightDefeated(readKnightDefeated());
    setPillarRotation(readPillarRotation());
  }, []);

  useEffect(() => {
    pillarRotationRef.current = pillarRotation;
  }, [pillarRotation]);

  // Clear any pending intro timers on unmount so they can't fire state
  // updates after the fact. introTimers is a mutable accumulator (timer
  // IDs get pushed onto it well after this effect first runs), not a DOM
  // node — the cleanup deliberately reads whatever's in it *at unmount
  // time*, not a snapshot from mount, so capturing `.current` up front
  // would clear a stale empty array instead.
  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps -- see comment above.
      introTimers.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  function handleApproach() {
    if (sequence !== "idle") return;
    setSequence("approaching");
  }

  function handleMolotovClick() {
    if (sequence !== "revealed") return;
    setMolotovThrown(true);
    setSequence("angry");
    introTimers.current.push(
      window.setTimeout(() => setToadBreathingFire(true), THROW_MS + FIRE_BREATH_DELAY_MS),
      window.setTimeout(() => {
        setSnailRevealed(true);
        setSnailBubble(true);
      }, SNAIL_ENTRANCE_DELAY_MS),
      window.setTimeout(() => setSnailBubble(false), SNAIL_ENTRANCE_DELAY_MS + BUBBLE_HOLD_MS),
      window.setTimeout(() => {
        setPillarStatuses(emptyPillarStatuses());
        setSequence("fighting");
      }, ANGRY_INTRO_MS)
    );
  }

  function handlePillarClick(position: number) {
    if (sequence !== "fighting") return;
    const expected = pillarForColor(currentColorIndexRef.current, pillarRotationRef.current);
    if (position !== expected) return;
    resolveRef.current?.(true);
  }

  function resetEncounter() {
    setPillarStatuses(emptyPillarStatuses());
    setMolotovThrown(false);
    setToadBreathingFire(false);
    setSnailRevealed(false);
    setSnailBubble(false);
    setSequence("idle");
  }

  function handleRetreat() {
    advancePillarRotation();
    setPillarRotation(readPillarRotation());
    resetEncounter();
  }

  // Owns the whole fight: targets colors in order, races a burn timer
  // against a click-triggered climb for each, and settles the outcome once
  // all six have been resolved one way or the other.
  useEffect(() => {
    if (sequence !== "fighting") return;
    let cancelled = false;
    let burnTimer: number;
    let climbTimer: number;

    function targetColor(colorIndex: number) {
      if (cancelled) return;
      if (colorIndex >= PILLAR_COLORS.length) {
        settleFight();
        return;
      }
      currentColorIndexRef.current = colorIndex;
      setCurrentColorIndex(colorIndex);
      const position = pillarForColor(colorIndex, pillarRotationRef.current);

      setPillarStatuses((prev) => {
        const next = [...prev];
        next[position] = { status: "targeted", climbing: false };
        return next;
      });

      resolveRef.current = (saved: boolean) => {
        resolveRef.current = null;
        window.clearTimeout(burnTimer);
        if (saved) {
          setPillarStatuses((prev) => {
            const next = [...prev];
            next[position] = { status: "targeted", climbing: true };
            return next;
          });
          climbTimer = window.setTimeout(() => {
            if (cancelled) return;
            setPillarStatuses((prev) => {
              const next = [...prev];
              next[position] = { status: "saved", climbing: false };
              return next;
            });
            targetColor(colorIndex + 1);
          }, PILLAR_CLIMB_MS);
        } else {
          setPillarStatuses((prev) => {
            const next = [...prev];
            next[position] = { status: "burned", climbing: false };
            return next;
          });
          targetColor(colorIndex + 1);
        }
      };

      burnTimer = window.setTimeout(() => resolveRef.current?.(false), BURN_TIMEOUT_MS);
    }

    function settleFight() {
      setPillarStatuses((prev) => {
        const burnedCount = prev.filter((p) => p.status === "burned").length;
        const lost = burnedCount >= PILLAR_COLORS.length;
        if (lost) {
          advancePillarRotation();
          setPillarRotation(readPillarRotation());
        }
        setSequence(lost ? "lost" : "won");
        return prev;
      });
    }

    targetColor(0);
    return () => {
      cancelled = true;
      resolveRef.current = null;
      window.clearTimeout(burnTimer);
      window.clearTimeout(climbTimer);
    };
  }, [sequence]);

  const showToadBoss = sequence === "revealed" || sequence === "angry" || sequence === "fighting";
  const toadFireBreathing = toadBreathingFire && (sequence === "angry" || sequence === "fighting");
  const anyClimbing = pillarStatuses.some((p) => p.climbing);
  const snailHome = snailRevealed && !anyClimbing;
  const pillarColors = knightDefeated
    ? Array.from({ length: PILLAR_COLORS.length }, (_, i) => colorForPillar(i, pillarRotation))
    : undefined;

  return (
    <>
      <ThroneHallBackground
        showToadBoss={showToadBoss}
        toadFireBreathing={toadFireBreathing}
        pillarColors={pillarColors}
        pillarStates={sequence === "fighting" || sequence === "won" || sequence === "lost" ? pillarStatuses : undefined}
        onPillarClick={handlePillarClick}
        snailHome={snailHome}
        snailBubble={snailBubble}
      />
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
              <Throne />
              {sequence === "idle" && (
                <>
                  <div
                    className="pointer-events-none absolute inset-0 -z-10 animate-[fire-glow-pulse_2.4s_ease-in-out_infinite]"
                    style={{
                      background: "radial-gradient(closest-side, rgba(57,255,143,0.3), transparent 70%)",
                    }}
                  />
                  <span className="absolute left-1/2 top-full mt-3 -translate-x-1/2 whitespace-nowrap text-[0.6rem] uppercase tracking-[0.3em] text-neon-dim transition-colors group-hover:text-neon">
                    Approach
                  </span>
                </>
              )}
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
            <Molotov active={sequence === "revealed"} thrown={molotovThrown} onClick={handleMolotovClick} />
          )}
        </div>

        {sequence === "approaching" && (
          <ThroneApproachFootsteps onComplete={() => setSequence("revealed")} />
        )}

        {sequence === "fighting" && (
          <div className="flex flex-col items-center gap-3">
            <p className="max-w-sm text-center text-[0.65rem] uppercase tracking-[0.2em] text-foreground/60">
              The toad takes aim at the{" "}
              <span style={{ color: PILLAR_COLORS[currentColorIndex] }}>
                {PILLAR_COLOR_NAMES[currentColorIndex]}
              </span>{" "}
              pillar — click it to send the snail up before it burns.
            </p>
            <button
              onClick={handleRetreat}
              className="touch-manipulation text-[0.55rem] uppercase tracking-[0.2em] text-foreground/30 transition-colors hover:text-foreground/60"
            >
              Retreat
            </button>
          </div>
        )}

        {(sequence === "won" || sequence === "lost") && (
          <div className="flex flex-col items-center gap-4">
            <p className="text-lg uppercase tracking-[0.3em] text-neon">
              {sequence === "won" ? "The hall holds. For now." : "The pillars have fallen."}
            </p>
            <button
              onClick={resetEncounter}
              className="touch-manipulation border border-neon-dim px-5 py-2 text-xs uppercase tracking-[0.2em] text-neon-dim transition-colors hover:text-neon"
            >
              Step Back
            </button>
          </div>
        )}
      </div>
    </>
  );
}
