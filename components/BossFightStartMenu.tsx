"use client";

import { REWARD_RARITY_INFO, type RewardRarity } from "./rewardRarity";

export type MissionDifficulty = "easy" | "medium" | "hard";

const DIFFICULTY_INFO: Record<MissionDifficulty, { rank: number; label: string; color: string }> = {
  easy: { rank: 1, label: "Easy", color: "var(--neon)" },
  medium: { rank: 2, label: "Medium", color: "#ffb238" },
  hard: { rank: 3, label: "Hard", color: "#ff4d4d" },
};

// The shared "briefing" screen shown right before a boss fight/mission
// starts — alongside whatever begin-fight menu that encounter already has
// (the knight's challenge popup, the toad's "Approach" prompt, or, for the
// snail, just landing on the page). Two independent difficulty stats per
// encounter: how hard the underlying concept/puzzle is to figure out
// versus how hard the actual input/execution is once you know what to do.
export function BossFightStartMenu({
  title,
  description,
  concept,
  gameplay,
  rewardRarity,
  onBegin,
  onBack,
  onInstaComplete,
  beginLabel = "Begin",
  backLabel = "Back",
  instaCompleteLabel = "Insta-Complete",
}: {
  title: string;
  // Optional flavor content (a line of dialogue, an item preview) shown
  // between the title and the difficulty/reward stats — most encounters
  // skip this and let their own in-scene text carry that instead.
  description?: React.ReactNode;
  concept: MissionDifficulty;
  gameplay: MissionDifficulty;
  // Each mission always offers the same single rarity tier, not a random
  // pull across all five — see REWARD_RARITY_INFO above.
  rewardRarity: RewardRarity;
  onBegin: () => void;
  // Backs out of the encounter without starting it — what that means is
  // left to the caller (return to idle for the knight/toad, leave the
  // page entirely for the pit).
  onBack: () => void;
  // The dev/test shortcut previously scattered across each encounter (the
  // knight fight's own "Insta-Kill", the gnome's "Test Fill") — now lives
  // here instead, one per mission box. What "complete" means is entirely
  // up to the caller (mark a persisted flag, skip straight to a won state,
  // fill a resource to max).
  onInstaComplete: () => void;
  beginLabel?: string;
  backLabel?: string;
  instaCompleteLabel?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 px-6 backdrop-blur-sm">
      <div className="relative flex w-full max-w-xs flex-col items-center gap-6 border border-neon-dim bg-background/95 px-8 py-10 text-center shadow-[0_0_15px_var(--neon-dim)]">
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs uppercase tracking-[0.5em] text-neon-dim">Mission</span>
          <h2 className="text-2xl font-bold uppercase tracking-[0.2em] text-neon">{title}</h2>
        </div>

        {description && <div className="text-xs text-foreground/80">{description}</div>}

        <div className="flex w-full flex-col gap-4">
          <DifficultyRow label="Concept" value={concept} />
          <DifficultyRow label="Gameplay" value={gameplay} />
          <RewardsRow rarity={rewardRarity} />
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-6">
            <button
              onClick={onBack}
              className="touch-manipulation border border-neon-dim px-5 py-2 text-xs uppercase tracking-[0.3em] text-neon-dim transition-colors hover:text-neon"
            >
              {backLabel}
            </button>
            <button
              onClick={onBegin}
              data-sfx="boss-start"
              className="touch-manipulation border border-neon px-5 py-2 text-xs uppercase tracking-[0.3em] text-neon transition-colors hover:bg-neon/10"
            >
              {beginLabel}
            </button>
          </div>
          <button
            onClick={onInstaComplete}
            className="touch-manipulation text-[0.55rem] uppercase tracking-[0.2em] text-foreground/30 transition-colors hover:text-foreground/60"
          >
            {instaCompleteLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function RewardsRow({ rarity }: { rarity: RewardRarity }) {
  const info = REWARD_RARITY_INFO[rarity];
  return (
    <div className="flex items-center justify-start gap-3">
      <span className="text-[0.6rem] uppercase tracking-[0.25em] text-foreground/50">Rewards</span>
      <div className="flex items-center gap-2">
        <div
          aria-label={`${info.label} mystery reward`}
          title={info.label}
          className="flex h-6 w-6 items-center justify-center text-[0.6rem] font-bold"
          style={{
            background: `linear-gradient(160deg, ${info.color} 0%, rgba(0,0,0,0.35) 130%)`,
            boxShadow: `0 0 6px ${info.color}99`,
            color: "rgba(0,0,0,0.55)",
          }}
        >
          ?
        </div>
        <span className="text-[0.6rem] uppercase tracking-[0.2em]" style={{ color: info.color }}>
          {info.label}
        </span>
        <span className="text-[0.55rem] uppercase tracking-[0.15em] text-neon-dim">
          +{info.rainbowBalls.toLocaleString()} balls
        </span>
      </div>
    </div>
  );
}

function DifficultyRow({ label, value }: { label: string; value: MissionDifficulty }) {
  const info = DIFFICULTY_INFO[value];
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[0.6rem] uppercase tracking-[0.25em] text-foreground/50">{label}</span>
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {[1, 2, 3].map((rank) => (
            <div
              key={rank}
              className="h-2 w-5 transition-[background,box-shadow] duration-300"
              style={{
                background: rank <= info.rank ? info.color : "rgba(255,255,255,0.08)",
                boxShadow: rank <= info.rank ? `0 0 6px ${info.color}` : "none",
              }}
            />
          ))}
        </div>
        <span className="w-14 text-left text-[0.6rem] uppercase tracking-[0.2em]" style={{ color: info.color }}>
          {info.label}
        </span>
      </div>
    </div>
  );
}
