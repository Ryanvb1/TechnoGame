import type { CSSProperties } from "react";

const FLAME_VARIANTS = [
  "polygon(50% 0%, 75% 28%, 60% 24%, 85% 52%, 64% 48%, 90% 78%, 52% 100%, 16% 86%, 30% 56%, 8% 46%, 36% 30%, 18% 14%)",
  "polygon(48% 0%, 70% 18%, 92% 42%, 68% 58%, 94% 84%, 54% 100%, 18% 92%, 4% 60%, 28% 50%, 8% 24%, 40% 14%)",
  "polygon(50% 0%, 80% 35%, 65% 40%, 90% 70%, 50% 100%, 10% 70%, 35% 40%, 20% 35%)",
];

const FLAME_GRADIENTS = [
  "linear-gradient(to top, #7a0d02 0%, #ff4d0f 45%, #ffb238 80%, #fff3c4 100%)",
  "linear-gradient(to top, #8f1400 0%, #ff5b12 40%, #ffae35 75%, #ffe9a8 100%)",
  "linear-gradient(to top, #6e0d03 0%, #ef3d0f 50%, #ff9a2e 82%, #ffd98a 100%)",
];

const GROUND_CLIP_PATH =
  "polygon(0% 100%, 0% 58%, 5% 44%, 10% 60%, 16% 40%, 24% 56%, 32% 36%, 40% 54%, 48% 32%, 56% 53%, 64% 34%, 72% 58%, 80% 40%, 88% 60%, 94% 42%, 100% 58%, 100% 100%)";

// Deterministic pseudo-random in [0, 1) so the layout is stable across
// server/static renders instead of relying on Math.random().
function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

// Foreground flames — spread across the full width of the room.
const FLAME_COUNT = 26;
const FLAMES = Array.from({ length: FLAME_COUNT }, (_, i) => {
  const r1 = pseudoRandom(i * 3.1 + 1);
  const r2 = pseudoRandom(i * 7.7 + 2);
  const r3 = pseudoRandom(i * 5.3 + 3);
  return {
    left: (i / (FLAME_COUNT - 1)) * 96 + 2,
    jitter: (r1 - 0.5) * 5,
    width: 19 + r2 * 31,
    height: 48 + r1 * 82,
    tilt: (r3 - 0.5) * 10,
    variant: FLAME_VARIANTS[i % FLAME_VARIANTS.length],
    gradient: FLAME_GRADIENTS[(i + 1) % FLAME_GRADIENTS.length],
    duration: 0.9 + r3 * 0.9,
    delay: r2 * 1.4,
  };
});

// A dimmer, blurred layer of smaller flames further back for depth.
const BACK_FLAME_COUNT = 18;
const BACK_FLAMES = Array.from({ length: BACK_FLAME_COUNT }, (_, i) => {
  const r1 = pseudoRandom(i * 2.3 + 71);
  const r2 = pseudoRandom(i * 6.1 + 81);
  return {
    left: (i / (BACK_FLAME_COUNT - 1)) * 98 + 1,
    width: 14 + r1 * 18,
    height: 30 + r2 * 40,
    variant: FLAME_VARIANTS[i % FLAME_VARIANTS.length],
    duration: 1.1 + r1 * 0.8,
    delay: r2 * 1.6,
  };
});

const EMBER_COUNT = 12;
const EMBERS = Array.from({ length: EMBER_COUNT }, (_, i) => {
  const r1 = pseudoRandom(i * 4.4 + 21);
  const r2 = pseudoRandom(i * 8.8 + 31);
  return {
    left: 4 + i * 8 + (r1 - 0.5) * 6,
    drift: (r1 - 0.5) * 48,
    duration: 2.4 + r2 * 1.8,
    delay: r1 * 2.6,
  };
});

const SMOKE_COUNT = 8;
const SMOKE = Array.from({ length: SMOKE_COUNT }, (_, i) => {
  const r1 = pseudoRandom(i * 6.6 + 41);
  const r2 = pseudoRandom(i * 9.9 + 51);
  return {
    left: 4 + i * 12 + (r1 - 0.5) * 8,
    size: 55 + r1 * 53,
    duration: 5 + r2 * 3,
    delay: r1 * 3,
  };
});

export function FirePit() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 flex items-end justify-center overflow-hidden">
      {/* hazy fire-lit sky, spanning the whole room */}
      <div
        className="absolute inset-x-0 bottom-0 h-full animate-[fire-glow-pulse_3s_ease-in-out_infinite]"
        style={{
          background:
            "radial-gradient(ellipse 100% 65% at 50% 100%, rgba(255,90,20,0.5), transparent 72%)",
        }}
      />

      {/* distant, dimmer flame layer for depth */}
      {BACK_FLAMES.map((flame, i) => (
        <div
          key={i}
          className="absolute bottom-8 opacity-40 blur-[1px]"
          style={{
            left: `${flame.left}%`,
            width: flame.width,
            height: flame.height,
            transform: "translateX(-50%)",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              clipPath: flame.variant,
              background: "linear-gradient(to top, #7a1200, #ff7a1f, #ffd98a)",
              animationName: "fire-flicker",
              animationDuration: `${flame.duration}s`,
              animationDelay: `${flame.delay}s`,
              animationTimingFunction: "ease-in-out",
              animationIterationCount: "infinite",
            }}
          />
        </div>
      ))}

      {/* drifting smoke, behind the foreground flames */}
      {SMOKE.map((s, i) => (
        <div
          key={i}
          className="absolute bottom-28"
          style={{
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            background:
              "radial-gradient(closest-side, rgba(40,32,28,0.55), transparent 75%)",
            filter: "blur(7px)",
            animationName: "smoke-drift",
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
            animationTimingFunction: "ease-out",
            animationIterationCount: "infinite",
          }}
        />
      ))}

      {/* jagged charred ground spanning the whole room */}
      <div
        className="absolute inset-x-0 bottom-0 h-28 sm:h-32"
        style={{
          clipPath: GROUND_CLIP_PATH,
          background: "linear-gradient(180deg, #2a1006 0%, #0d0402 100%)",
        }}
      />

      {/* dense, uneven field of flames spread across the entire room —
          position/tilt are static on the outer wrapper so the flicker
          animation (which also animates `transform`) can't clobber them */}
      {FLAMES.map((flame, i) => (
        <div
          key={i}
          className="absolute bottom-5"
          style={{
            left: `${flame.left + flame.jitter}%`,
            width: flame.width,
            height: flame.height,
            transform: `translateX(-50%) rotate(${flame.tilt}deg)`,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              clipPath: flame.variant,
              background: flame.gradient,
              filter: "drop-shadow(0 0 10px rgba(255,120,20,0.8))",
              animationName: "fire-flicker",
              animationDuration: `${flame.duration}s`,
              animationDelay: `${flame.delay}s`,
              animationTimingFunction: "ease-in-out",
              animationIterationCount: "infinite",
            }}
          />
        </div>
      ))}

      {/* embers rising across the whole room */}
      {EMBERS.map((ember, i) => (
        <div
          key={i}
          className="absolute bottom-20 h-[7px] w-[7px]"
          style={
            {
              left: `${ember.left}%`,
              clipPath: "circle(50% at 50% 50%)",
              background: "#ffd27a",
              boxShadow: "0 0 7px #ffb238",
              "--ember-drift": `${ember.drift}px`,
              animationName: "ember-rise",
              animationDuration: `${ember.duration}s`,
              animationDelay: `${ember.delay}s`,
              animationTimingFunction: "ease-out",
              animationIterationCount: "infinite",
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
