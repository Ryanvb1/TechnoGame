import type { CSSProperties } from "react";

// Deterministic pseudo-random in [0, 1) so the layout is stable across
// server/static renders instead of relying on Math.random().
function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const STAR_COUNT = 26;
const STARS = Array.from({ length: STAR_COUNT }, (_, i) => {
  const r1 = pseudoRandom(i * 3.3 + 5);
  const r2 = pseudoRandom(i * 7.1 + 9);
  const r3 = pseudoRandom(i * 5.9 + 13);
  return {
    left: r1 * 100,
    top: r2 * 52,
    size: 1 + r3 * 2,
    duration: 2 + r1 * 3,
    delay: r2 * 4,
  };
});

const FIREFLY_COUNT = 10;
const FIREFLIES = Array.from({ length: FIREFLY_COUNT }, (_, i) => {
  const r1 = pseudoRandom(i * 4.1 + 61);
  const r2 = pseudoRandom(i * 8.3 + 71);
  const r3 = pseudoRandom(i * 6.7 + 81);
  return {
    left: 4 + r1 * 92,
    bottom: 4 + r2 * 46,
    duration: 6 + r3 * 4,
    delay: r1 * 5,
    dx: (r3 - 0.5) * 40,
  };
});

// Silhouette pine trees along the horizon, varying height/position.
const TREES = [
  { left: "2%", height: 120, width: 70 },
  { left: "12%", height: 80, width: 52 },
  { left: "82%", height: 96, width: 60 },
  { left: "92%", height: 130, width: 76 },
  { left: "70%", height: 70, width: 46 },
];

const TREE_CLIP_PATH =
  "polygon(50% 0%, 66% 22%, 58% 22%, 74% 46%, 64% 46%, 82% 74%, 60% 74%, 60% 100%, 40% 100%, 40% 74%, 18% 74%, 36% 46%, 26% 46%, 42% 22%, 34% 22%)";

// How much of the viewport, from the bottom, the tilted 3D grass field
// covers. The treeline/cottage sit right at its far edge, at the horizon.
// Kept tall (and the tilt shallow, below) so the flatter, less-foreshortened
// near portion of the field reaches all the way up to the gnome's feet.
const GROUND_HEIGHT_PCT = 80;

// Grass blades scattered across the field — further down (closer to the
// viewer) they're taller/wider, a simple perspective size cue.
const GRASS_BLADE_COUNT = 50;
const GRASS_BLADES = Array.from({ length: GRASS_BLADE_COUNT }, (_, i) => {
  const r1 = pseudoRandom(i * 3.7 + 101);
  const r2 = pseudoRandom(i * 6.3 + 111);
  const r3 = pseudoRandom(i * 5.1 + 121);
  const top = 12 + r2 * 86;
  return {
    left: r1 * 100,
    top,
    height: 5 + (top / 100) * 20,
    width: 3 + (top / 100) * 4,
    tilt: (r3 - 0.5) * 24,
  };
});

const MUSHROOM_SPOTS = [
  { left: "14%", top: "78%" },
  { left: "80%", top: "64%" },
  { left: "88%", top: "86%" },
  { left: "8%", top: "50%" },
];

const FLOWER_SPOTS = [
  { left: "24%", top: "60%" },
  { left: "64%", top: "72%" },
  { left: "72%", top: "44%" },
  { left: "20%", top: "88%" },
  { left: "58%", top: "90%" },
];

