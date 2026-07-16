const FLAME_CLIP_PATH =
  "polygon(50% 0%, 80% 35%, 65% 40%, 90% 70%, 50% 100%, 10% 70%, 35% 40%, 20% 35%)";

const FLAMES = [
  { width: 34, height: 74, delay: "0s", duration: "1.7s" },
  { width: 46, height: 108, delay: "0.25s", duration: "1.9s" },
  { width: 30, height: 62, delay: "0.5s", duration: "1.6s" },
];

export function FirePit() {
  return (
    <div className="relative flex h-52 w-52 items-end justify-center sm:h-80 sm:w-80">
      <div
        className="absolute inset-0 animate-[fire-glow-pulse_3s_ease-in-out_infinite]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,110,20,0.55), transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-4 h-12 w-52 border-2 border-neon-dim/30 bg-black/50 sm:w-64"
        style={{ clipPath: "ellipse(50% 50% at 50% 50%)" }}
      />
      <div className="relative flex items-end gap-2 pb-10">
        {FLAMES.map((flame, i) => (
          <div
            key={i}
            style={{
              width: flame.width,
              height: flame.height,
              clipPath: FLAME_CLIP_PATH,
              background:
                "linear-gradient(to top, #ff3d0f 0%, #ff8c1a 55%, #ffe08a 100%)",
              filter:
                "drop-shadow(0 0 10px rgba(255,140,20,0.85)) drop-shadow(0 0 24px rgba(255,70,0,0.5))",
              animationName: "fire-flicker",
              animationDuration: flame.duration,
              animationDelay: flame.delay,
              animationTimingFunction: "ease-in-out",
              animationIterationCount: "infinite",
            }}
          />
        ))}
      </div>
    </div>
  );
}
