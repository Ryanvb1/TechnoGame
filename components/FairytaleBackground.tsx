import type { CSSProperties } from "react";
import { CollectibleOrb } from "./CollectibleOrb";

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

// Kept clear of the dugout hollow (roughly left 16-84%, top 40-98%), so
// they only grow in the open grass around it.
const MUSHROOM_SPOTS = [
  { left: "6%", top: "78%" },
  { left: "92%", top: "64%" },
  { left: "94%", top: "86%" },
  { left: "4%", top: "50%" },
];

const FLOWER_SPOTS = [
  { left: "8%", top: "60%" },
  { left: "90%", top: "72%" },
  { left: "10%", top: "30%" },
  { left: "88%", top: "34%" },
  { left: "6%", top: "92%" },
];

// A rounded hollow dug into the earth — the gnome's little dugout, sunk
// below the surrounding grass rather than a flat dirt road.
const DUGOUT_CLIP_PATH =
  "polygon(50% 2%, 74% 8%, 92% 26%, 98% 52%, 88% 76%, 68% 94%, 32% 96%, 10% 80%, 2% 54%, 8% 28%, 26% 10%)";

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

          {/* the dugout — a hollow dug into the earth where the gnome has
              set up a little home, sunk below the surrounding grass
              instead of a flat dirt road */}
          <div
            className="absolute"
            style={{
              left: "18%",
              top: "40%",
              width: "64%",
              height: "58%",
              clipPath: DUGOUT_CLIP_PATH,
              background:
                "radial-gradient(ellipse at 50% 38%, #8a6b46 0%, #6b4f30 45%, #4a3620 78%, #2e2012 100%)",
              boxShadow: "inset 0 18px 40px rgba(0,0,0,0.55)",
            }}
          >
            {/* cut-sod rim, a thin ring of exposed root-earth where the
                grass was dug away */}
            <div
              className="absolute inset-0 opacity-70"
              style={{
                clipPath: DUGOUT_CLIP_PATH,
                boxShadow: "inset 0 0 0 6px rgba(58,42,26,0.65)",
              }}
            />
            {/* a couple of root tendrils poking from the earthen wall */}
            <div
              className="absolute left-[8%] top-[20%] h-[3px] w-[22%] rotate-[8deg]"
              style={{ background: "#5c4326", clipPath: "polygon(0% 40%, 100% 0%, 100% 100%, 0% 60%)" }}
            />
            <div
              className="absolute right-[10%] top-[55%] h-[3px] w-[18%] rotate-[-12deg]"
              style={{ background: "#5c4326", clipPath: "polygon(0% 0%, 100% 40%, 100% 60%, 0% 100%)" }}
            />
          </div>

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

          {/* small lantern post, warm ambient light in the dugout — the
              only man-made prop left in the clutter, kept for the
              ambient glow it casts */}
          <div
            className="absolute origin-bottom scale-[6] sm:scale-[12]"
            style={{ left: "44%", top: "44%", width: 4, height: 34 }}
          >
            <div className="absolute bottom-0 h-full w-full bg-[#3a2c1c]" />
            <div
              className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2"
              style={{
                clipPath: "circle(50% at 50% 50%)",
                background: "radial-gradient(circle, #ffe9a0 0%, #caa243 70%, #7a5c1f 100%)",
                boxShadow: "0 0 14px rgba(255,220,140,0.75)",
              }}
            />
          </div>
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

// The fairytale cottage — a round door and window in a mushroom-capped
// little house, tucked into the treeline at the horizon. Kept over on the
// left so its mushroom cap doesn't overlap the centered title/paragraph
// text. Rendered as its own sibling (not nested inside FairytaleBackground
// above) rather than folded into that decorative layer's -z-10 stacking —
// anything painted at a negative z-index sits *behind* this page's own
// normal-flow content for hit-testing purposes regardless of local
// pointer-events, so the orb tucked into the cap below would otherwise be
// permanently unclickable.
export function MushroomCottage() {
  return (
    <div className="pointer-events-none fixed inset-0">
      <div
        className="absolute left-[2%] h-24 w-20 sm:left-[8%] sm:h-28 sm:w-24"
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
        {/* one of the gnome's hidden orbs (see gnomeProgress.ts), tucked
            behind the mushroom cap's curved right edge — no separate prop
            of its own, just DOM order stacking it behind the cap below */}
        <CollectibleOrb id="fairyland" style={{ left: 88, top: -6 }} />
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
    </div>
  );
}
