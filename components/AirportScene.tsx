"use client";

import { useEffect, useState } from "react";
import { AirportBackground } from "./AirportBackground";
import { AirplaneTransformer, type TransformerPhase } from "./AirplaneTransformer";
import { BossFightStartMenu } from "./BossFightStartMenu";
import { VictoryScreen } from "./VictoryScreen";
import { BadgeIcon } from "./BadgeIcon";
import { addToInventory } from "./inventory";

// First prototype of this location — same shape as CaveScene: he sits
// parked and harmless until clicked, transforms with a beat to actually
// read before the briefing covers him, and "Begin" commits to the
// encounter itself rather than a real fight (no mechanic's been designed
// for him yet). onInstaComplete is the only path to an actual win for now.
type Sequence = "parked" | "transforming" | "briefing" | "encounter" | "won";

const TRANSFORM_TO_BRIEFING_MS = 2000;

export function AirportScene() {
  const [sequence, setSequence] = useState<Sequence>("parked");
  const [showVictory, setShowVictory] = useState(false);

  // Re-arms the victory screen for every fresh transition into "won",
  // same pattern as CaveScene/ThroneRoomScene/FightScene.
  useEffect(() => {
    if (sequence !== "won") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- re-arms the victory screen for this specific "won" transition, not a one-time mount default; see the identical pattern in CaveScene/ThroneRoomScene/FightScene.
    setShowVictory(true);
  }, [sequence]);

  // Holds on "transforming" just long enough for AirplaneTransformer's own
  // part-by-part transform and impact flash to actually read before the
  // briefing menu covers the whole scene.
  useEffect(() => {
    if (sequence !== "transforming") return;
    const timer = window.setTimeout(() => setSequence("briefing"), TRANSFORM_TO_BRIEFING_MS);
    return () => window.clearTimeout(timer);
  }, [sequence]);

  function handleActivate() {
    if (sequence !== "parked") return;
    setSequence("transforming");
  }

  // Backing out of the briefing (or retreating from the encounter) folds
  // him back down into a plane rather than leaving him standing there —
  // the same transform just runs in reverse.
  function handleRetreat() {
    setSequence("parked");
  }

  const transformerPhase: TransformerPhase =
    sequence === "parked" ? "parked" : sequence === "encounter" || sequence === "won" ? "combat" : "robot";

  return (
    <>
      <AirportBackground alert={sequence !== "parked"} />

      <div className="relative flex flex-col items-center gap-6">
        <button
          onClick={handleActivate}
          disabled={sequence !== "parked"}
          aria-label={sequence === "parked" ? "A parked airplane" : "An airplane transformer"}
          // Drops him down to actually rest on AirportBackground's runway
          // (now at a fixed, viewport-height-independent screen position —
          // see the runway's own comment in AirportBackground.tsx) instead
          // of floating above it, same fix and same reasoning as
          // CaveScene's button margin.
          className="group relative flex touch-manipulation flex-col items-center outline-none disabled:cursor-default mt-[210px] sm:mt-[107px]"
        >
          <AirplaneTransformer phase={transformerPhase} />
          {sequence === "parked" && (
            <span className="mt-2 text-[0.6rem] uppercase tracking-[0.3em] text-neon-dim transition-colors group-hover:text-neon">
              Approach the Airplane
            </span>
          )}
        </button>

        {sequence === "transforming" && (
          <p className="animate-[fire-glow-pulse_1.2s_ease-in-out_infinite] text-xs uppercase tracking-[0.3em] text-neon">
            The airplane is transforming&hellip;
          </p>
        )}

        {sequence === "briefing" && (
          <BossFightStartMenu
            title="The Transformer"
            concept="medium"
            gameplay="hard"
            rewardRarity="epic"
            onBegin={() => setSequence("encounter")}
            onBack={handleRetreat}
            onInstaComplete={() => setSequence("won")}
          />
        )}

        {sequence === "encounter" && (
          <div className="flex flex-col items-center gap-4">
            <p className="max-w-sm text-center text-xs uppercase tracking-[0.2em] text-foreground/60">
              Turbines flare into thrusters as the transformer levels its
              cannon at you &mdash; the fight itself hasn&apos;t rolled off
              the assembly line yet.
            </p>
            <button
              onClick={handleRetreat}
              className="touch-manipulation border border-neon-dim px-5 py-2 text-xs uppercase tracking-[0.2em] text-neon-dim transition-colors hover:text-neon"
            >
              Retreat
            </button>
          </div>
        )}

        {sequence === "won" && showVictory && (
          <VictoryScreen
            title="The Transformer Grounded"
            rewardRarity="epic"
            itemName="Transformer Badge"
            itemIcon={<BadgeIcon color="#4dabf7" size={56} />}
            onReveal={() => addToInventory("transformer-badge")}
            onClose={() => setSequence("parked")}
          />
        )}
      </div>
    </>
  );
}
