import { forwardRef } from "react";

// The cave's environment — rendered fixed behind whatever CaveScene puts in
// normal flow (the bear, the mission UI), the same split ThroneHallBackground
// and Throne/Knight use for the throne room. Three depth bands (far/mid/near)
// run through every repeated element here (stalactites, stalagmites,
// lanterns) via DEPTH_STYLE below, plus a real perspective floor (the same
// rotateX trick as ThroneHallBackground's), so the cave reads as a real
// hollow space receding back into darkness rather than a flat backdrop.

// Deterministic pseudo-random in [0, 1), and rounded to a short fixed
// precision — same pair used in ThroneHallBackground/pillarColors. This
// file has no "use client" of its own, but it's imported straight into
// CaveScene (a client component), so its inline styles still have to come
// out byte-identical between the server-rendered HTML and the client's
// hydration pass; raw Math.random()/Math.sin() floats don't guarantee that.
function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}
function round(n: number) {
  return Math.round(n * 10000) / 10000;
}

type Depth = "far" | "mid" | "near";

// Governs every repeated prop's scale/opacity/blur by how "deep" into the
// cave it sits — the same near-bigger-sharper/far-smaller-dimmer-blurrier
// logic FirePit uses for its two flame layers, just with a third band.
const DEPTH_STYLE: Record<Depth, { scale: number; opacity: number; blur: number }> = {
  far: { scale: 0.55, opacity: 0.4, blur: 1.5 },
  mid: { scale: 0.8, opacity: 0.75, blur: 0.3 },
  near: { scale: 1.25, opacity: 1, blur: 0 },
};

const CAVE_WIDTH = "min(1400px, 220vw)";

const STALACTITE_CLIP_PATH = "polygon(8% 0%, 92% 0%, 64% 60%, 50% 100%, 36% 60%)";
const STALAGMITE_CLIP_PATH = "polygon(8% 100%, 92% 100%, 64% 40%, 50% 0%, 36% 40%)";

const STALACTITES: { left: number; size: number; depth: Depth }[] = [
  { left: 6, size: 120, depth: "far" },
  { left: 22, size: 90, depth: "mid" },
  { left: 38, size: 150, depth: "near" },
  { left: 52, size: 70, depth: "far" },
  { left: 64, size: 130, depth: "mid" },
  { left: 78, size: 95, depth: "far" },
  { left: 90, size: 160, depth: "near" },
];

const STALAGMITES: { left: number; size: number; depth: Depth }[] = [
  { left: 4, size: 80, depth: "mid" },
  { left: 14, size: 130, depth: "near" },
  { left: 86, size: 110, depth: "near" },
  { left: 95, size: 70, depth: "mid" },
  { left: 47, size: 50, depth: "far" },
];

// Left/right wall mounts (mid depth) plus one big foreground post on each
// side flanking the den, and one small dim one deep at the back — five
// lanterns total, spaced so the whole room stays lit rather than just the
// spot the player's looking at.
const LANTERNS: { left: number; top: number; depth: Depth; side: "left" | "right" }[] = [
  { left: 3, top: 74, depth: "near", side: "left" },
  { left: 97, top: 76, depth: "near", side: "right" },
  { left: 12, top: 42, depth: "mid", side: "left" },
  { left: 88, top: 40, depth: "mid", side: "right" },
  { left: 50, top: 22, depth: "far", side: "right" },
];

type GlyphVariant = "hand" | "sun" | "zigzag" | "antler" | "dots";
const WRITINGS: { left: number; top: number; size: number; rotate: number; variant: GlyphVariant }[] = [
  { left: 9, top: 52, size: 30, rotate: -6, variant: "hand" },
  { left: 91, top: 50, size: 26, rotate: 8, variant: "sun" },
  { left: 16, top: 66, size: 34, rotate: 3, variant: "zigzag" },
  { left: 84, top: 64, size: 28, rotate: -4, variant: "antler" },
  { left: 6, top: 34, size: 22, rotate: 10, variant: "dots" },
  { left: 94, top: 30, size: 20, rotate: -8, variant: "hand" },
];

