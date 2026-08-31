import type { CSSProperties } from "react";
import { ROAR_TELEGRAPH_MS, SCRATCH_RESOLVE_FLASH_MS } from "./caveBearFightConfig";

// The cave's boss, split out from CaveScene the same way KnightFigure is
// split from Knight — this is pure art keyed off a phase (and, once the
// fight itself is running, an action), with no click handling of its own;
// CaveScene wraps it in the actual button, same as Knight.tsx wraps
// KnightFigure.
export type CaveBearPhase = "sleeping" | "awake" | "enraged";

// Drives the bear's actual attack poses during the fight — CaveBearFight
// derives this straight from useCaveBearSurvivalPhase's activeAttack (kind
// + stage) and its own "damage" stage. Left undefined/"idle" for every
// pre-fight use (CaveScene's wake/briefing/won states), so those keep
// exactly their old look.
export type CaveBearAction = "idle" | "scratch" | "roar-telegraph" | "roar-resolve" | "damage-idle";

// Full desktop scale; --bscale (set responsively by the caller, same
// pattern as FightScene's --kscale / Throne's --tscale) scales everything
// down together for mobile.
function b(px: number) {
  return `calc(${px}px * var(--bscale))`;
}

const FUR = "linear-gradient(160deg, #6b5238 0%, #4a3a26 45%, #2a1f14 100%)";
const FUR_DARK = "linear-gradient(160deg, #4a3a26 0%, #2a1f14 60%, #180f09 100%)";
const BELLY = "#8a6f52";

// Small darker blobs scattered across a fur mass for texture — same trick
// as ToadBoss's WART_SPOTS, just fewer/larger since fur reads coarser than
// warts.
const FUR_TUFTS = [
  { left: "22%", top: "30%", size: 20 },
  { left: "58%", top: "16%", size: 16 },
  { left: "70%", top: "48%", size: 22 },
  { left: "38%", top: "62%", size: 14 },
];

export type ScratchLean = "left" | "right" | "center";

