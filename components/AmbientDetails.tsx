// Purely decorative HUD flourishes for the home screen — corner frame
// brackets, a status readout, and a handful of drifting motes. Kept off in
// the far corners/edges (never the center) so nothing competes with the
// hub or its arrows.
const PARTICLES = [
  { left: "7%", bottom: "15%", size: 3, duration: 9, delay: 0, dx: 10 },
  { left: "13%", bottom: "72%", size: 2, duration: 11, delay: 2.5, dx: -8 },
  { left: "89%", bottom: "20%", size: 3, duration: 10, delay: 1.2, dx: -12 },
  { left: "92%", bottom: "64%", size: 2, duration: 8.5, delay: 4, dx: 8 },
  { left: "5%", bottom: "42%", size: 2, duration: 12, delay: 3, dx: 14 },
  { left: "95%", bottom: "42%", size: 3, duration: 9.5, delay: 1.8, dx: -10 },
];

export function AmbientDetails() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* corner frame brackets — top-left is left bare for the nav links */}
      <div className="absolute right-4 top-4 h-7 w-7 border-r border-t border-neon-dim/40 sm:right-6 sm:top-6 sm:h-9 sm:w-9" />
      <div className="absolute bottom-4 left-4 h-7 w-7 border-b border-l border-neon-dim/40 sm:bottom-6 sm:left-6 sm:h-9 sm:w-9" />

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