const DUST_COUNT = 10;
const DUST = Array.from({ length: DUST_COUNT }, (_, i) => {
  const r1 = pseudoRandom(i * 4.1 + 61);
  const r2 = pseudoRandom(i * 8.3 + 71);
  return {
    left: round(6 + r1 * 88),
    bottom: round(10 + r2 * 55),
    size: round(1.5 + r1 * 2),
    duration: round(6 + r2 * 5),
    delay: round(r1 * 5),
  };
});

// Forwards a ref onto the floor's own content slot (see below) so
// CaveBearFight can portal the fight's quadrant grid straight into this
// same tilted plane — the quadrants end up genuinely being a subdivision
// of this floor, not a separate flat panel positioned near it.
export const CaveBackground = forwardRef<HTMLDivElement, { awake?: boolean }>(function CaveBackground(
  { awake = false },
  floorContentRef,
) {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {/* base darkness — a hair warmer than the throne hall's night sky,
          since this is lantern-lit stone rather than open sky */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 65% 40% at 50% 30%, rgba(120,80,40,0.1), transparent 65%), linear-gradient(180deg, #08060a 0%, #100b0c 40%, #170f0c 100%)",
        }}
      />

      {/* distant cavern ceiling, cresting into view the same way the
          throne hall's toad does — establishes there's more cave beyond
          what's lit, before anything else is drawn on top of it */}
      <div
        className="absolute inset-x-0 top-0 h-[30%] opacity-50 blur-[2px]"
        style={{
          clipPath:
            "polygon(0% 0%, 100% 0%, 100% 40%, 88% 60%, 74% 44%, 60% 68%, 48% 46%, 34% 66%, 20% 42%, 6% 58%, 0% 38%)",
          background: "linear-gradient(180deg, #241a16 0%, #120c0a 100%)",
        }}
      />

      {/* far stalactites/stalagmites — drawn first (behind the walls/
          lanterns/writings below) so the mid/near layers naturally occlude
          the lower halves of anything deep, exactly like the throne hall's
          toad sitting behind its own floor */}
      {STALACTITES.filter((s) => s.depth === "far").map((s, i) => (
        <Stalactite key={i} {...s} />
      ))}
      {STALAGMITES.filter((s) => s.depth === "far").map((s, i) => (
        <Stalagmite key={i} {...s} />
      ))}

      {/* side walls, receding — a jagged rock edge (clip-path) rather than
          a flat gradient rectangle, so the silhouette itself reads as hewn
          stone even in a single flat tone */}
      <div
        className="absolute inset-y-0 left-0 h-full w-[22%]"
        style={{
          clipPath:
            "polygon(0% 0%, 100% 0%, 74% 9%, 100% 19%, 70% 27%, 100% 38%, 76% 47%, 100% 58%, 72% 66%, 100% 76%, 78% 85%, 100% 94%, 0% 100%)",
          background: "linear-gradient(90deg, #1c1310 0%, #241a15 55%, transparent 100%)",
        }}
      />
      <div
        className="absolute inset-y-0 right-0 h-full w-[22%]"
        style={{
          clipPath:
            "polygon(100% 0%, 0% 0%, 26% 9%, 0% 19%, 30% 27%, 0% 38%, 24% 47%, 0% 58%, 28% 66%, 0% 76%, 22% 85%, 0% 94%, 100% 100%)",
          background: "linear-gradient(270deg, #1c1310 0%, #241a15 55%, transparent 100%)",
        }}
      />

      {/* wall writings — ancient, still, unlit by anything but whatever
          lantern happens to fall near them; deliberately not animated (see
          the flickering lanterns below for the room's only real motion) */}
      {WRITINGS.map((w, i) => (
        <WallWriting key={i} {...w} />
      ))}

      {/* a single thin seam of something else entirely, embedded in the
          rock — the one deliberately unnatural, neon-green detail in an
          otherwise all-ochre-and-firelight room */}
      <CrystalVein />

      {/* mid stalactites/stalagmites */}
      {STALACTITES.filter((s) => s.depth === "mid").map((s, i) => (
        <Stalactite key={i} {...s} />
      ))}
      {STALAGMITES.filter((s) => s.depth === "mid").map((s, i) => (
        <Stalagmite key={i} {...s} />
      ))}

      {/* the floor, tilted back for real 3D depth — same perspective/
          rotateX trick as the throne hall's, textured as rough, mottled
          stone rather than swept flagstone.
          Fixed pixel top/height rather than the old "34% / bottom:0" —
          with a rotateX'd + perspective'd child, a percentage-height
          container's *projected* far edge moves a lot with viewport
          height (e.g. its screen position drifted 100px between a 720px
          and a 900px tall window), which used to leave CaveBear's own
          fixed-from-page-top position floating an inconsistent amount
          above the visible floor. Fixed pixels make the container's own
          3D projection viewport-height-independent, the same fix
          FightBackground's floor got for the same underlying reason —
          values below match the old 34%/66% split at a representative
          800px-tall viewport. */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{ top: 272, height: 528, width: CAVE_WIDTH, perspective: "900px" }}
      >
        <div className="relative h-full w-full" style={{ transformStyle: "preserve-3d", transform: "rotateX(58deg)" }}>
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #241a14 0%, #140d0a 100%)" }} />
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(0,0,0,0.4) 0 3px, transparent 4px), radial-gradient(circle, rgba(255,255,255,0.06) 0 2px, transparent 3px)",
              backgroundSize: "38px 38px, 21px 21px",
              backgroundPosition: "0 0, 12px 9px",
            }}
          />

          {/* Floor content slot — CaveBearFight portals the fight's own
              quadrant grid straight in here, so the quadrants end up as a
              real subdivision of this exact tilted plane rather than a
              separate flat panel positioned near it. preserve-3d so
              anything portaled in that needs to stay upright (a standing
              torch, the player's own sprite) can counter-rotate against
              this plane's tilt and still sit in true 3D space instead of
              being flattened into it. */}
          <div ref={floorContentRef} className="absolute inset-0" style={{ transformStyle: "preserve-3d" }} />
        </div>
      </div>

      {/* lanterns — the room's only light sources and its only motion
          besides the drifting dust below */}
      {LANTERNS.map((l, i) => (
        <Lantern key={i} {...l} />
      ))}

      {/* near stalactites/stalagmites, plus a few loose bones scattered at
          the den's edge — closest to camera, fully sharp, nothing behind
          them left to occlude */}
      {STALACTITES.filter((s) => s.depth === "near").map((s, i) => (
        <Stalactite key={i} {...s} />
      ))}
      {STALAGMITES.filter((s) => s.depth === "near").map((s, i) => (
        <Stalagmite key={i} {...s} />
      ))}
      <Bone left={30} bottom={7} rotate={-18} />
      <Bone left={68} bottom={5} rotate={24} />
      <Bone left={58} bottom={9} rotate={-4} />

      {/* dust motes, drifting up through the lantern light — warm gold
          rather than AmbientDetails' neon, since these are lit by fire,
          not magic */}
      {DUST.map((d, i) => (
        <div
          key={i}
          className="absolute animate-[particle-drift_ease-in-out_infinite]"
          style={{
            left: `${d.left}%`,
            bottom: `${d.bottom}%`,
            height: d.size,
            width: d.size,
            clipPath: "circle(50% at 50% 50%)",
            background: "#ffd98a",
            opacity: 0.5,
            boxShadow: "0 0 4px rgba(255,217,138,0.6)",
            animationDuration: `${d.duration}s`,
            animationDelay: `${d.delay}s`,
            ["--particle-dx" as never]: "6px",
          }}
        />
      ))}

      {/* the mood shift once he wakes — a slow-fading red wash over the
          whole room, layered on top of everything above rather than
          swapped in, so it reads as light changing in the room instead of
          a hard cut */}
      <div
        className="absolute inset-0 transition-opacity duration-[1200ms]"
        style={{
          opacity: awake ? 0.4 : 0,
          background: "radial-gradient(ellipse 70% 55% at 50% 62%, rgba(200,40,20,0.55), transparent 72%)",
        }}
      />

      {/* vaulted ceiling shadow at the very top */}
      <div className="absolute inset-x-0 top-0 h-24" style={{ background: "linear-gradient(180deg, #050303 0%, transparent 100%)" }} />
    </div>
  );
});

