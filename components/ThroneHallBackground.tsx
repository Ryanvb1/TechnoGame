import { ToadBoss } from "./ToadBoss";
import { ScaredSnail } from "./ScaredSnail";
import { ThoughtBubble } from "./ThoughtBubble";
import { PILLAR_CLIMB_MS } from "./pillarColors";

export type PillarStatus = "pending" | "targeted" | "saved" | "burned";
export type PillarFightState = { status: PillarStatus; climbing: boolean };

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

// Rounded to a short, fixed precision so the inline style strings this
// feeds are byte-identical between the server-rendered HTML and the
// client's hydration pass — raw Math.sin() floats have enough stray
// decimal places that the two can serialize slightly differently and
// trip a hydration mismatch once this background sits inside a client
// component (as it now does, inside ThroneRoomScene).
function round(n: number) {
  return Math.round(n * 10000) / 10000;
}

const PILLAR_ROWS = [
  { heightPct: 48, xPct: 27, width: 30, opacity: 0.85 },
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
    left: round(r1 * 100),
    top: round(r2 * 65),
    size: round(1 + r3 * 2),
    duration: round(2 + r1 * 3),
    delay: round(r2 * 4),
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

export function ThroneHallBackground({
  showToadBoss = false,
  toadFireBreathing = false,
  pillarColors,
  pillarStates,
  onPillarClick,
  snailHome = false,
  snailBubble = false,
}: {
  showToadBoss?: boolean;
  toadFireBreathing?: boolean;
  // Indexed 0-5: [row0-left, row0-right, row1-left, row1-right,
  // row2-left, row2-right]. Present once the knight's defeated.
  pillarColors?: string[];
  pillarStates?: PillarFightState[];
  onPillarClick?: (position: number) => void;
  // The ally snail's resting spot — visible whenever he isn't off
  // climbing a specific pillar (see PillarFightState.climbing), so he
  // never fully disappears during the encounter.
  snailHome?: boolean;
  snailBubble?: boolean;
}) {
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

      {/* the toad boss, rising at the horizon — rendered here so the floor
          and side walls (painted after it) occlude its lower body, as if
          it's arising from behind the whole platform rather than in front
          of it */}
      {showToadBoss && <ToadBoss fireBreathing={toadFireBreathing} />}

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
            <Pillar
              row={row}
              side="left"
              position={i * 2}
              color={pillarColors?.[i * 2]}
              fightState={pillarStates?.[i * 2]}
              onClick={onPillarClick}
            />
            <Pillar
              row={row}
              side="right"
              position={i * 2 + 1}
              color={pillarColors?.[i * 2 + 1]}
              fightState={pillarStates?.[i * 2 + 1]}
              onClick={onPillarClick}
            />
          </div>
        ))}
      </div>

      {/* the ally snail's home spot, off to the side of the floor —
          visible throughout the encounter except while he's off climbing
          a pillar (see the Pillar component's own climbing indicator) */}
      {snailHome && (
        <div className="absolute bottom-[4%] left-[10%]">
          {snailBubble && (
            <ThoughtBubble className="absolute bottom-full left-1/2 mb-2 w-36 -translate-x-1/2">
              <p className="font-bold">Let&apos;s get him.</p>
            </ThoughtBubble>
          )}
          <ScaredSnail fear={0} />
        </div>
      )}

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
  position,
  color,
  fightState,
  onClick,
}: {
  row: { heightPct: number; xPct: number; width: number; opacity: number };
  side: "left" | "right";
  position: number;
  color?: string;
  fightState?: PillarFightState;
  onClick?: (position: number) => void;
}) {
  const sideStyle = side === "left" ? { left: `${row.xPct}%` } : { right: `${row.xPct}%` };
  const status = fightState?.status ?? "pending";
  const burned = status === "burned";
  const saved = status === "saved";
  const targeted = status === "targeted";
  // Only the pillar currently under fire is actually interactive — pending
  // ones haven't been targeted yet, so clicking them ahead of order
  // shouldn't look like it does anything.
  const clickable = !!color && !!onClick && status === "targeted";

  return (
    <div
      className="absolute top-0"
      style={{
        height: `${row.heightPct}%`,
        width: row.width,
        opacity: burned ? row.opacity * 0.55 : row.opacity,
        ...sideStyle,
      }}
    >
      {/* capital, touching the top of the page/ceiling */}
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2 transition-[background] duration-500"
        style={{
          width: row.width * 1.35,
          height: row.width * 0.4,
          background: burned ? "#241a14" : "#c9a877",
        }}
      />
      {/* solid tan fluted shaft */}
      <div
        className="absolute inset-0 transition-[background] duration-500"
        style={{
          background: burned ? "#241a14" : "#c9a877",
          backgroundImage: burned
            ? "none"
            : "repeating-linear-gradient(90deg, rgba(255,255,255,0.16) 0 2px, rgba(0,0,0,0.08) 2px 4px, transparent 4px 11px)",
        }}
      />
      {/* base, meeting the floor at this row's depth */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 transition-[background] duration-500"
        style={{
          width: row.width * 1.4,
          height: row.width * 0.45,
          background: burned ? "#241a14" : "#c9a877",
        }}
      />

      {/* fire licking up the base — marks which pillar the toad is
          currently attacking */}
      {targeted && (
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ bottom: 0, width: row.width * 1.6, height: row.width * 1.1 }}
        >
          {[-0.3, 0, 0.3].map((offset, i) => (
            <div
              key={i}
              className="absolute bottom-0"
              style={{
                left: `${50 + offset * 50}%`,
                width: row.width * 0.5,
                height: row.width * (0.7 + Math.abs(offset)),
                transform: "translateX(-50%)",
                clipPath: "polygon(50% 0%, 90% 55%, 68% 55%, 100% 100%, 0% 100%, 32% 55%, 10% 55%)",
                background: "linear-gradient(to top, #ffe9a0 0%, #ff9a2e 45%, #d94a12 100%)",
                boxShadow: "0 0 12px rgba(255,140,20,0.85)",
                animationName: "fire-flicker",
                animationDuration: `${0.4 + i * 0.15}s`,
                animationTimingFunction: "ease-in-out",
                animationIterationCount: "infinite",
              }}
            />
          ))}
        </div>
      )}
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

      {/* the colored circle assigned once the knight's defeated — the
          fight's save-or-burn target */}
      {color && (
        <button
          onClick={clickable ? () => onClick!(position) : undefined}
          disabled={!clickable}
          aria-label="Climb this pillar"
          className={`absolute left-1/2 -translate-x-1/2 outline-none ${
            clickable ? "touch-manipulation cursor-pointer" : "pointer-events-none"
          }`}
          style={{ top: "13%", width: row.width * 0.55, height: row.width * 0.55 }}
        >
          <div
            className="absolute inset-0 transition-[background,box-shadow] duration-300"
            style={{
              clipPath: "circle(50% at 50% 50%)",
              background: burned ? "#241a14" : color,
              opacity: burned ? 0.6 : 1,
              boxShadow: targeted
                ? `0 0 10px ${color}, 0 0 22px #ff6a12`
                : burned
                  ? "none"
                  : `0 0 8px ${color}`,
              animation: targeted ? "pillar-fire-warn 0.7s ease-in-out infinite" : undefined,
            }}
          />
          {saved && (
            <div
              className="absolute"
              style={{
                inset: "24%",
                clipPath: "circle(50% at 50% 50%)",
                background: "#dff5c0",
                boxShadow: "0 0 6px #dff5c0",
              }}
            />
          )}
        </button>
      )}

      {/* the snail, climbing toward the circle */}
      {fightState?.climbing && (
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            width: row.width * 0.4,
            height: row.width * 0.4,
            animation: `pillar-climb ${PILLAR_CLIMB_MS}ms ease-out forwards`,
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              clipPath: "circle(50% at 50% 50%)",
              background: "linear-gradient(180deg, #cdeaa0 0%, #7aa84e 100%)",
              boxShadow: "0 0 6px rgba(180,230,120,0.7)",
            }}
          />
        </div>
      )}
    </div>
  );
}