export function CaveBear({
  phase,
  action = "idle",
  scale,
  scratchLean = "center",
  scratchStrike = 0,
}: {
  phase: CaveBearPhase;
  action?: CaveBearAction;
  // Overrides the responsive --bscale default with a flat value — the
  // fight itself renders him at 1 (100%) so the roar's mouth and the
  // scratch's arm-reach actually have room to read; the pre-fight
  // sleeping/waking/briefing bear (CaveScene) leaves this unset and keeps
  // the original responsive scale.
  scale?: number;
  // Which side of the floor a Scratch is actually raking — CaveBearFight
  // derives this from the safe cube's column (leaning/reaching away from
  // it), so the whole-body lean points toward the cubes actually getting
  // clawed rather than a fixed generic lean.
  scratchLean?: ScratchLean;
  // Which of the 3 rapid strikes in one Scratch instance this is — folded
  // into the torso's own key below so each strike remounts it and replays
  // the arm swipe, instead of the animation staying stuck on strike 0
  // (action itself doesn't change strike to strike, so it can't drive the
  // remount on its own).
  scratchStrike?: number;
}) {
  const sleeping = phase === "sleeping";
  return (
    <div
      className={scale == null ? "relative [--bscale:0.5] sm:[--bscale:0.85]" : "relative"}
      style={{ width: b(280), height: b(240), ...(scale != null ? ({ "--bscale": scale } as CSSProperties) : {}) }}
    >
      {/* contact shadow, widening once he rises onto his hind legs */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 transition-[width] duration-700 ease-in-out"
        style={{
          height: b(16),
          width: sleeping ? b(210) : b(150),
          clipPath: "ellipse(50% 50% at 50% 50%)",
          background: "radial-gradient(closest-side, rgba(0,0,0,0.55), transparent 75%)",
        }}
      />

      {/* two stacked poses, cross-fading — sleeping shrinks/settles away
          while the standing pose grows up out of it, rather than either
          one just popping */}
      <div
        className="absolute inset-0 transition-[opacity,transform] duration-700 ease-in-out"
        style={{ opacity: sleeping ? 1 : 0, transform: sleeping ? "scale(1)" : "scale(0.85) translateY(10px)" }}
      >
        <SleepingPose />
      </div>
      <div
        className="absolute inset-0 transition-[opacity,transform] duration-700 ease-in-out"
        style={{ opacity: sleeping ? 0 : 1, transform: sleeping ? "scale(0.88) translateY(14px)" : "scale(1) translateY(0)" }}
      >
        <StandingPose enraged={phase === "enraged"} action={action} scratchLean={scratchLean} scratchStrike={scratchStrike} />
      </div>

      {/* the wake-up roar beat — only for the pre-fight phase transitions
          (sleeping -> awake -> enraged), unrelated to in-combat Roar
          attacks below; remounts (replaying its one-shot animation) every
          time `phase` changes so waking and later the briefing's "enraged"
          flip both get their own flash. */}
      {!sleeping && action === "idle" && (
        <div key={phase} className="pointer-events-none absolute left-[38%] top-[30%] h-16 w-16 -translate-x-1/2 -translate-y-1/2" style={ROAR_FLASH_STYLE} />
      )}

      {/* the in-combat Roar's own flash — mounts fresh every time a Roar
          attack actually resolves (action cycles back through "idle"
          between attacks, so this naturally remounts and replays each
          time rather than only once). */}
      {action === "roar-resolve" && (
        <>
          <div className="pointer-events-none absolute left-[38%] top-[24%] h-20 w-20 -translate-x-1/2 -translate-y-1/2" style={ROAR_FLASH_STYLE} />
          {/* the roar actually projecting across the room — a much
              bigger ring than the mouth-level flash above, ballooning
              far past the bear's own box (nothing here clips it) so it
              visibly crosses the whole scene rather than staying a
              small flash at his head. */}
          <div
            className="pointer-events-none absolute left-[38%] top-[24%] h-20 w-20 -translate-x-1/2 -translate-y-1/2"
            style={{
              clipPath: "circle(50% at 50% 50%)",
              background: "radial-gradient(circle, rgba(255,200,140,0.5) 0%, rgba(255,120,40,0.28) 40%, transparent 72%)",
              animation: "roar-wave 550ms ease-out both",
            }}
          />
        </>
      )}
    </div>
  );
}

const ROAR_FLASH_STYLE: CSSProperties = {
  clipPath: "circle(50% at 50% 50%)",
  background: "radial-gradient(circle, rgba(255,235,200,0.95) 0%, rgba(255,120,40,0.5) 45%, transparent 75%)",
  animation: "bear-roar-flash 700ms ease-out both",
};

function SleepingPose() {
  return (
    <div className="relative h-full w-full">
      {/* Zzz — classic drifting/pulsing sleep marker, deliberately not the
          site's speech ThoughtBubble (that reads as "about to talk"); this
          is just an idle tell, no dialogue implied. */}
      <div className="absolute left-[46%] top-[2%] text-foreground/70">
        <span className="absolute animate-[fire-glow-pulse_2.6s_ease-in-out_infinite] text-[0.6rem]" style={{ left: 0, top: 14 }}>
          z
        </span>
        <span
          className="absolute animate-[fire-glow-pulse_2.6s_ease-in-out_infinite] text-[0.8rem]"
          style={{ left: 8, top: 4, animationDelay: "0.4s" }}
        >
          Z
        </span>
        <span
          className="absolute animate-[fire-glow-pulse_2.6s_ease-in-out_infinite] text-[1rem]"
          style={{ left: 18, top: -8, animationDelay: "0.8s" }}
        >
          Z
        </span>
      </div>

      {/* main curled body mass — breathing is applied here, anchored to
          the bottom so the rise reads as a chest lifting, not the whole
          shape floating */}
      <div
        className="absolute bottom-0 left-[14%] h-[62%] w-[78%] origin-bottom animate-[bear-breathe_3.4s_ease-in-out_infinite]"
        style={{
          clipPath: "polygon(4% 100%, 0% 70%, 6% 42%, 22% 18%, 48% 4%, 74% 2%, 92% 18%, 100% 46%, 96% 78%, 88% 100%)",
          background: FUR,
        }}
      >
        {/* lighter flank patch */}
        <div
          className="absolute bottom-[10%] right-[14%] h-[46%] w-[38%] opacity-50"
          style={{ clipPath: "ellipse(50% 50% at 50% 50%)", background: BELLY }}
        />
        {FUR_TUFTS.map((t, i) => (
          <div
            key={i}
            className="absolute"
            style={{ left: t.left, top: t.top, width: t.size, height: t.size, clipPath: "circle(50% at 50% 50%)", background: FUR_DARK, opacity: 0.7 }}
          />
        ))}
        {/* a hind paw peeking out from under the curl */}
        <div className="absolute -right-[4%] bottom-0 h-[22%] w-[20%]" style={{ clipPath: "ellipse(50% 50% at 50% 60%)", background: FUR_DARK }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="absolute bottom-[80%] h-[7px] w-[3px] bg-[#1c130c]" style={{ left: `${20 + i * 26}%` }} />
          ))}
        </div>
      </div>

      {/* head, resting low at the left end on crossed forepaws */}
      <div className="absolute bottom-[2%] left-0 h-[46%] w-[42%]" style={{ clipPath: "circle(50% at 50% 55%)", background: FUR }}>
        {/* snout */}
        <div className="absolute bottom-[6%] left-[-14%] h-[38%] w-[46%]" style={{ clipPath: "ellipse(50% 50% at 50% 50%)", background: FUR }}>
          <div className="absolute left-[10%] top-[30%] h-[26%] w-[30%]" style={{ clipPath: "circle(50% at 50% 50%)", background: "#1c130c" }} />
        </div>
        {/* small round ear */}
        <div className="absolute -top-[6%] right-[16%] h-[24%] w-[24%]" style={{ clipPath: "circle(50% at 50% 50%)", background: FUR_DARK }} />
        {/* closed eye — a short downward curve */}
        <div className="absolute left-[30%] top-[38%] h-[6%] w-[28%] rotate-[8deg] rounded-none border-b-2 border-[#1c130c]" />
      </div>
    </div>
  );
}

