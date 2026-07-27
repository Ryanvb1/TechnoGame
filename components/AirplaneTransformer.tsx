// The airport's boss, rebuilt. Keeps the core idea that made the original
// worth keeping — one persistent set of parts that actually transforms,
// the same wings rotating down into arms, the same nose becoming the
// head, the same landing gear retracting as the same legs telescope out
// — but with two real fixes: the torso/leg proportions read as a stocky
// robot now instead of a tall thin one, and "combat" is a genuine
// asymmetric aiming stance (one arm raised and leveled, the other braced
// in) rather than a symmetric T-pose that never looked like it meant to
// fight anyone.
export type TransformerPhase = "parked" | "robot" | "combat";

// Full desktop scale; --ascale (set responsively, same pattern as
// FightScene's --kscale / CaveBear's --bscale) scales everything down
// together for mobile.
function a(px: number) {
  return `calc(${px}px * var(--ascale))`;
}

const TRANSITION = "700ms ease-in-out";

// Per-side rotation, explicit rather than a single mirrored value — the
// old version only ever supported symmetric poses (mirroring the same
// angle can't produce "one arm up, one arm down"), which is exactly what
// combat needed and didn't have. parked/robot stay symmetric; combat is
// the one phase that actually diverges left vs right.
const WING_ROTATION_DEG: Record<TransformerPhase, { left: number; right: number }> = {
  parked: { left: -4, right: -4 },
  robot: { left: 88, right: 88 },
  combat: { left: 72, right: -18 },
};
const STAB_ROTATION_DEG: Record<TransformerPhase, number> = { parked: -10, robot: 42, combat: 52 };
const BACKFIN_ROTATION_DEG: Record<TransformerPhase, number> = { parked: 0, robot: 14, combat: 24 };
// Landing gear retracts as these same legs extend — scaleY from a nearly
// flat sliver (tucked under the fuselage) up to full stride, anchored at
// the hip so it telescopes downward rather than growing from the middle.
const LEG_SCALE: Record<TransformerPhase, number> = { parked: 0.1, robot: 1, combat: 1 };
const WHEEL_OPACITY: Record<TransformerPhase, number> = { parked: 1, robot: 0, combat: 0 };
// Cockpit glass doubling as a face — dim and lifeless parked, cyan once
// standing, hot magenta once he actually means it (matches the runway's
// own cyan/magenta accent pair rather than a plain red).
const EYE_COLOR: Record<TransformerPhase, string> = { parked: "#454e63", robot: "#7dd8ff", combat: "#ff3b6e" };
// Wider and shorter than the original's tall/thin box — this is the
// actual proportion fix: robot/combat now read as a stocky torso instead
// of a fuselage standing on end.
const TORSO_TRANSFORM: Record<TransformerPhase, string> = {
  parked: "scaleY(1.24) scaleX(0.74)",
  robot: "scaleY(1) scaleX(1)",
  combat: "scaleY(0.98) scaleX(1.1) rotate(-3deg)",
};
const HEAD_BOTTOM: Record<TransformerPhase, string> = { parked: "66%", robot: "62%", combat: "62%" };

const FUS = "linear-gradient(160deg, #e2e8f0 0%, #a8b3c4 45%, #5a6478 100%)";
const FUS_DARK = "linear-gradient(160deg, #6b7690 0%, #454e63 55%, #20242f 100%)";

