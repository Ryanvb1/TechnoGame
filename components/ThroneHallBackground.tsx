import type { Ref } from "react";
import { ToadBoss } from "./ToadBoss";
import { ScaredSnail } from "./ScaredSnail";
import { ThoughtBubble } from "./ThoughtBubble";
import { BEAM_TRAVEL_MS, PILLAR_COLORS, REFLECT_TRAVEL_MS } from "./pillarColors";

export type PillarStatus = "pending" | "targeted" | "burning" | "saved" | "burned";
export type PillarFightState = { status: PillarStatus };
export type BeamShot = { position: number; key: number };

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

// A plain 5-point star — used for the pillar's target marker instead of a
// circle, and for the smaller "saved" highlight nested inside it.
const STAR_CLIP_PATH =
  "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)";

// The toad's mouth, in the same top/left-percentage terms the pillars
// below use. Both the toad (rendered directly in this file's fixed
// inset-0 root) and the pillar row below (top:0/bottom:0, so also full
// height) span the exact same box vertically, so a percentage derived
// from ToadBoss's own bottom:24%/height:9% mouth (nested inside its
// bottom:70%/height:26vh wrapper — and 26vh === 26% of this same
// viewport-height box) converts directly with no separate coordinate
// space to reconcile: 70 + (24 + 9/2) * 0.26 ≈ 77.4% from the bottom.
const TOAD_MOUTH_X_PCT = 50;
const TOAD_MOUTH_Y_PCT = 100 - 77.4;

// The snail's resting spot when he isn't off tending a pillar — dead
// center of the open floor, in the same top/left-percentage terms as
// pillarBaseXY below (see pillarBaseXY for why that frame is safe to
// share with the pillar container despite the two elements having
// different parents).
const SNAIL_HOME = { x: 50, y: 96 };

// Where a given pillar's base sits, in percentages relative to the pillar
// row container (top:0/bottom:0, width: HALL_WIDTH, centered — see the
// TOAD_MOUTH comment above for why top/bottom % is shared with the outer
// root, and note x% here is relative to HALL_WIDTH specifically, which is
// fine as long as everything reading it — the beams, the snail — is
// rendered inside that same pillar container rather than the wider root).
function pillarBaseXY(position: number): { x: number; y: number } {
  const row = PILLAR_ROWS[Math.floor(position / 2)];
  const side = position % 2 === 0 ? "left" : "right";
  return { x: side === "left" ? row.xPct : 100 - row.xPct, y: row.heightPct };
}

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

// One planet per pillar color, left to right in the exact order the toad
// attacks them (PILLAR_COLORS) — a subtle environmental hint at the burn
// order, instead of spelling it out in a text guide. Each entry's mid
// gradient stop is the real pillar color itself so it reads as a genuine
// match, not just a similar hue. Positions are picked to fall between the
// pillar columns (measured, not guessed) so none of the six get eclipsed
// by one; the two middle ones (yellow, green) additionally sit right
// where the toad's head rises to once he appears, so they're pulled up
// close to the ceiling to stay clear of his face rather than behind it.
const PLANETS = [
  {
    left: "4%",
    top: "18%",
    size: 36,
    background: `radial-gradient(circle at 35% 30%, #f28ca0 0%, ${PILLAR_COLORS[0]} 55%, #7a1128 100%)`,
    glow: "rgba(224,48,79,0.35)",
  },
  {
    left: "17%",
    top: "8%",
    size: 26,
    background: `radial-gradient(circle at 35% 30%, #f5b878 0%, ${PILLAR_COLORS[1]} 55%, #7a3a08 100%)`,
    glow: "rgba(232,121,31,0.35)",
  },
  {
    left: "40%",
    top: "2%",
    size: 20,
    background: `radial-gradient(circle at 35% 30%, #fce9a8 0%, ${PILLAR_COLORS[2]} 55%, #8a6a12 100%)`,
    glow: "rgba(246,201,76,0.35)",
  },
  {
    left: "60%",
    top: "3%",
    size: 24,
    background: `radial-gradient(circle at 35% 30%, #8fd89a 0%, ${PILLAR_COLORS[3]} 55%, #1a5620 100%)`,
    glow: "rgba(63,174,74,0.35)",
  },
  {
    left: "74%",
    top: "10%",
    size: 44,
    background: `radial-gradient(circle at 35% 30%, #8fb8ec 0%, ${PILLAR_COLORS[4]} 55%, #16346b 100%)`,
    glow: "rgba(47,111,209,0.35)",
  },
  {
    left: "83%",
    top: "16%",
    size: 28,
    background: `radial-gradient(circle at 35% 30%, #c299f0 0%, ${PILLAR_COLORS[5]} 55%, #45186b 100%)`,
    glow: "rgba(138,63,224,0.35)",
  },
];