function Stalactite({ left, size, depth }: { left: number; size: number; depth: Depth }) {
  const d = DEPTH_STYLE[depth];
  return (
    <div
      className="absolute top-0"
      style={{
        left: `${left}%`,
        width: size * d.scale,
        height: size * 1.9 * d.scale,
        opacity: d.opacity,
        filter: d.blur ? `blur(${d.blur}px)` : undefined,
        clipPath: STALACTITE_CLIP_PATH,
        background: "linear-gradient(180deg, #4a3d33 0%, #241a14 75%, #140d0a 100%)",
      }}
    />
  );
}

function Stalagmite({ left, size, depth }: { left: number; size: number; depth: Depth }) {
  const d = DEPTH_STYLE[depth];
  return (
    <div
      className="absolute bottom-0"
      style={{
        left: `${left}%`,
        width: size * d.scale,
        height: size * 1.6 * d.scale,
        opacity: d.opacity,
        filter: d.blur ? `blur(${d.blur}px)` : undefined,
        clipPath: STALAGMITE_CLIP_PATH,
        background: "linear-gradient(0deg, #140d0a 0%, #241a14 55%, #4a3d33 100%)",
      }}
    />
  );
}

function Bone({ left, bottom, rotate }: { left: number; bottom: number; rotate: number }) {
  return (
    <div
      className="absolute h-[6px] w-9 opacity-80"
      style={{
        left: `${left}%`,
        bottom: `${bottom}%`,
        transform: `rotate(${rotate}deg)`,
        background: "linear-gradient(180deg, #e8e2d0 0%, #b8ae94 100%)",
        clipPath:
          "polygon(0% 40%, 8% 20%, 14% 40%, 14% 60%, 8% 80%, 0% 60%, 6% 50%, 94% 50%, 100% 40%, 92% 20%, 86% 40%, 86% 60%, 92% 80%, 100% 60%)",
      }}
    />
  );
}