export function AirplaneTransformer({ phase }: { phase: TransformerPhase }) {
  const parked = phase === "parked";
  const combat = phase === "combat";
  return (
    <div className="relative [--ascale:0.42] sm:[--ascale:0.78]" style={{ width: a(300), height: a(230) }}>
      {/* contact shadow — wide and low for a plane resting on its gear,
          tighter once he's standing on two feet */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 transition-[width] ease-in-out"
        style={{
          transitionDuration: TRANSITION,
          height: a(14),
          width: parked ? a(240) : a(120),
          clipPath: "ellipse(50% 50% at 50% 50%)",
          background: "radial-gradient(closest-side, rgba(0,0,0,0.55), transparent 75%)",
        }}
      />

      <BackFin side="left" phase={phase} />
      <BackFin side="right" phase={phase} />

      <Leg side="left" phase={phase} />
      <Leg side="right" phase={phase} />
      {[-19, 0, 19].map((dx, i) => (
        <div
          key={i}
          className="absolute bottom-[6%] left-1/2 h-4 w-4 transition-opacity"
          style={{
            transitionDuration: TRANSITION,
            transform: `translateX(calc(-50% + ${dx}px))`,
            opacity: WHEEL_OPACITY[phase],
            clipPath: "circle(50% at 50% 50%)",
            background: "#14161c",
            border: "2px solid #2e3448",
          }}
        />
      ))}

      <Stabilizer side="left" phase={phase} />
      <Stabilizer side="right" phase={phase} />

      {/* fuselage / torso */}
      <div
        className="absolute bottom-[14%] left-1/2 origin-bottom transition-transform ease-in-out"
        style={{
          transitionDuration: TRANSITION,
          transform: `translateX(-50%) ${TORSO_TRANSFORM[phase]}`,
          width: a(74),
          height: a(104),
          clipPath: "polygon(28% 0%, 72% 0%, 100% 24%, 90% 100%, 10% 100%, 0% 24%)",
          background: FUS,
        }}
      >
        <div className="absolute inset-x-0 top-[44%] h-[10%]" style={{ background: "var(--neon-dim)", opacity: 0.8 }} />
        <div className="absolute inset-x-0 top-[16%] flex justify-center gap-[3px] opacity-70">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[6%] w-[10%]" style={{ background: "#0a0e18" }} />
          ))}
        </div>
        {/* chest core, only lit up once he's actually standing — reads as
            a power source, gives robot/combat something at dead center
            instead of a bare livery stripe */}
        {!parked && (
          <div
            className="absolute left-1/2 top-[62%] -translate-x-1/2 -translate-y-1/2 transition-colors"
            style={{
              transitionDuration: TRANSITION,
              width: a(14),
              height: a(14),
              clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
              background: EYE_COLOR[phase],
              boxShadow: `0 0 8px ${EYE_COLOR[phase]}`,
            }}
          />
        )}
      </div>

      <Wing side="left" phase={phase} />
      <Wing side="right" phase={phase} />

      {/* nose / head, always on top */}
      <div
        className="absolute left-1/2 -translate-x-1/2 transition-[bottom] ease-in-out"
        style={{ transitionDuration: TRANSITION, bottom: HEAD_BOTTOM[phase], width: a(38), height: a(40) }}
      >
        <div
          className="absolute inset-0"
          style={{ clipPath: "polygon(50% 0%, 88% 30%, 100% 100%, 0% 100%, 12% 30%)", background: FUS }}
        />
        <div className="absolute inset-x-[16%] top-[38%] h-[22%]" style={{ background: "#0a0e18" }}>
          <div
            className="absolute inset-y-[22%] left-[12%] w-[30%] transition-colors"
            style={{ transitionDuration: TRANSITION, background: EYE_COLOR[phase], boxShadow: `0 0 6px ${EYE_COLOR[phase]}` }}
          />
          <div
            className="absolute inset-y-[22%] right-[12%] w-[30%] transition-colors"
            style={{ transitionDuration: TRANSITION, background: EYE_COLOR[phase], boxShadow: `0 0 6px ${EYE_COLOR[phase]}` }}
          />
        </div>
      </div>

      {/* muzzle flare — only while the raised arm is actually a leveled
          weapon (combat), tucked at the right wingtip where the engine
          pod becomes a cannon */}
      {combat && (
        <div
          className="pointer-events-none absolute animate-[fire-glow-pulse_0.8s_ease-in-out_infinite]"
          style={{
            right: a(-6),
            top: a(30),
            width: a(16),
            height: a(16),
            clipPath: "circle(50% at 50% 50%)",
            background: "radial-gradient(circle, #ffffff 0%, #ff3b6e 55%, transparent 75%)",
          }}
        />
      )}

      {/* transform impact flash */}
      {!parked && (
        <div
          key={phase}
          className="pointer-events-none absolute left-1/2 top-[36%] h-20 w-20 -translate-x-1/2 -translate-y-1/2"
          style={{
            clipPath: "circle(50% at 50% 50%)",
            background: "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(125,216,255,0.5) 45%, transparent 75%)",
            animation: "mech-transform-flash 700ms ease-out both",
          }}
        />
      )}
    </div>
  );
}

