import { MAX_BEAR_HEALTH, MAX_PLAYER_HEALTH } from "./caveBearFightConfig";

// Extracted rather than inlined (unlike FightScene's local unexported
// HealthBar) specifically so CaveBearFight.tsx itself stays small.
export function CaveBearHealthBars({ playerHealth, bearHealth }: { playerHealth: number; bearHealth: number }) {
  return (
    <div className="flex w-full max-w-md items-center gap-4 sm:max-w-lg">
      <HealthBar label="You" value={playerHealth} max={MAX_PLAYER_HEALTH} color="var(--neon)" />
      <HealthBar label="Cave Bear" value={bearHealth} max={MAX_BEAR_HEALTH} color="#e04b3b" align="right" />
    </div>
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
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="flex flex-1 flex-col gap-1">
      <span className={`text-[0.6rem] uppercase tracking-[0.2em] text-foreground/70 ${align === "right" ? "text-right" : ""}`}>
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