// A hanging lantern: a wall bracket, a short chain, an iron cage around a
// flickering flame, and a soft glow pool it casts on the rock nearby — the
// same fire-flicker/fire-glow-pulse keyframes FirePit and the throne hall's
// torches already use, so every fire in the game reads as the same fire.
function Lantern({ left, top, depth, side }: { left: number; top: number; depth: Depth; side: "left" | "right" }) {
  const d = DEPTH_STYLE[depth];
  const scale = d.scale;
  return (
    <div
      className="absolute"
      style={{ left: `${left}%`, top: `${top}%`, opacity: d.opacity, filter: d.blur ? `blur(${d.blur}px)` : undefined }}
    >
      {/* glow pool, well behind the fixture itself */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-[fire-glow-pulse_3s_ease-in-out_infinite]"
        style={{
          width: 140 * scale,
          height: 140 * scale,
          background: "radial-gradient(closest-side, rgba(255,150,60,0.35), transparent 70%)",
        }}
      />
      {/* bracket driven into the wall */}
      <div
        className="absolute top-0"
        style={{
          [side === "left" ? "left" : "right"]: 0,
          width: 16 * scale,
          height: 3 * scale,
          background: "#2a2118",
          transform: side === "left" ? "rotate(-8deg)" : "rotate(8deg)",
        }}
      />
      {/* chain */}
      <div className="relative mx-auto" style={{ width: 2, height: 14 * scale, background: "#3a3226" }} />
      {/* cage + flame */}
      <div className="relative" style={{ width: 22 * scale, height: 30 * scale }}>
        <div
          className="absolute inset-0 border"
          style={{ borderColor: "#2a231a", background: "rgba(20,14,8,0.35)", clipPath: "polygon(20% 0%, 80% 0%, 100% 18%, 100% 88%, 80% 100%, 20% 100%, 0% 88%, 0% 18%)" }}
        />
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: 12 * scale,
            height: 18 * scale,
            clipPath: "polygon(50% 0%, 80% 35%, 62% 30%, 88% 65%, 50% 100%, 12% 65%, 38% 30%, 20% 35%)",
            background: "linear-gradient(to top, #7a1200 0%, #ff7a1f 45%, #ffe9a8 100%)",
            boxShadow: `0 0 ${10 * scale}px rgba(255,140,20,0.9)`,
            animationName: "fire-flicker",
            animationDuration: "0.9s",
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
          }}
        />
      </div>
    </div>
  );
}

