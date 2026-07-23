// Every mission draws from the same five-tier reward pool (white/common up
// to gold/legendary) — shared between the mission briefing (see
// BossFightStartMenu, which previews a locked mystery box in this same
// color) and the victory screen (see VictoryScreen, which actually opens
// one).
export type RewardRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export const REWARD_RARITY_INFO: Record<RewardRarity, { label: string; color: string }> = {
  common: { label: "Common", color: "#e8e8ec" },
  uncommon: { label: "Uncommon", color: "#4ade80" },
  rare: { label: "Rare", color: "#38bdf8" },
  epic: { label: "Epic", color: "#a855f7" },
  legendary: { label: "Legendary", color: "#ffd700" },
};