// One-shot pose transforms applied to the whole torso+arms+head wrapper —
// keyed by `action` in StandingPose so each fresh attack instance replays
// its animation from the start rather than only the first ever playing.
const BODY_POSE_ANIMATION: Partial<Record<CaveBearAction, string>> = {
  "damage-idle": "bear-idle-sway 2.4s ease-in-out infinite",
};

// Static (transition-driven rather than keyframed) held poses — roar's
// telegraph rears the whole chest up and back (a real intake-of-breath
// wind-up, arms already thrown overhead per the `roaring` Arm pose above),
// then resolve slams forward into the actual roar. Scratch isn't listed
// here — its lean depends on scratchLean, computed alongside it below.
const BODY_POSE_TRANSFORM: Partial<Record<CaveBearAction, string>> = {
  "roar-telegraph": "rotate(-11deg) translateY(-16px) scale(1.06)",
  "roar-resolve": "rotate(9deg) translateY(8px) scale(1.1)",
};

// Leans/reaches the whole body toward whichever side is actually getting
// clawed (away from the one safe cube) — "center" keeps the old neutral
// lean for when the safe cube sits in the middle column.
const SCRATCH_LEAN_TRANSFORM: Record<ScratchLean, string> = {
  left: "rotate(-12deg) translateX(-8px)",
  right: "rotate(12deg) translateX(8px)",
  center: "rotate(-3deg)",
};

