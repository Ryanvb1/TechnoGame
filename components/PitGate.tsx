"use client";

import { useEffect, useState } from "react";
import { BossFightStartMenu } from "./BossFightStartMenu";
import { SnailRescueRope } from "./SnailRescueRope";
import { ReplayMissionButton } from "./ReplayMissionButton";
import { VictoryScreen } from "./VictoryScreen";
import { useSceneTravel } from "./PageTransition";
import { markSnailRescued, readSnailRescued } from "./snailState";

// Keeps the boss-fight start menu's open/closed state off the page itself,
// so app/careful/page.tsx (and, importantly, the server-rendered FirePit it
// wraps) can stay a plain Server Component — FirePit's decorative flames
// use unrounded pseudo-random floats in their inline styles, which is only
// safe as long as it's never hydrated (see the `round()` helper's own
// comment in pillarColors.ts for why that class of value trips a hydration
// mismatch once a component becomes part of the client tree).
export function PitGate({ children }: { children: React.ReactNode }) {
  const [started, setStarted] = useState(false);
  const [rescued, setRescued] = useState(false);
  const [replayBriefing, setReplayBriefing] = useState(false);
  const [replaying, setReplaying] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const travel = useSceneTravel();

  useEffect(() => {
    // Already rescued on a prior visit — the mission's done, so there's
    // nothing left to gate behind a briefing screen; just show the pit
    // (plus a Replay trigger, below).
    if (readSnailRescued()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage, an external store the server can't see; see comment above.
      setStarted(true);
      setRescued(true);
    }
  }, []);

  return (
    <>
      {!started && (
        <BossFightStartMenu
          title="Saving Private Snail"
          concept="easy"
          gameplay="easy"
          rewardRarity="uncommon"
          onBegin={() => setStarted(true)}
          onBack={() => travel("/")}
          // Marks him rescued outright — stays on the page (rather than
          // leaving for "/" immediately) so the same victory chest a real
          // rescue gets still shows and can actually be opened.
          onInstaComplete={() => {
            markSnailRescued();
            setStarted(true);
            setRescued(true);
            setShowVictory(true);
          }}
        />
      )}
      {/* Only mounted once the briefing's actually been dismissed — its
          whole simulation (swing, climb, geysers) starts the instant it
          mounts, and the "please help me" bubble's own timer starts right
          alongside it, so mounting it earlier (behind the still-open
          briefing) would run the encounter, and burn that timer, on a
          scene the player can't even see yet. */}
      {started && !rescued && (
        <SnailRescueRope
          onDefeat={() => setStarted(false)}
          // SnailRescueRope tracks "rescued" internally too (and renders
          // null once it is), but that's a separate piece of state from
          // this component's own `rescued` — without mirroring it here,
          // this branch would never know to stop rendering it, and the
          // Replay trigger below would never appear until a full reload.
          onComplete={() => {
            setRescued(true);
            setShowVictory(true);
          }}
        />
      )}
      {/* Once he's been rescued for good, the mission itself is done, but
          the encounter's still fun to run again — same briefing screen as
          the first time (see ReplayMissionButton's own comment on why
          this doesn't skip straight back into it). */}
      {rescued && !replaying && !replayBriefing && <ReplayMissionButton onClick={() => setReplayBriefing(true)} />}
      {replayBriefing && (
        <BossFightStartMenu
          title="Saving Private Snail"
          concept="easy"
          gameplay="easy"
          rewardRarity="uncommon"
          onBegin={() => {
            setReplayBriefing(false);
            setReplaying(true);
          }}
          onBack={() => setReplayBriefing(false)}
          // Same as the first-time shortcut above — still shows the chest
          // rather than just closing the briefing with nothing granted.
          onInstaComplete={() => {
            setReplayBriefing(false);
            setShowVictory(true);
          }}
        />
      )}
      {replaying && (
        <SnailRescueRope
          replay
          onDefeat={() => setReplaying(false)}
          onComplete={() => {
            setReplaying(false);
            setShowVictory(true);
          }}
        />
      )}
      {showVictory && (
        <VictoryScreen
          title="The Snail is Saved"
          rewardRarity="uncommon"
          onClose={() => setShowVictory(false)}
        />
      )}
      {children}
    </>
  );
}