export function FairytaleBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* dusk-to-night sky */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #0d0a24 0%, #2a2059 32%, #4a3572 55%, #1a1428 100%)",
        }}
      />

      {/* glowing moon */}
      <div
        className="absolute right-[12%] top-[10%] h-24 w-24 sm:h-32 sm:w-32"
        style={{
          clipPath: "circle(50% at 50% 50%)",
          background:
            "radial-gradient(circle at 38% 35%, #fffef2 0%, #fdf6d8 45%, #e8dba0 100%)",
          boxShadow: "0 0 60px rgba(253,246,216,0.55), 0 0 120px rgba(253,246,216,0.25)",
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

      {/* fairytale cottage — a round door and window in a mushroom-capped
          little house, tucked into the treeline at the horizon */}
      <div
        className="absolute left-[38%] h-24 w-20 sm:h-28 sm:w-24"
        style={{ bottom: `${GROUND_HEIGHT_PCT}%` }}
      >
        <div
          className="absolute bottom-0 h-16 w-full sm:h-20"
          style={{ background: "linear-gradient(180deg, #6b4a30 0%, #4a3220 100%)" }}
        />
        <div
          className="absolute left-1/2 bottom-0 h-8 w-8 -translate-x-1/2"
          style={{ clipPath: "circle(50% at 50% 0%)", background: "#2a1a10" }}
        />
        <div
          className="absolute left-2 top-2 h-4 w-4"
          style={{ clipPath: "circle(50% at 50% 50%)", background: "#ffd98a", boxShadow: "0 0 10px #ffd98a" }}
        />
        {/* mushroom-cap roof */}
        <div
          className="absolute -top-6 left-1/2 h-10 w-28 -translate-x-1/2 sm:h-12 sm:w-32"
          style={{
            clipPath: "circle(50% at 50% 100%)",
            background:
              "radial-gradient(circle at 50% 20%, #e0546a 0%, #b8324a 55%, #7a1c2e 100%)",
          }}
        >
          <div className="absolute left-[20%] top-[30%] h-2 w-2" style={{ clipPath: "circle(50% at 50% 50%)", background: "rgba(255,255,255,0.65)" }} />
          <div className="absolute left-[55%] top-[45%] h-3 w-3" style={{ clipPath: "circle(50% at 50% 50%)", background: "rgba(255,255,255,0.6)" }} />
          <div className="absolute left-[75%] top-[25%] h-2 w-2" style={{ clipPath: "circle(50% at 50% 50%)", background: "rgba(255,255,255,0.6)" }} />
        </div>
      </div>

      {/* silhouette treeline, right at the horizon */}
      {TREES.map((tree, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: tree.left,
            bottom: `${GROUND_HEIGHT_PCT}%`,
            height: tree.height,
            width: tree.width,
            clipPath: TREE_CLIP_PATH,
            background: "linear-gradient(180deg, #140f24 0%, #0a0716 100%)",
          }}
        />
      ))}

      {/* soft haze along the horizon */}
      <div
        className="absolute inset-x-0"
        style={{
          bottom: `${GROUND_HEIGHT_PCT}%`,
          height: 60,
          background: "linear-gradient(180deg, transparent 0%, rgba(180,170,220,0.16) 100%)",
        }}
      />

      {/* tilted 3D grass field the gnome actually stands on, instead of
          floating over an empty background */}
      <div
        className="absolute inset-x-0 bottom-0 overflow-hidden"
        style={{ height: `${GROUND_HEIGHT_PCT}%`, perspective: "1400px" }}
      >
        <div
          className="absolute bottom-0 left-[-20%]"
          style={{
            width: "140%",
            height: "280%",
            transformStyle: "preserve-3d",
            transform: "rotateX(42deg)",
            transformOrigin: "bottom",
          }}
        >
          {/* grass base, darker/desaturated toward the horizon (far) */}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(180deg, #24401f 0%, #386730 45%, #57a13f 100%)" }}
          />

          {/* dirt path leading up to the cottage door */}
          <div
            className="absolute inset-0"
            style={{
              clipPath: "polygon(46% 0%, 54% 0%, 66% 100%, 34% 100%)",
              background: "linear-gradient(180deg, #7a6448 0%, #93794f 100%)",
            }}
          />

          {/* scattered mushrooms */}
          {MUSHROOM_SPOTS.map((m, i) => (
            <div key={i} className="absolute h-4 w-3" style={{ left: m.left, top: m.top }}>
              <div className="absolute bottom-0 left-1/2 h-2 w-1 -translate-x-1/2 bg-[#e8ddc8]" />
              <div
                className="absolute bottom-[6px] left-1/2 h-2 w-3 -translate-x-1/2"
                style={{ clipPath: "circle(50% at 50% 100%)", background: "#c9394f" }}
              />
            </div>
          ))}

          {/* scattered flowers */}
          {FLOWER_SPOTS.map((f, i) => (
            <div key={i} className="absolute h-[7px] w-[7px]" style={{ left: f.left, top: f.top }}>
              <div
                className="absolute inset-0"
                style={{ clipPath: "circle(50% at 50% 50%)", background: "#fdf6e3" }}
              />
              <div
                className="absolute left-1/2 top-1/2 h-[3px] w-[3px] -translate-x-1/2 -translate-y-1/2"
                style={{ clipPath: "circle(50% at 50% 50%)", background: "#f2c14e" }}
              />
            </div>
          ))}

          {/* grass blade texture, taller/wider toward the front (near) */}
          {GRASS_BLADES.map((b, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${b.left}%`,
                top: `${b.top}%`,
                width: b.width,
                height: b.height,
                clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                background: "linear-gradient(180deg, #82c25c 0%, #3f7a34 100%)",
                transform: `rotate(${b.tilt}deg)`,
              }}
            />
          ))}
        </div>
      </div>

      {/* drifting fireflies */}
      {FIREFLIES.map((f, i) => (
        <div
          key={i}
          className="absolute h-[5px] w-[5px] animate-[ember-rise_ease-in-out_infinite]"
          style={
            {
              left: `${f.left}%`,
              bottom: `${f.bottom}%`,
              clipPath: "circle(50% at 50% 50%)",
              background: "#d9f7a0",
              boxShadow: "0 0 8px #d9f7a0",
              "--ember-drift": `${f.dx}px`,
              animationDuration: `${f.duration}s`,
              animationDelay: `${f.delay}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