export function ThroneHallBackground({
  showToadBoss = false,
  toadHit = false,
  toadDead = false,
  toadMouthRef,
  pillarColors,
  pillarColorsChanged = false,
  pillarStates,
  slimeActive,
  onPillarClick,
  snailRevealed = false,
  snailBubble = false,
  snailPos = null,
  snailRef,
  snailTravelMs,
  beamShot,
  reflectShot,
}: {
  showToadBoss?: boolean;
  // Briefly true right as a reflected shot lands back on the toad, so he
  // can flash/react to it.
  toadHit?: boolean;
  // True once he's been defeated — see ToadBoss's own "dead" prop.
  toadDead?: boolean;
  // Forwarded to the toad's mouth so its real screen position can be
  // measured (used to aim the thrown molotov).
  toadMouthRef?: Ref<HTMLDivElement>;
  // Indexed 0-5: [row0-left, row0-right, row1-left, row1-right,
  // row2-left, row2-right]. Present once the knight's defeated.
  pillarColors?: string[];
  // Briefly true right after pillarColors has been reshuffled (a retreat
  // or a burned pillar both advance the rotation) — tells every star to
  // pop at once so the player notices their colors moved, rather than
  // silently walking back into a fight expecting the old layout.
  pillarColorsChanged?: boolean;
  pillarStates?: PillarFightState[];
  // Whether each pillar currently has an active slime puddle at its base
  // (same indexing as pillarStates).
  slimeActive?: boolean[];
  // Passes along the clicked pillar's real on-screen base position (its
  // own container's getBoundingClientRect, bottom-center) so the caller
  // can measure how far the snail actually has to crawl.
  onPillarClick?: (position: number, basePoint: { x: number; y: number }) => void;
  // The ally snail's entrance — once true he's a permanent fixture of the
  // scene (never vanishes), just relocated by snailPos.
  snailRevealed?: boolean;
  snailBubble?: boolean;
  // Which pillar the snail is currently at/heading to; null means home,
  // dead-center of the floor.
  snailPos?: number | null;
  // Exposes the snail's real DOM position so ThroneRoomScene can measure
  // the distance to a clicked pillar (see onPillarClick above).
  snailRef?: Ref<HTMLDivElement>;
  // How long the current crawl should take — measured by ThroneRoomScene
  // from real on-screen distance, so this drives both the CSS transition
  // here and the timer that decides when he's "arrived" there.
  snailTravelMs?: number;
  // A one-shot burst of fire from the toad's mouth to a pillar's base —
  // present only for the brief window it takes to travel there.
  beamShot?: BeamShot | null;
  // The mirror image: a one-shot burst of reflected fire from a slimed
  // pillar's base back to the toad's mouth.
  reflectShot?: BeamShot | null;
}) {
  return (
    // No z-index here (deliberately not -z-10): a negative z-index paints
    // this whole layer behind *any* plain in-flow box, including <main>'s
    // own (invisible, but still hit-testable) content box — which then
    // wins every click before it can ever reach the pillar buttons inside
    // here, no matter what pointer-events says on the button itself.
    // Leaving z-index at its default (auto) still keeps this behind its
    // one JSX sibling (the Throne/Molotov wrapper below), since that's
    // later in DOM order — it just stops sinking behind <main> too.
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
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
      {showToadBoss && <ToadBoss hit={toadHit} dead={toadDead} mouthRef={toadMouthRef} />}

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
              colorsChanged={pillarColorsChanged}
              fightState={pillarStates?.[i * 2]}
              slimed={!!slimeActive?.[i * 2]}
              onClick={onPillarClick}
            />
            <Pillar
              row={row}
              side="right"
              position={i * 2 + 1}
              color={pillarColors?.[i * 2 + 1]}
              colorsChanged={pillarColorsChanged}
              fightState={pillarStates?.[i * 2 + 1]}
              slimed={!!slimeActive?.[i * 2 + 1]}
              onClick={onPillarClick}
            />
          </div>
        ))}

        {/* the snail — lives here (rather than at the fixed root) so his
            home spot and pillar destinations share one coordinate frame */}
        {snailRevealed && (
          <SnailAgent pos={snailPos} bubble={snailBubble} snailRef={snailRef} travelMs={snailTravelMs} />
        )}

        {/* the toad's fire, shooting from his mouth to whichever pillar
            he's currently torching — a brief one-shot burst, not a
            continuous stream, so it reads as a single strike */}
        <ToadFireBeam shot={beamShot ?? null} />
        {/* and its mirror: reflected fire bouncing off a slimed pillar
            back at him */}
        <ToadReflectBeam shot={reflectShot ?? null} />
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
  position,
  color,
  colorsChanged,
  fightState,
  slimed,
  onClick,
}: {
  row: { heightPct: number; xPct: number; width: number; opacity: number };
  side: "left" | "right";
  position: number;
  color?: string;
  colorsChanged?: boolean;
  fightState?: PillarFightState;
  slimed?: boolean;
  onClick?: (position: number, basePoint: { x: number; y: number }) => void;
}) {
  const sideStyle = side === "left" ? { left: `${row.xPct}%` } : { right: `${row.xPct}%` };
  const status = fightState?.status ?? "pending";
  const burned = status === "burned";
  const saved = status === "saved";
  // Still under threat (aimed at, or already alight) — the circle keeps
  // pulsing through both phases; only "burning" gets the actual flame
  // graphic at the base.
  const inDanger = status === "targeted" || status === "burning";
  const onFire = status === "burning";
  // Any pillar that hasn't already resolved can be sent the snail —
  // including ones the toad hasn't targeted yet, so a pillar can be
  // pre-slimed in anticipation.
  const clickable = !!color && !!onClick && !burned && !saved;

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

      {/* slime puddle, laid by the snail — sits under/behind the flame so
          an already-burning base that gets slimed reactively still shows
          both until the next check resolves it */}
      {slimed && (
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 animate-[slime-pulse_1.4s_ease-in-out_infinite]"
          style={{
            width: row.width * 1.7,
            height: row.width * 0.5,
            clipPath: "ellipse(50% 50% at 50% 100%)",
            background: "radial-gradient(ellipse at 50% 30%, #baf27a 0%, #6fae3a 55%, #3c6b1e 100%)",
            boxShadow: "0 0 10px rgba(140,230,80,0.7)",
          }}
        />
      )}

      {/* fire licking up the base — only once the toad's beam has actually
          landed with nothing there to stop it */}
      {onFire && (
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

      {/* the colored circle assigned once the knight's defeated — click
          it to send the snail over to slime this pillar's base */}
      {color && (
        <button
          onClick={
            clickable
              ? (e) => {
                  // The button's own parent is this pillar's root box,
                  // spanning ceiling to floor at this row's depth — its
                  // bottom-center is exactly where the snail actually
                  // needs to crawl to, not the (much higher) circle being
                  // clicked here.
                  const pillarBox = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
                  onClick!(position, { x: pillarBox.left + pillarBox.width / 2, y: pillarBox.bottom });
                }
              : undefined
          }
          disabled={!clickable}
          aria-label="Send the snail to slime this pillar"
          className={`absolute left-1/2 -translate-x-1/2 outline-none ${
            // The root background layer this button lives inside is
            // pointer-events-none (so it never blocks clicks on foreground
            // UI elsewhere on the page) — has to be explicitly opted back
            // in here, or a real pointer click can never reach the button
            // at all, only find nothing underneath it.
            clickable ? "pointer-events-auto touch-manipulation cursor-pointer" : "pointer-events-none"
          }`}
          style={{ top: "13%", width: row.width * 0.55, height: row.width * 0.55 }}
        >
          {/* a plain (non-clip-path'd) wrapper carrying the white outline
              and the reshuffle pop — clip-path on the star div below would
              otherwise clip off any filter (drop-shadow) applied on that
              same element, silently hiding it, which is why this lives one
              level up instead */}
          <div
            className="absolute inset-0"
            style={{
              // Same white outline Molotov uses to flag itself as "the
              // thing to click" — on for as long as this star can actually
              // be clicked, on top of (not instead of) its own color glow
              // below.
              filter: clickable
                ? "drop-shadow(0 0 1.5px #fff) drop-shadow(0 0 1.5px #fff) drop-shadow(0 0 4px rgba(255,255,255,0.85))"
                : "none",
              animation: colorsChanged ? "pillar-color-pop 900ms ease-out" : undefined,
            }}
          >
            <div
              className="absolute inset-0 transition-[background,box-shadow] duration-300"
              style={{
                clipPath: STAR_CLIP_PATH,
                background: burned ? "#241a14" : color,
                opacity: burned ? 0.6 : 1,
                boxShadow: inDanger
                  ? `0 0 10px ${color}, 0 0 22px #ff6a12`
                  : burned
                    ? "none"
                    : `0 0 8px ${color}`,
                animation: inDanger ? "pillar-fire-warn 0.7s ease-in-out infinite" : undefined,
              }}
            />
            {saved && (
              <div
                className="absolute"
                style={{
                  inset: "24%",
                  clipPath: STAR_CLIP_PATH,
                  background: "#dff5c0",
                  boxShadow: "0 0 6px #dff5c0",
                }}
              />
            )}
          </div>
        </button>
      )}
    </div>
  );
}

// The ally snail — a single roaming agent rather than a per-pillar sprite,
// since he can only be in one place at a time. Positioned in the same
// top/left-percentage frame pillarBaseXY uses (see its comment), with a
// plain CSS transition standing in for the crawl — its duration is
// whatever ThroneRoomScene measured the real distance to be (travelMs),
// so the visual motion always matches the timer deciding when he's
// "arrived" and the slime actually gets laid.
function SnailAgent({
  pos,
  bubble,
  snailRef,
  travelMs,
}: {
  pos: number | null;
  bubble: boolean;
  snailRef?: Ref<HTMLDivElement>;
  travelMs?: number;
}) {
  const { x, y } = pos === null ? SNAIL_HOME : pillarBaseXY(pos);
  // Nudged a little off-center from the pillar's base so he sits beside
  // the slime puddle/flame rather than directly under them.
  const nudge = pos === null ? 0 : x < 50 ? -4 : 4;
  const facingLeft = x + nudge < 50;

  return (
    <div
      ref={snailRef}
      className="absolute -translate-x-1/2 -translate-y-full transition-[left,top] ease-in-out"
      style={{ left: `${x + nudge}%`, top: `${y}%`, transitionDuration: `${travelMs ?? 900}ms` }}
    >
      {/* the bubble stays upright regardless of which way he's facing —
          only the snail sprite itself mirrors, so the text never reads
          backwards */}
      {bubble && (
        <ThoughtBubble className="absolute bottom-full left-1/2 mb-2 w-36 -translate-x-1/2">
          <p className="font-bold">Let&apos;s get him.</p>
        </ThoughtBubble>
      )}
      <div style={{ transform: `scaleX(${facingLeft ? -1 : 1})` }}>
        <ScaredSnail fear={0} />
      </div>
    </div>
  );
}

// The toad's fire, drawn as an SVG line rather than a rotated div: the
// mouth sits dead-center (x: 50%) while the pillar doesn't, and this
// container's width/height scale differently (a narrow capped-width hall
// vs. the full viewport height), so a single rotate() transform would come
// out at the wrong angle. preserveAspectRatio="none" lets the browser
// stretch the line to the correct angle for us, and
// vector-effect="non-scaling-stroke" keeps its thickness from being
// distorted by that same non-uniform stretch. Three stacked strokes (soft
// glow / body / bright core) read as a single detailed beam; pathLength +
// stroke-dashoffset draws it traveling from mouth to target over
// BEAM_TRAVEL_MS instead of just appearing, and it's gone again shortly
// after — a strike, not a stream.
function ToadFireBeam({ shot }: { shot: BeamShot | null }) {
  if (!shot) return null;
  const { x, y } = pillarBaseXY(shot.position);
  const holdMs = 160;
  const fadeMs = 260;
  const anim = `beam-grow ${BEAM_TRAVEL_MS}ms ease-out forwards, beam-fade-out ${fadeMs}ms ease-in ${BEAM_TRAVEL_MS + holdMs}ms forwards`;

  return (
    <svg
      key={shot.key}
      className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      <line
        x1={TOAD_MOUTH_X_PCT}
        y1={TOAD_MOUTH_Y_PCT}
        x2={x}
        y2={y}
        pathLength={100}
        strokeDasharray={100}
        stroke="rgba(255,120,20,0.5)"
        strokeWidth={16}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        style={{ animation: anim, filter: "blur(2.5px)" }}
      />
      <line
        x1={TOAD_MOUTH_X_PCT}
        y1={TOAD_MOUTH_Y_PCT}
        x2={x}
        y2={y}
        pathLength={100}
        strokeDasharray={100}
        stroke="#ff9a2e"
        strokeWidth={7}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        style={{ animation: anim }}
      />
      <line
        x1={TOAD_MOUTH_X_PCT}
        y1={TOAD_MOUTH_Y_PCT}
        x2={x}
        y2={y}
        pathLength={100}
        strokeDasharray={100}
        stroke="#fff3c4"
        strokeWidth={3}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        style={{ animation: anim }}
      />
      {/* impact flash, timed to pop right as the beam's leading edge
          arrives */}
      <foreignObject x={x - 4} y={y - 4} width={8} height={8} style={{ overflow: "visible" }}>
        <div
          style={{
            width: "100%",
            height: "100%",
            clipPath: "circle(50% at 50% 50%)",
            background:
              "radial-gradient(circle, rgba(255,230,160,0.95) 0%, rgba(255,120,20,0.65) 45%, transparent 75%)",
            animation: `beam-impact-flash 380ms ease-out ${BEAM_TRAVEL_MS}ms both`,
          }}
        />
      </foreignObject>
    </svg>
  );
}

// The mirror image of ToadFireBeam: fire bouncing off a slimed base back
// at the toad, on a shorter/snappier trip since it's already lit rather
// than starting cold. Tinted green at the edges to read as "reflected off
// the slime" rather than a second identical attack.
function ToadReflectBeam({ shot }: { shot: BeamShot | null }) {
  if (!shot) return null;
  const { x, y } = pillarBaseXY(shot.position);
  const fadeMs = 220;
  const anim = `beam-grow ${REFLECT_TRAVEL_MS}ms ease-in forwards, beam-fade-out ${fadeMs}ms ease-in ${REFLECT_TRAVEL_MS + 100}ms forwards`;

  return (
    <svg
      key={shot.key}
      className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      <line
        x1={x}
        y1={y}
        x2={TOAD_MOUTH_X_PCT}
        y2={TOAD_MOUTH_Y_PCT}
        pathLength={100}
        strokeDasharray={100}
        stroke="rgba(150,255,120,0.55)"
        strokeWidth={14}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        style={{ animation: anim, filter: "blur(2px)" }}
      />
      <line
        x1={x}
        y1={y}
        x2={TOAD_MOUTH_X_PCT}
        y2={TOAD_MOUTH_Y_PCT}
        pathLength={100}
        strokeDasharray={100}
        stroke="#eafccb"
        strokeWidth={5}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        style={{ animation: anim }}
      />
    </svg>
  );
}