function StandingPose({
  enraged,
  action,
  scratchLean,
  scratchStrike,
}: {
  enraged: boolean;
  action: CaveBearAction;
  scratchLean: ScratchLean;
  scratchStrike: number;
}) {
  const eyeColor = enraged ? "#ff3b3b" : "#ffcf6b";
  const mouthScale = action === "roar-telegraph" ? 1.3 : action === "roar-resolve" ? 1.85 : 1;
  // He takes a real moment to open his mouth — the telegraph widens it
  // gradually across almost the whole telegraph window (a deliberate,
  // visible wind-up) rather than snapping open, then the resolve is a
  // fast final snap into the actual roar.
  const mouthTransitionMs = action === "roar-telegraph" ? ROAR_TELEGRAPH_MS * 0.85 : 150;

  return (
    <div className="relative h-full w-full">
      {/* ambient presence glow, warm normally, bleeding redder once enraged */}
      <div
        className="absolute left-1/2 top-[30%] h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 animate-[fire-glow-pulse_2.4s_ease-in-out_infinite]"
        style={{
          background: enraged
            ? "radial-gradient(closest-side, rgba(220,40,20,0.45), transparent 70%)"
            : "radial-gradient(closest-side, rgba(230,150,60,0.32), transparent 70%)",
        }}
      />

      {/* hind legs, planted — stay put regardless of the body-wide pose
          animation above them, so a slam reads as the torso/arms lunging
          off a fixed base rather than the whole bear floating */}
      <div className="absolute bottom-0 left-[24%] h-[30%] w-[18%]" style={{ clipPath: "polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)", background: FUR_DARK }} />
      <div className="absolute bottom-0 right-[24%] h-[30%] w-[18%]" style={{ clipPath: "polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)", background: FUR_DARK }} />

      {/* torso, leaning slightly forward — the pose wrapper carries the
          windup/slam/roar/idle-sway animations; the torso itself keeps its
          own static lean + fur texture untouched by whichever of those is
          active */}
      <div
        className="absolute bottom-[24%] left-1/2 h-[62%] w-[62%] -translate-x-1/2"
        style={{
          animation: BODY_POSE_ANIMATION[action],
          transform: action === "scratch" ? SCRATCH_LEAN_TRANSFORM[scratchLean] : BODY_POSE_TRANSFORM[action],
          transition: action === "scratch" || BODY_POSE_TRANSFORM[action] ? "transform 200ms ease-out" : undefined,
        }}
      >
        <div
          className="absolute inset-0 rotate-[-4deg]"
          style={{
            clipPath: "polygon(20% 100%, 8% 70%, 4% 40%, 16% 14%, 40% 0%, 66% 0%, 88% 12%, 98% 38%, 94% 68%, 84% 100%)",
            background: FUR,
          }}
        >
          <div className="absolute bottom-[8%] left-1/2 h-[42%] w-[44%] -translate-x-1/2 opacity-45" style={{ clipPath: "ellipse(50% 50% at 50% 50%)", background: BELLY }} />
          {FUR_TUFTS.map((t, i) => (
            <div key={i} className="absolute" style={{ left: t.left, top: t.top, width: t.size * 0.8, height: t.size * 0.8, clipPath: "circle(50% at 50% 50%)", background: FUR_DARK, opacity: 0.65 }} />
          ))}
        </div>

        <BearArms
          scratching={action === "scratch"}
          direction={scratchLean}
          scratchStrike={scratchStrike}
        />

        {/* head atop the torso */}
        <div className="absolute left-1/2 top-0 z-30 h-[38%] w-[42%] -translate-x-1/2" style={{ clipPath: "circle(50% at 50% 45%)", background: FUR }}>
          {/* ears */}
          <div className="absolute -top-[8%] left-[6%] h-[26%] w-[26%]" style={{ clipPath: "circle(50% at 50% 50%)", background: FUR_DARK }} />
          <div className="absolute -top-[8%] right-[6%] h-[26%] w-[26%]" style={{ clipPath: "circle(50% at 50% 50%)", background: FUR_DARK }} />
          {/* eyes */}
          <div className="absolute left-[20%] top-[36%] h-[14%] w-[16%]" style={{ clipPath: "ellipse(50% 50% at 50% 50%)", background: eyeColor, boxShadow: `0 0 8px ${eyeColor}` }} />
          <div className="absolute right-[20%] top-[36%] h-[14%] w-[16%]" style={{ clipPath: "ellipse(50% 50% at 50% 50%)", background: eyeColor, boxShadow: `0 0 8px ${eyeColor}` }} />
          {/* open, roaring mouth — a slow deliberate widen through the
              telegraph, then a fast snap into the actual roar */}
          <div
            className="absolute bottom-[2%] left-1/2 h-[34%] w-[46%] origin-bottom -translate-x-1/2"
            style={{
              clipPath: "ellipse(50% 50% at 50% 20%)",
              background: "#2a0e08",
              transform: `scale(${mouthScale})`,
              transition: `transform ${mouthTransitionMs}ms ease-in`,
            }}
          >
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="absolute top-0 h-[9px] w-[7px]"
                style={{ left: `${12 + i * 24}%`, clipPath: "polygon(0% 0%, 100% 0%, 50% 100%)", background: "#f2ece0" }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// The scratch's articulated arms remain mounted in every pose. Outside the
// attack they settle lower and smaller, then their outer wrapper eases to
// full size while the unchanged scratch keyframes animate the joints.
function BearArms({
  scratching,
  direction,
  scratchStrike,
}: {
  scratching: boolean;
  direction: ScratchLean;
  scratchStrike: number;
}) {
  return (
    <div className="pointer-events-none absolute -inset-x-[70%] -bottom-[125%] top-[4%] z-20">
      {(["left", "right"] as const).map((side) => {
        const active = scratching && (direction === "center" || direction === side);
        return (
          <ArticulatedClawArm
            key={active && scratchStrike > 0 ? `${side}-${scratchStrike}` : side}
            side={side}
            active={active}
          />
        );
      })}
    </div>
  );
}

function ArticulatedClawArm({ side, active }: { side: "left" | "right"; active: boolean }) {
  const mirror = side === "left";
  const suffix = side;
  const socketOffsetX = side === "left" ? -88 : 88;
  return (
    <div
      className="absolute inset-0"
      style={{
        transform: active
          ? `translate(${socketOffsetX}px, 0) scale(1)`
          : `translate(${socketOffsetX}px, 34px) scale(0.68)`,
        transformOrigin: "50% 20%",
        transition: "transform 240ms cubic-bezier(0.2, 0.8, 0.25, 1)",
      }}
    >
      <svg
        className="absolute inset-0 h-full w-full overflow-visible"
        viewBox="0 0 600 390"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ transform: mirror ? "scaleX(-1)" : undefined }}
      >
      <defs>
        <linearGradient id={`claw-fur-${suffix}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8b704e" />
          <stop offset="34%" stopColor="#634a31" />
          <stop offset="72%" stopColor="#3a291b" />
          <stop offset="100%" stopColor="#21150d" />
        </linearGradient>
        <radialGradient id={`claw-paw-${suffix}`} cx="38%" cy="28%" r="75%">
          <stop offset="0%" stopColor="#947759" />
          <stop offset="55%" stopColor="#5a422d" />
          <stop offset="100%" stopColor="#24170f" />
        </radialGradient>
        <linearGradient id={`claw-nail-${suffix}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8e7b67" />
          <stop offset="45%" stopColor="#eee7d9" />
          <stop offset="100%" stopColor="#fffdf4" />
        </linearGradient>
        <filter id={`claw-shadow-${suffix}`} x="-30%" y="-30%" width="180%" height="180%">
          <feDropShadow dx="5" dy="8" stdDeviation="7" floodColor="#090503" floodOpacity="0.72" />
        </filter>
      </defs>

      <g
        style={{
          transformBox: "view-box",
          transformOrigin: "50.3% 20%",
          transform: "translate(-22px, -34px) rotate(-28deg)",
          transition: `transform ${Math.round(SCRATCH_RESOLVE_FLASH_MS * 0.35)}ms ease-out`,
          animation: active
            ? `bear-claw-lunge-${side} ${SCRATCH_RESOLVE_FLASH_MS}ms cubic-bezier(0.16, 0.78, 0.24, 1) both`
            : undefined,
        }}
      >
        {/* Upper arm: heavy shoulder mass tapering into a visible elbow. */}
        <path d="M302 78 C344 82 377 109 410 159" fill="none" stroke="#160d08" strokeWidth="70" strokeLinecap="round" filter={`url(#claw-shadow-${suffix})`} />
        <path d="M302 78 C344 82 377 109 410 159" fill="none" stroke={`url(#claw-fur-${suffix})`} strokeWidth="61" strokeLinecap="round" />
        <path d="M292 64 C334 70 363 94 394 137" fill="none" stroke="rgba(226,188,132,0.2)" strokeWidth="9" strokeLinecap="round" />
        <ellipse cx="410" cy="159" rx="37" ry="34" fill="#493421" transform="rotate(24 410 159)" />

        {/* Forearm bends independently at the elbow before driving the paw
            down through the unsafe columns. */}
        <g
          style={{
            transformBox: "view-box",
            transformOrigin: "68.3% 40.8%",
            transform: "rotate(-22deg)",
            transition: `transform ${Math.round(SCRATCH_RESOLVE_FLASH_MS * 0.35)}ms ease-out`,
            animation: active
              ? `bear-claw-forearm ${SCRATCH_RESOLVE_FLASH_MS}ms cubic-bezier(0.2, 0.85, 0.25, 1) both`
              : undefined,
          }}
        >
          <path d="M410 159 C440 199 474 234 519 269" fill="none" stroke="#160d08" strokeWidth="62" strokeLinecap="round" filter={`url(#claw-shadow-${suffix})`} />
          <path d="M410 159 C440 199 474 234 519 269" fill="none" stroke={`url(#claw-fur-${suffix})`} strokeWidth="54" strokeLinecap="round" />
          <path d="M406 146 C438 184 469 214 506 245" fill="none" stroke="rgba(232,198,151,0.18)" strokeWidth="8" strokeLinecap="round" />

          <g
            style={{
              transformBox: "view-box",
              transformOrigin: "86.7% 69.2%",
              transform: "rotate(-18deg) scale(0.94)",
              transition: `transform ${Math.round(SCRATCH_RESOLVE_FLASH_MS * 0.35)}ms ease-out`,
              animation: active ? `bear-claw-paw ${SCRATCH_RESOLVE_FLASH_MS}ms ease-out both` : undefined,
            }}
          >
            <path
              d="M489 244 C516 227 552 231 574 252 C590 268 588 298 565 310 C538 324 499 310 482 285 C473 271 477 253 489 244 Z"
              fill={`url(#claw-paw-${suffix})`}
              stroke="#1d120c"
              strokeWidth="5"
              filter={`url(#claw-shadow-${suffix})`}
            />
            <path d="M500 250 C523 240 548 244 564 257" fill="none" stroke="rgba(240,204,155,0.2)" strokeWidth="7" strokeLinecap="round" />
            {[0, 1, 2, 3].map((i) => {
              const y = 250 + i * 17;
              return (
                <g key={i}>
                  <ellipse cx={565 + i * 2} cy={y + 5} rx="12" ry="9" fill="#352218" />
                  <path
                    d={`M${568 + i * 2} ${y} C${589 + i * 3} ${y - 7}, ${608 + i * 3} ${y - 2}, ${621 + i * 4} ${y + 7} C${604 + i * 2} ${y + 5}, ${589 + i * 2} ${y + 10}, ${573 + i * 2} ${y + 13} Z`}
                    fill={`url(#claw-nail-${suffix})`}
                    stroke="#4a4037"
                    strokeWidth="1.5"
                  />
                </g>
              );
            })}
          </g>
        </g>
      </g>

      {/* Contact streaks belong to the moving paw, not the floor tiles. */}
      {[0, 1, 2, 3].map((i) => (
        <path
          key={i}
          d={`M${505 + i * 9} ${305 + i * 9} Q${545 + i * 8} ${326 + i * 7} ${590 + i * 5} ${336 + i * 6}`}
          fill="none"
          stroke={i % 2 === 0 ? "#ffe8b0" : "#ff7847"}
          strokeWidth={i % 2 === 0 ? 4 : 3}
          strokeLinecap="round"
          style={{
            filter: "drop-shadow(0 0 5px rgba(255,110,60,0.85))",
            opacity: 0,
            animation: active
              ? `bear-claw-contact ${SCRATCH_RESOLVE_FLASH_MS}ms ease-out ${i * 24}ms both`
              : undefined,
          }}
        />
      ))}
      </svg>
    </div>
  );
}
