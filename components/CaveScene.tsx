"use client";

import { useEffect, useRef, useState } from "react";
import { CaveBackground } from "./CaveBackground";
import { CaveBear, type CaveBearPhase } from "./CaveBear";
import { CaveBearFight } from "./CaveBearFight";
import { BossFightStartMenu } from "./BossFightStartMenu";
import { VictoryScreen } from "./VictoryScreen";
import { BadgeIcon } from "./BadgeIcon";
import { addToInventory } from "./inventory";

// He sleeps until clicked, wakes with a beat to actually read before the
// briefing covers him (same idea as ThroneRoomScene waiting out the
// toad's own rise before showing its briefing), and "Begin" commits to
// the encounter — CaveBearFight then owns the bear's own rendering (and
// the rest of the fight) for as long as sequence stays "encounter".
type Sequence = "sleeping" | "waking" | "briefing" | "encounter" | "won";

const WAKE_TO_BRIEFING_MS = 1800;

export function CaveScene() {
  const [sequence, setSequence] = useState<Sequence>("sleeping");
  const [showVictory, setShowVictory] = useState(false);
  // CaveBackground forwards this onto its floor's own content slot, so
  // CaveBearFight can portal the fight's quadrant grid straight into that
  // real tilted floor plane instead of rendering a separate flat panel.
  const floorRef = useRef<HTMLDivElement>(null);

  // Re-arms the victory screen for every fresh transition into "won",
  // same pattern as ThroneRoomScene/FightScene.
  useEffect(() => {
    if (sequence !== "won") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- re-arms the victory screen for this specific "won" transition, not a one-time mount default; see the identical pattern in ThroneRoomScene/FightScene.
    setShowVictory(true);
  }, [sequence]);

  // Holds on "waking" just long enough for CaveBear's own sleeping->awake
  // crossfade and roar flash to actually read before the briefing menu
  // covers the whole scene.
  useEffect(() => {
    if (sequence !== "waking") return;
    const timer = window.setTimeout(() => setSequence("briefing"), WAKE_TO_BRIEFING_MS);
    return () => window.clearTimeout(timer);
  }, [sequence]);

  function handleWake() {
    if (sequence !== "sleeping") return;
    setSequence("waking");
  }

  // Backing out of the briefing (or retreating from the encounter) settles
  // him back down rather than leaving him standing there mid-scene — the
  // same crossfade just runs in reverse.
  function handleRetreat() {
    setSequence("sleeping");
  }

  const bearPhase: CaveBearPhase =
    sequence === "sleeping" ? "sleeping" : sequence === "encounter" || sequence === "won" ? "enraged" : "awake";

  return (
    <>
      <CaveBackground ref={floorRef} awake={sequence !== "sleeping"} />

      <div className="relative flex flex-col items-center gap-6">
        {sequence !== "encounter" && (
          <button
            onClick={handleWake}
            disabled={sequence !== "sleeping"}
            aria-label={sequence === "sleeping" ? "A sleeping cave bear" : "The cave bear"}
            // Drops the bear down to actually rest on CaveBackground's floor
            // (now at a fixed, viewport-height-independent screen position —
            // see the floor's own comment in CaveBackground.tsx) instead of
            // floating above it. Measured directly against that fixed floor
            // edge at each breakpoint, since CaveBear's own size — and so
            // this button's height — changes with --bscale.
            className="group relative flex touch-manipulation flex-col items-center outline-none disabled:cursor-default mt-[176px] sm:mt-[72px]"
          >
            <CaveBear phase={bearPhase} />
            {sequence === "sleeping" && (
              <span className="mt-2 text-[0.6rem] uppercase tracking-[0.3em] text-neon-dim transition-colors group-hover:text-neon">
                Wake the Cave Bear
              </span>
            )}
          </button>
        )}

        {sequence === "waking" && (
          <p className="animate-[fire-glow-pulse_1.2s_ease-in-out_infinite] text-xs uppercase tracking-[0.3em] text-neon">
            The cave bear stirs&hellip;
          </p>
        )}

        {sequence === "briefing" && (
          <BossFightStartMenu
            title="Cave Bear"
            concept="medium"
            gameplay="hard"
            rewardRarity="epic"
            onBegin={() => setSequence("encounter")}
            onBack={handleRetreat}
            onInstaComplete={() => setSequence("won")}
          />
        )}

        {sequence === "encounter" && <CaveBearFight floorRef={floorRef} onVictory={() => setSequence("won")} onRetreat={handleRetreat} />}

        {sequence === "won" && showVictory && (
          <VictoryScreen
            title="Cave Bear Subdued"
            rewardRarity="epic"
            itemName="Cave Bear Badge"
            itemIcon={<BadgeIcon color="#8a5a2b" size={56} />}
            onReveal={() => addToInventory("cave-bear-badge")}
            onClose={() => setSequence("sleeping")}
          />
        )}
      </div>
    </>
  );
}