// The one neon detail in an otherwise firelit-and-ochre room — a thin
// jagged seam of glowing mineral running through the left wall, low enough
// to read as "found", not staged. Purely a detail; nothing reacts to it.
function CrystalVein() {
  return (
    <svg className="absolute left-0 top-[38%] h-[22%] w-[16%] overflow-visible opacity-70" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        points="4,0 22,18 10,34 30,50 16,68 34,86 24,100"
        fill="none"
        stroke="var(--neon-dim)"
        strokeWidth={3}
        vectorEffect="non-scaling-stroke"
        style={{ filter: "drop-shadow(0 0 4px var(--neon))", opacity: 0.8 }}
        className="animate-[fire-glow-pulse_4.5s_ease-in-out_infinite]"
      />
    </svg>
  );
}

function WallWriting({
  left,
  top,
  size,
  rotate,
  variant,
}: {
  left: number;
  top: number;
  size: number;
  rotate: number;
  variant: GlyphVariant;
}) {
  return (
    <div className="absolute" style={{ left: `${left}%`, top: `${top}%`, width: size, height: size, transform: `rotate(${rotate}deg)` }}>
      {variant === "hand" && <HandGlyph />}
      {variant === "sun" && <SunGlyph />}
      {variant === "zigzag" && <ZigzagGlyph />}
      {variant === "antler" && <AntlerGlyph />}
      {variant === "dots" && <DotsGlyph />}
    </div>
  );
}

const OCHRE = "#8a5a2f";

// A crude splayed hand-print — real cave hand stencils read as rough
// silhouettes, not anatomical, so one irregular blob shape is more honest
// to the source than a carefully fingered outline would be.
function HandGlyph() {
  return (
    <div
      className="h-full w-full opacity-60"
      style={{
        background: OCHRE,
        clipPath:
          "polygon(38% 100%, 28% 58%, 8% 52%, 14% 22%, 27% 32%, 28% 0%, 41% 12%, 44% 34%, 55% 6%, 61% 32%, 72% 14%, 74% 38%, 88% 26%, 84% 56%, 60% 100%)",
      }}
    />
  );
}

function SunGlyph() {
  const rays = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <div className="relative h-full w-full opacity-60">
      <div className="absolute left-1/2 top-1/2 h-[45%] w-[45%] -translate-x-1/2 -translate-y-1/2" style={{ clipPath: "circle(50% at 50% 50%)", background: OCHRE }} />
      {rays.map((deg) => (
        <div
          key={deg}
          className="absolute left-1/2 top-1/2 h-[2px] w-1/2 origin-left"
          style={{ background: OCHRE, transform: `rotate(${deg}deg)` }}
        />
      ))}
    </div>
  );
}

function ZigzagGlyph() {
  return (
    <svg className="h-full w-full opacity-60" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline points="0,10 30,40 0,60 30,90" fill="none" stroke={OCHRE} strokeWidth={9} vectorEffect="non-scaling-stroke" />
      <polyline points="50,0 80,30 50,60 80,100" fill="none" stroke={OCHRE} strokeWidth={9} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function AntlerGlyph() {
  return (
    <svg className="h-full w-full opacity-60" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polygon points="35,100 65,100 50,55" fill={OCHRE} />
      <polyline points="50,55 30,25 12,30" fill="none" stroke={OCHRE} strokeWidth={6} vectorEffect="non-scaling-stroke" />
      <polyline points="50,55 30,25 38,8" fill="none" stroke={OCHRE} strokeWidth={6} vectorEffect="non-scaling-stroke" />
      <polyline points="50,55 70,25 88,30" fill="none" stroke={OCHRE} strokeWidth={6} vectorEffect="non-scaling-stroke" />
      <polyline points="50,55 70,25 62,8" fill="none" stroke={OCHRE} strokeWidth={6} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

// A little scattered star-map-like cluster of dots — deliberately the same
// idea as the night sky's STARS, just re-drawn in ochre on rock instead of
// light in the sky.
const DOT_POSITIONS = [
  { left: "10%", top: "20%" },
  { left: "45%", top: "5%" },
  { left: "70%", top: "30%" },
  { left: "30%", top: "55%" },
  { left: "85%", top: "65%" },
  { left: "55%", top: "80%" },
  { left: "15%", top: "85%" },
];
function DotsGlyph() {
  return (
    <div className="relative h-full w-full opacity-60">
      {DOT_POSITIONS.map((p, i) => (
        <div key={i} className="absolute h-[10%] w-[10%] -translate-x-1/2 -translate-y-1/2" style={{ left: p.left, top: p.top, clipPath: "circle(50% at 50% 50%)", background: OCHRE }} />
      ))}
    </div>
  );
}
