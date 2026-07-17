// A long regal hall: solid tan stone pillars flanking the throne (rendered
// separately, in Throne.tsx). The pillars are plain upright 2D rectangles
// — every one of them starts at the very top of the page and reaches down
// to its own row's floor line, so they always read as perpendicular
// columns rather than shapes lying on the tilted floor. Only three rows
// remain (the closest and farthest were too crowded/distant to read well);
// the floor keeps its real 3D tilt underneath, with a night sky — stars
// and a few planets — filling the space above/around it instead of a
// carpet duplicating Throne.tsx's own.

// Deterministic pseudo-random in [0, 1) so the layout is stable across
// server/static renders instead of relying on Math.random().
function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const PILLAR_ROWS = [
  { heightPct: 40, xPct: 27, width: 30, opacity: 0.85 },
  { heightPct: 66, xPct: 18, width: 44, opacity: 0.92 },
  { heightPct: 78, xPct: 8, width: 62, opacity: 1 },
];

const HALL_WIDTH = "min(1500px, 240vw)";

const STAR_COUNT = 40;
const STARS = Array.from({ length: STAR_COUNT }, (_, i) => {
  const r1 = pseudoRandom(i * 3.3 + 5);
  const r2 = pseudoRandom(i * 7.1 + 9);
  const r3 = pseudoRandom(i * 5.9 + 13);
  return {
    left: r1 * 100,
    top: r2 * 65,
    size: 1 + r3 * 2,
    duration: 2 + r1 * 3,
    delay: r2 * 4,
  };
});

const PLANETS = [
  {
    left: "9%",
    top: "10%",
    size: 64,
    background: "radial-gradient(circle at 35% 30%, #f0a868 0%, #b8622e 55%, #6b3512 100%)",
    glow: "rgba(240,168,104,0.35)",
  },
  {
    left: "89%",
    top: "7%",
    size: 42,
    background: "radial-gradient(circle at 35% 30%, #8fc9e8 0%, #4a7fa8 55%, #1f3f5c 100%)",
    glow: "rgba(143,201,232,0.3)",
  },
  {
    left: "80%",
    top: "28%",
    size: 24,
    background: "radial-gradient(circle at 35% 30%, #d8b8e8 0%, #8a5ca8 55%, #4a2c5c 100%)",
    glow: "rgba(216,184,232,0.3)",
  },
];

export function ThroneHallBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* night sky base */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 50% 24%, rgba(255,205,120,0.12), transparent 65%), linear-gradient(180deg, #050308 0%, #0d0714 35%, #120c0f 100%)",
        }}
      />

      {/* twinkling stars */}
      {STARS.map((star, i) => (
        <div
          key={i}
          className="absolute animate-[star-twinkle_ease-in-out_infinite]"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            height: star.size,
            width: star.size,
            background: "#fefef0",
            clipPath: "circle(50% at 50% 50%)",
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}

      {/* larger planets scattered across the sky */}
      {PLANETS.map((p, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: p.left,
            top: p.top,
            height: p.size,
            width: p.size,
            clipPath: "circle(50% at 50% 50%)",
            background: p.background,
            boxShadow: `0 0 ${p.size * 0.5}px ${p.glow}`,
          }}
        />
      ))}

      {/* high side walls, receding with the hall */}
      <div
        className="absolute inset-y-0 left-0 w-[18%]"
        style={{ background: "linear-gradient(90deg, #241a16 0%, transparent 100%)" }}
      />
      <div
        className="absolute inset-y-0 right-0 w-[18%]"
        style={{ background: "linear-gradient(270deg, #241a16 0%, transparent 100%)" }}
      />

      {/* floor, tilted back for real 3D depth */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          top: "16%",
          bottom: 0,
          width: HALL_WIDTH,
          perspective: "900px",
        }}
      >
        <div
          className="relative h-full w-full"
          style={{ transformStyle: "preserve-3d", transform: "rotateX(58deg)" }}
        >
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(180deg, #2c241d 0%, #1a1512 100%)" }}
          />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, rgba(0,0,0,0.35) 0 2px, transparent 2px 46px), repeating-linear-gradient(180deg, rgba(0,0,0,0.3) 0 2px, transparent 2px 46px)",
            }}
          />
        </div>
      </div>

      {/* pillars — plain upright rectangles, each starting at the true top
          of the page, standing perpendicular to the floor */}
      <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2" style={{ width: HALL_WIDTH }}>
        {PILLAR_ROWS.map((row, i) => (
          <div key={i}>
            <Pillar row={row} side="left" />
            <Pillar row={row} side="right" />
          </div>
        ))}
      </div>

      {/* vaulted ceiling shadow at the very top */}
      <div
        className="absolute inset-x-0 top-0 h-24"
        style={{ background: "linear-gradient(180deg, #0a0608 0%, transparent 100%)" }}
      />
    </div>
  );
}

function Pillar({
  row,
  side,
}: {
  row: { heightPct: number; xPct: number; width: number; opacity: number };
  side: "left" | "right";
}) {
  const sideStyle = side === "left" ? { left: `${row.xPct}%` } : { right: `${row.xPct}%` };

  return (
    <div
      className="absolute top-0"
      style={{ height: `${row.heightPct}%`, width: row.width, opacity: row.opacity, ...sideStyle }}
    >
      {/* capital, touching the top of the page/ceiling */}
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2"
        style={{ width: row.width * 1.35, height: row.width * 0.4, background: "#c9a877" }}
      />
      {/* solid tan fluted shaft */}
      <div
        className="absolute inset-0"
        style={{
          background: "#c9a877",
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.16) 0 2px, rgba(0,0,0,0.08) 2px 4px, transparent 4px 11px)",
        }}
      />
      {/* base, meeting the floor at this row's depth */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{ width: row.width * 1.4, height: row.width * 0.45, background: "#c9a877" }}
      />
      {/* torch, on the nearer rows only */}
      {row.width > 55 && (
        <div className="absolute left-1/2 -translate-x-1/2" style={{ top: "4%" }}>
          <div style={{ width: 3, height: 24, background: "#2a1c10", margin: "0 auto" }} />
          <div
            className="absolute -top-2 left-1/2 h-3 w-2 -translate-x-1/2"
            style={{
              clipPath: "polygon(50% 0%, 90% 60%, 50% 100%, 10% 60%)",
              background: "linear-gradient(to top, #ff6a12, #ffd27a)",
              boxShadow: "0 0 10px rgba(255,140,20,0.85)",
              animationName: "fire-flicker",
              animationDuration: "1s",
              animationTimingFunction: "ease-in-out",
              animationIterationCount: "infinite",
            }}
          />
        </div>
      )}
    </div>
  );
}
