// Shown on every "Defeat" screen across the site (the snail's climb, the
// knight fight, the toad fight) — a quick readout of how far that attempt
// got before it ended, styled in the same red as the "Defeat" text itself
// rather than the site's usual neon green, since this bar is specifically
// about a loss.
export function DefeatProgressBar({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="relative flex flex-col items-center gap-1.5">
      <span className="text-[0.6rem] uppercase tracking-[0.3em] text-foreground/50">
        {Math.round(clamped)}% Reached
      </span>
      <div className="h-1.5 w-48 border border-[#c41230]/40 bg-white/5 sm:w-64">
        <div
          className="h-full transition-[width] duration-500 ease-out"
          style={{
            width: `${clamped}%`,
            background: "#c41230",
            boxShadow: "0 0 8px #c41230",
          }}
        />
      </div>
    </div>
  );
}
