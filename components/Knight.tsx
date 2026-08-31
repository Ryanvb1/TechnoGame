"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KnightFigure } from "./KnightFigure";
import { BossFightStartMenu } from "./BossFightStartMenu";
import { ReplayMissionButton } from "./ReplayMissionButton";
import { VictoryScreen } from "./VictoryScreen";
import { NecklaceIcon } from "./NecklaceIcon";
import { grantKnightVictoryLoot, markKnightDefeated, readKnightDefeated } from "./throneState";
import { readSnailRescued } from "./snailState";

// "insta-won" is the dev/test shortcut's own path to the exact same
// victory chest the real fight (FightScene) shows — without it, insta-
// completing here skipped the chest, and the badge/rainbow-ball drop it
// grants, entirely.
type Stage = "idle" | "challenge" | "insta-won";

export function Knight() {
  const [visible] = useState(() => readSnailRescued() && !readKnightDefeated());
  const [stage, setStage] = useState<Stage>("idle");
  const router = useRouter();

  if (!visible) return null;

  function handleClick() {
    if (stage !== "idle") return;
    setStage("challenge");
  }

  return (
    <div className="relative flex flex-col items-center">
      {stage === "challenge" && (
        <BossFightStartMenu
          title="The Knight"
          concept="easy"
          gameplay="hard"
          rewardRarity="rare"
          onBegin={() => router.push("/throne-room/fight")}
          onBack={() => setStage("idle")}
          onInstaComplete={() => setStage("insta-won")}
        />
      )}

      {stage === "insta-won" && (
        <VictoryScreen
          title="The Knight Yields"
          rewardRarity="rare"
          itemName="Knight's Necklace"
          itemIcon={<NecklaceIcon color="#9aa5ad" size={56} />}
          onReveal={grantKnightVictoryLoot}
          // Marks him defeated and reloads once the chest's been closed —
          // the whole throne room's layout (the throne itself, pillars,
          // molotov) all key off knightDefeated read once at mount, in
          // multiple components that don't otherwise talk to each other,
          // so a hard reload is the simplest way to get every one of them
          // to agree on the new state rather than threading a callback
          // through all of them.
          onClose={() => {
            markKnightDefeated();
            window.location.reload();
          }}
        />
      )}

      {/* button is wider than the armor so the sword — nested in a wrapper
          matching the torso's footprint, reaching up to 80px past that
          wrapper's edge for the hilt — has enough centered margin to stay
          inside the clickable/tappable hit area */}
      <button
        onClick={handleClick}
        aria-label="Speak with the knight"
        className="group relative flex touch-manipulation flex-col items-center outline-none"
        style={{ minWidth: 290 }}
      >
        <KnightFigure />
      </button>
    </div>
  );
}

// Once he's defeated for good, the figure itself gets swapped out of the
// scene for the throne/molotov setup (see ThroneRoomScene) — there's
// nowhere left to click him. This is the replacement: a top-pinned
// trigger, rendered unconditionally alongside that swap so it's fully
// decoupled from it, that brings the exact same briefing back up rather
// than jumping straight back into the fight.
export function KnightReplayTrigger() {
  const [defeated, setDefeated] = useState(false);
  const [stage, setStage] = useState<Stage>("idle");
  const router = useRouter();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage, an external store the server can't see; see the same pattern throughout the site.
    setDefeated(readKnightDefeated());
  }, []);

  if (!defeated) return null;

  return (
    <>
      {stage === "idle" && (
        <ReplayMissionButton label="Replay Knight" align="left" onClick={() => setStage("challenge")} />
      )}
      {stage === "challenge" && (
        <BossFightStartMenu
          title="The Knight"
          concept="easy"
          gameplay="hard"
          rewardRarity="rare"
          onBegin={() => router.push("/throne-room/fight")}
          onBack={() => setStage("idle")}
          onInstaComplete={() => setStage("insta-won")}
        />
      )}
      {stage === "insta-won" && (
        <VictoryScreen
          title="The Knight Yields"
          rewardRarity="rare"
          itemName="Knight's Necklace"
          itemIcon={<NecklaceIcon color="#9aa5ad" size={56} />}
          onReveal={grantKnightVictoryLoot}
          onClose={() => setStage("idle")}
        />
      )}
    </>
  );
}
