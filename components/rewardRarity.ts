// Every mission draws from the same six-tier reward pool (white/common up
// to gold/exotic) — shared between the mission briefing (see
// BossFightStartMenu, which previews a locked mystery box in this same
// color) and the victory screen (see VictoryScreen, which actually opens
// one).
export type RewardRarity = "common" | "uncommon" | "rare" | "epic" | "legendary" | "exotic";

export const REWARD_RARITY_INFO: Record<
  RewardRarity,
  { label: string; color: string; rainbowBalls: number }
> = {
  common: { label: "Common", color: "#e8e8ec", rainbowBalls: 100 },
  uncommon: { label: "Uncommon", color: "#4ade80", rainbowBalls: 200 },
  rare: { label: "Rare", color: "#38bdf8", rainbowBalls: 400 },
  epic: { label: "Epic", color: "#a855f7", rainbowBalls: 600 },
  // Kept between epic and exotic for the existing six-tier reward system.
  legendary: { label: "Legendary", color: "#ff8c00", rainbowBalls: 800 },
  // The rarest tier, above legendary — reserved for the cave bear, the
  // site's newest/toughest boss. Gold — legendary used to hold this color
  // before exotic existed; moved here instead of duplicating it.
  exotic: { label: "Exotic", color: "#ffd700", rainbowBalls: 1000 },
};
