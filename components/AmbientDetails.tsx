// Purely decorative HUD flourishes for the home screen — corner frame
// brackets, a status readout, a slow-turning halo behind the hub, a
// couple of floating shard clusters out in its open flanks, and a
// handful of drifting motes. Kept off in the far corners/edges and out
// of the hub's own diagonal gaps (never the center) so nothing competes
// with the hub or its arrows.
const PARTICLES = [
  { left: "7%", bottom: "15%", size: 3, duration: 9, delay: 0, dx: 10 },
  { left: "13%", bottom: "72%", size: 2, duration: 11, delay: 2.5, dx: -8 },
  { left: "89%", bottom: "20%", size: 3, duration: 10, delay: 1.2, dx: -12 },
  { left: "92%", bottom: "64%", size: 2, duration: 8.5, delay: 4, dx: 8 },
  { left: "5%", bottom: "42%", size: 2, duration: 12, delay: 3, dx: 14 },
  { left: "95%", bottom: "42%", size: 3, duration: 9.5, delay: 1.8, dx: -10 },
];

// One shard cluster in each of the hub's open flanks — left of Cave/
// Fairyland's own column and right of Kiosk/Airport's, far enough out
// that they read as background atmosphere rather than crowding the
// arrows. Three shards per cluster, near/mid/far treatment (bigger +
// brighter + slower vs smaller + dimmer + quicker), same depth-banding
// idea as the cave/airport backgrounds just condensed to one cluster.
const SHARD_CLUSTERS: { left: string; top: string }[] = [
  { left: "17%", top: "58%" },
  { left: "83%", top: "60%" },
];

const SHARDS = [
  { dx: -18, dy: -14, size: 22, opacity: 0.5, duration: 5.5, delay: 0 },
  { dx: 14, dy: 6, size: 15, opacity: 0.35, duration: 4.5, delay: 0.8 },
  { dx: -4, dy: 22, size: 11, opacity: 0.25, duration: 6.5, delay: 1.6 },
];

export function AmbientDetails() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* corner frame brackets — top-left is left bare for the nav links */}
      <div className="absolute right-4 top-4 h-7 w-7 border-r border-t border-neon-dim/40 sm:right-6 sm:top-6 sm:h-9 sm:w-9" />
      <div className="absolute bottom-4 left-4 h-7 w-7 border-b border-l border-neon-dim/40 sm:bottom-6 sm:left-6 sm:h-9 sm:w-9" />

      {/* a huge, barely-there hexagonal halo turning behind the whole hub
          — pure depth/atmosphere, not meant to be consciously noticed */}
      <svg
        className="absolute left-1/2 top-1/2 h-[140vmin] w-[140vmin] -translate-x-1/2 -translate-y-1/2 opacity-[0.06]"
        style={{ animation: "slow-spin 120s linear infinite" }}
        viewBox="0 0 100 100"
      >
        <polygon
          points="50,2 93,26 93,74 50,98 7,74 7,26"
          fill="none"
          stroke="var(--neon)"
          strokeWidth={0.4}
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* floating shard clusters out in the hub's open flanks */}
      {SHARD_CLUSTERS.map((c, i) => (
        <div key={i} className="absolute" style={{ left: c.left, top: c.top }}>
          {SHARDS.map((s, j) => (
            <div
              key={j}
              className="absolute animate-[gentle-float_ease-in-out_infinite]"
              style={{
                left: s.dx,
                top: s.dy,
                width: s.size,
                height: s.size * 1.3,
                opacity: s.opacity,
                clipPath: "polygon(50% 0%, 100% 38%, 78% 100%, 22% 100%, 0% 38%)",
                background: "linear-gradient(160deg, var(--neon) 0%, var(--neon-dim) 100%)",
                boxShadow: "0 0 10px var(--neon-dim)",
                animationDuration: `${s.duration}s`,
                animationDelay: `${s.delay}s`,
              }}
            />
          ))}
        </div>
      ))}

      {/* ambient drifting motes */}
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="absolute animate-[particle-drift_ease-in-out_infinite]"
          style={{
            left: p.left,
            bottom: p.bottom,
            height: p.size,
            width: p.size,
            clipPath: "circle(50% at 50% 50%)",
            background: "var(--neon)",
            boxShadow: "0 0 6px var(--neon)",
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            ["--particle-dx" as never]: `${p.dx}px`,
          }}
        />
      ))}
    </div>
  );
}
