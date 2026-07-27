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
  const roaring = action === "roar-telegraph" || action === "roar-resolve";
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
        key={action === "scratch" ? `scratch-${scratchStrike}` : action}
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

        {/* raised arm, claws fanned — the static threat pose outside
            combat's active swings; during a Scratch it claws too (both
            arms rake at once, not just one), and during a Roar both arms
            throw up overhead for a real "rearing up to roar" silhouette */}
        <Arm side="left" pose={action === "scratch" ? "swipe" : "raised"} />
        {/* the other arm mirrors the same swipe during a Scratch — together
            they read as a real double-claw rake across the floor, biased
            by scratchLean toward whichever side is actually getting hit;
            during a Roar it throws up overhead alongside the other arm;
            otherwise it sits in its normal lowered pose */}
        <Arm side="right" pose={action === "scratch" ? "swipe" : roaring ? "raised" : "lowered"} />

        {/* head atop the torso */}
        <div className="absolute left-1/2 top-0 h-[38%] w-[42%] -translate-x-1/2" style={{ clipPath: "circle(50% at 50% 45%)", background: FUR }}>
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

// One raised (claws fanned overhead, threatening), lowered/forward, or
// mid-swipe arm — shared shape, mirrored by side. Split into an outer
// wrapper (position + mirroring, always static) and an inner one (just the
// rotation) specifically so the swipe's keyframe — which sets `transform`
// outright each frame — only ever overrides the rotation, never clobbering
// the outer translateX/scaleX(mirror) it would otherwise replace wholesale.
function Arm({ side, pose }: { side: "left" | "right"; pose: "raised" | "lowered" | "swipe" }) {
  const mirror = side === "left" ? 1 : -1;
  const staticRotation = pose === "raised" ? -55 : 10;
  return (
    <div
      className="absolute left-1/2 top-[30%] h-[16%] w-[38%] origin-left"
      style={{ transform: `translateX(${-6 * mirror}%) scaleX(${mirror})` }}
    >
      <div
        className="h-full w-full origin-left"
        style={{
          transform: pose === "swipe" ? undefined : `rotate(${staticRotation}deg)`,
          animation: pose === "swipe" ? `bear-scratch-swipe ${SCRATCH_RESOLVE_FLASH_MS}ms ease-out both` : undefined,
          transition: pose === "swipe" ? undefined : "transform 500ms ease-out",
          background: FUR_DARK,
          clipPath: "polygon(0% 20%, 90% 0%, 100% 30%, 92% 55%, 100% 80%, 88% 100%, 0% 60%)",
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute right-0 h-[3px] w-[13px] bg-[#1c130c]"
            style={{ top: `${18 + i * 28}%`, clipPath: "polygon(0% 50%, 100% 0%, 100% 100%)" }}
          />
        ))}
      </div>
    </div>
  );
}