function Wing({ side, phase }: { side: "left" | "right"; phase: TransformerPhase }) {
  const mirror = side === "left" ? -1 : 1;
  const navColor = side === "left" ? "#ff3b3b" : "#39ff8f";
  const rotation = side === "left" ? WING_ROTATION_DEG[phase].left : WING_ROTATION_DEG[phase].right;
  return (
    <div
      className="absolute origin-left transition-transform ease-in-out"
      style={{
        transitionDuration: TRANSITION,
        // Rooted at the torso's own shoulder edge, not dead-center — see
        // the original's own note on why (pivoting from the middle left a
        // visible gap past the torso's tapered silhouette).
        left: `calc(50% + ${a(mirror * 24)})`,
        bottom: "50%",
        width: a(94),
        height: a(20),
        transform: `scaleX(${mirror}) rotate(${rotation}deg)`,
        clipPath: "polygon(0% 42%, 76% 18%, 100% 0%, 94% 52%, 100% 100%, 68% 78%, 0% 58%)",
        background: FUS,
      }}
    >
      <div
        className="absolute right-0 top-1/2 h-[10px] w-[10px] -translate-y-1/2 animate-[fire-glow-pulse_1.6s_ease-in-out_infinite]"
        style={{ clipPath: "circle(50% at 50% 50%)", background: navColor, boxShadow: `0 0 6px ${navColor}` }}
      />
      {/* engine pod — doubles as the fist once the wing's swung down into
          an arm, and as a cannon muzzle on the arm that's actually aiming */}
      <div
        className="absolute left-[36%] top-full h-[16px] w-[26px] -translate-x-1/2"
        style={{ clipPath: "polygon(10% 0%, 90% 0%, 100% 60%, 80% 100%, 20% 100%, 0% 60%)", background: FUS_DARK }}
      />
    </div>
  );
}

function Stabilizer({ side, phase }: { side: "left" | "right"; phase: TransformerPhase }) {
  const mirror = side === "left" ? -1 : 1;
  return (
    <div
      className="absolute bottom-[20%] origin-left transition-transform ease-in-out"
      style={{
        transitionDuration: TRANSITION,
        left: `calc(50% + ${a(mirror * 18)})`,
        width: a(48),
        height: a(13),
        transform: `scaleX(${mirror}) rotate(${STAB_ROTATION_DEG[phase]}deg)`,
        clipPath: "polygon(0% 30%, 80% 10%, 100% 0%, 90% 60%, 100% 100%, 0% 80%)",
        background: FUS_DARK,
      }}
    />
  );
}

function BackFin({ side, phase }: { side: "left" | "right"; phase: TransformerPhase }) {
  const mirror = side === "left" ? -1 : 1;
  return (
    <div
      className="absolute bottom-[38%] origin-bottom transition-transform ease-in-out"
      style={{
        transitionDuration: TRANSITION,
        left: `calc(50% + ${a(mirror * 26)})`,
        width: a(13),
        height: a(48),
        transform: `scaleX(${mirror}) rotate(${BACKFIN_ROTATION_DEG[phase]}deg)`,
        clipPath: "polygon(30% 100%, 0% 34%, 45% 0%, 100% 58%, 68% 100%)",
        background: FUS_DARK,
      }}
    />
  );
}

function Leg({ side, phase }: { side: "left" | "right"; phase: TransformerPhase }) {
  const mirror = side === "left" ? -1 : 1;
  return (
    <div
      className="absolute bottom-0 left-1/2 origin-top transition-transform ease-in-out"
      style={{
        transitionDuration: TRANSITION,
        transform: `translateX(calc(-50% + ${mirror * 16}px)) scaleY(${LEG_SCALE[phase]})`,
        width: a(24),
        height: a(74),
        clipPath: "polygon(22% 0%, 78% 0%, 90% 88%, 100% 100%, 0% 100%, 10% 88%)",
        background: FUS_DARK,
      }}
    />
  );
}
