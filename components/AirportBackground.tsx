// The airport's environment, rebuilt — same near/mid/far depth banding as
// CaveBackground/ThroneHallBackground (runway lights standing in for
// lanterns), but pushed toward the site's own cooler neon-cyan identity
// rather than a warm generic dusk, plus a slow radar sweep as this
// location's one unique, unclaimed-by-anywhere-else detail (the cave has
// its crystal vein, the throne hall its pillars — this gets a working
// radar dish).

function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}
function round(n: number) {
  return Math.round(n * 10000) / 10000;
}

type Depth = "far" | "mid" | "near";

const DEPTH_STYLE: Record<Depth, { scale: number; opacity: number; blur: number }> = {
  far: { scale: 0.5, opacity: 0.4, blur: 1 },
  mid: { scale: 0.75, opacity: 0.75, blur: 0.2 },
  near: { scale: 1.2, opacity: 1, blur: 0 },
};

const RUNWAY_WIDTH = "min(1500px, 240vw)";
// Fixed pixel top/height rather than a percentage — with a rotateX'd +
// perspective'd child, a percentage-height container's *projected* edge
// drifts a lot with viewport height (see CaveBackground's own floor for
// the measured version of this same issue), which used to leave the
// parked plane/robot floating an inconsistent amount above the runway.
// Values below match the old 36%/64% split at a representative 800px
// viewport, and AirplaneTransformer's own ground offset is calibrated
// directly against this fixed edge.
const RUNWAY_TOP = 288;
const RUNWAY_HEIGHT = 512;

const RUNWAY_LIGHTS: { left: number; depth: Depth; side: "left" | "right" }[] = [
  { left: 4, depth: "near", side: "left" },
  { left: 96, depth: "near", side: "right" },
  { left: 16, depth: "mid", side: "left" },
  { left: 84, depth: "mid", side: "right" },
  { left: 27, depth: "far", side: "left" },
  { left: 73, depth: "far", side: "right" },
  { left: 37, depth: "far", side: "left" },
  { left: 63, depth: "far", side: "right" },
];

const CLOUD_COUNT = 6;
const CLOUDS = Array.from({ length: CLOUD_COUNT }, (_, i) => {
  const r1 = pseudoRandom(i * 3.7 + 11);
  const r2 = pseudoRandom(i * 6.3 + 17);
  const r3 = pseudoRandom(i * 9.1 + 23);
  return {
    left: round(r1 * 70),
    top: round(4 + r2 * 26),
    width: round(120 + r3 * 160),
    height: round(24 + r1 * 26),
    duration: round(38 + r2 * 30),
    delay: round(r3 * 20),
  };
});

export function AirportBackground({ alert = false }: { alert?: boolean }) {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {/* night sky — cool indigo-to-near-black, a shade of the same family
          as the throne hall's own night rather than the old warm dusk, so
          this reads as "after dark and lit by machines" instead of sunset */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 35% at 50% 100%, rgba(120,220,255,0.1), transparent 60%), linear-gradient(180deg, #05070f 0%, #0c1226 40%, #161a2e 72%, #1c1f30 100%)",
        }}
      />

      {/* distant terminal glow, low on the horizon — cyan-white instead of
          amber */}
      <div
        className="absolute inset-x-0 h-24 opacity-50"
        style={{ top: RUNWAY_TOP - 96, background: "linear-gradient(0deg, rgba(140,220,255,0.22), transparent 100%)" }}
      />

      {CLOUDS.map((c, i) => (
        <div
          key={i}
          className="absolute animate-[cloud-drift_ease-in-out_infinite]"
          style={{
            left: `${c.left}%`,
            top: `${c.top}%`,
            width: c.width,
            height: c.height,
            background: "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(210,220,240,0.4), transparent 75%)",
            filter: "blur(3px)",
            animationDuration: `${c.duration}s`,
            animationDelay: `${c.delay}s`,
          }}
        />
      ))}

      {/* control tower with a slow-sweeping radar dish — the beacon still
          alternates white/green the way real ones do, but the dish sweep
          is this location's own signature detail */}
      <div className="absolute left-[8%] top-[20%] opacity-90">
        <div className="relative flex flex-col items-center" style={{ transform: "scale(0.75)" }}>
          <RadarDish />
          <div className="relative mb-1 mt-2 h-3 w-3">
            <div
              className="absolute inset-0 animate-[beacon-blink_2.4s_step-end_infinite]"
              style={{ clipPath: "circle(50% at 50% 50%)", background: "#f2f6ff", boxShadow: "0 0 10px #f2f6ff" }}
            />
            <div
              className="absolute inset-0 animate-[beacon-blink_2.4s_step-end_infinite]"
              style={{
                clipPath: "circle(50% at 50% 50%)",
                background: "#39ff8f",
                boxShadow: "0 0 10px #39ff8f",
                animationDelay: "1.2s",
              }}
            />
          </div>
          <div
            className="relative h-10 w-20 border border-white/10"
            style={{ background: "linear-gradient(180deg, #384158 0%, #1c2233 100%)" }}
          >
            <div className="absolute inset-x-1 top-1 bottom-1" style={{ background: "linear-gradient(180deg, #7dd8ff 0%, #0e2a3a 100%)" }} />
          </div>
          <div className="h-24 w-4" style={{ background: "linear-gradient(180deg, #454e63 0%, #20242f 100%)" }} />
        </div>
      </div>

      {/* hangar, mid-ground right */}
      <div className="absolute right-[6%] top-[42%]" style={{ opacity: DEPTH_STYLE.mid.opacity }}>
        <div className="relative" style={{ transform: `scale(${DEPTH_STYLE.mid.scale})`, width: 220, height: 120 }}>
          <div className="absolute inset-x-0 top-0 h-3" style={{ background: "#2e3448" }} />
          <div
            className="absolute inset-x-0 top-3 bottom-0"
            style={{
              background: "linear-gradient(180deg, #454e63 0%, #262b3a 100%)",
              backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0 3px, rgba(0,0,0,0.15) 3px 6px)",
            }}
          />
          <div
            className="absolute bottom-0 left-1/2 h-[74%] w-[64%] -translate-x-1/2 border-2 border-[#7dd8ff]/20"
            style={{
              background: "radial-gradient(ellipse 70% 60% at 50% 100%, rgba(125,216,255,0.12) 0%, #06070c 65%)",
              clipPath: "polygon(4% 100%, 4% 12%, 50% 0%, 96% 12%, 96% 100%)",
            }}
          >
            <div
              className="absolute bottom-[10%] left-1/2 h-[54%] w-[14%] -translate-x-1/2 opacity-60"
              style={{ background: "linear-gradient(180deg,#7a828c,#3a3f48)", clipPath: "polygon(30% 100%, 10% 20%, 50% 0%, 90% 20%, 70% 100%)" }}
            />
          </div>
        </div>
      </div>

      {/* perimeter fence, right at the edge where field meets sky */}
      <div className="absolute inset-x-0 h-8 opacity-35" style={{ top: RUNWAY_TOP - 40 }}>
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="absolute bottom-0 h-full w-[2px]" style={{ left: `${(i / 29) * 100}%`, background: "#5a6478" }} />
        ))}
        <div className="absolute inset-x-0 top-1/3 h-px bg-[#5a6478]" />
        <div className="absolute inset-x-0 top-2/3 h-px bg-[#5a6478]" />
      </div>

      {/* runway, tilted back for real 3D depth */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{ top: RUNWAY_TOP, height: RUNWAY_HEIGHT, width: RUNWAY_WIDTH, perspective: "900px" }}
      >
        <div className="relative h-full w-full" style={{ transformStyle: "preserve-3d", transform: "rotateX(58deg)" }}>
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1c2030 0%, #0c0e16 100%)" }} />
          <div
            className="absolute inset-0 opacity-50"
            style={{ background: "linear-gradient(100deg, transparent 30%, rgba(140,200,255,0.1) 48%, transparent 66%)" }}
          />
          <div
            className="absolute inset-y-0 left-1/2 w-3 -translate-x-1/2 opacity-80"
            style={{ backgroundImage: "repeating-linear-gradient(180deg, #e8e8ec 0 34px, transparent 34px 68px)" }}
          />
          <div className="absolute inset-x-0 bottom-0 flex h-16 justify-center gap-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-full w-6" style={{ background: "rgba(232,232,236,0.85)" }} />
            ))}
          </div>
        </div>
      </div>

      {RUNWAY_LIGHTS.map((l, i) => (
        <RunwayLight key={i} {...l} />
      ))}

      {/* a second aircraft, small and dim, parked beside the hangar */}
      <div className="absolute opacity-30 blur-[0.5px]" style={{ top: RUNWAY_TOP + 24, right: "20%", transform: "scale(0.4)" }}>
        <div className="relative h-6 w-32">
          <div
            className="absolute left-1/2 top-1/2 h-4 w-32 -translate-x-1/2 -translate-y-1/2"
            style={{
              background: "linear-gradient(180deg,#c8cdd2,#7a828c)",
              clipPath: "polygon(0% 45%, 20% 0%, 80% 0%, 100% 45%, 100% 60%, 80% 100%, 20% 100%, 0% 60%)",
            }}
          />
          <div className="absolute left-1/2 top-1/2 h-12 w-3 -translate-x-1/2 -translate-y-1/2" style={{ background: "#7a828c" }} />
        </div>
      </div>

      <GroundMarking left={14} top={RUNWAY_TOP + RUNWAY_HEIGHT * 0.42} label="B7" />
      <GroundMarking left={86} top={RUNWAY_TOP + RUNWAY_HEIGHT * 0.44} label="A2" />
      <HoldShortChevrons left={50} top={RUNWAY_TOP + RUNWAY_HEIGHT * 0.53} />

      {/* windsock, planted right at the fixed runway edge */}
      <div className="absolute" style={{ left: "10%", top: RUNWAY_TOP - 68 }}>
        <div className="relative flex flex-col items-center">
          <div className="h-16 w-[2px]" style={{ background: "#454e63" }} />
          <div
            className="absolute top-0 h-4 w-10 origin-left animate-[windsock-flutter_2.2s_ease-in-out_infinite]"
            style={{
              clipPath: "polygon(0% 0%, 100% 20%, 78% 50%, 100% 80%, 0% 100%)",
              background: "linear-gradient(90deg, #ff6ec7 0%, #a83ba0 100%)",
            }}
          />
        </div>
      </div>

      {/* cargo containers + a luggage cart */}
      <div className="absolute h-8 w-14" style={{ top: RUNWAY_TOP + 26, right: "16%", background: "linear-gradient(160deg,#3a7a8a,#132c33)" }} />
      <div className="absolute h-8 w-12" style={{ top: RUNWAY_TOP + 26, right: "9%", background: "linear-gradient(160deg,#7d4aa8,#301c48)" }} />
      <div className="absolute flex h-4 gap-1" style={{ top: RUNWAY_TOP + 34, right: "28%" }}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-4 w-5" style={{ background: "#2e3448", border: "1px solid rgba(255,255,255,0.15)" }} />
        ))}
      </div>

      {/* the mood shift once the plane transforms */}
      <div
        className="absolute inset-0 transition-opacity duration-[1200ms]"
        style={{
          opacity: alert ? 0.35 : 0,
          background: "radial-gradient(ellipse 70% 55% at 50% 60%, rgba(180,20,90,0.5), transparent 72%)",
        }}
      />
      {alert && (
        <>
          <div className="absolute bottom-[12%] left-[6%] h-2 w-2 animate-[beacon-blink_0.6s_step-end_infinite]" style={{ clipPath: "circle(50% at 50% 50%)", background: "#ff3b6e", boxShadow: "0 0 10px #ff3b6e" }} />
          <div className="absolute bottom-[12%] right-[6%] h-2 w-2 animate-[beacon-blink_0.6s_step-end_infinite]" style={{ clipPath: "circle(50% at 50% 50%)", background: "#ff3b6e", boxShadow: "0 0 10px #ff3b6e", animationDelay: "0.3s" }} />
        </>
      )}

      <div className="absolute inset-x-0 top-0 h-24" style={{ background: "linear-gradient(180deg, #030408 0%, transparent 100%)" }} />
    </div>
  );
}

function RunwayLight({ left, depth }: { left: number; depth: Depth; side: "left" | "right" }) {
  const d = DEPTH_STYLE[depth];
  const size = 8 * d.scale;
  const color = depth === "near" ? "#c8f0ff" : depth === "mid" ? "#8fd8ff" : "#5a9fd8";
  return (
    <div
      className="absolute animate-[fire-glow-pulse_2.4s_ease-in-out_infinite]"
      style={{
        left: `${left}%`,
        top: RUNWAY_TOP + RUNWAY_HEIGHT * (depth === "near" ? 0.92 : depth === "mid" ? 0.55 : 0.22),
        width: size,
        height: size,
        opacity: d.opacity,
        filter: d.blur ? `blur(${d.blur}px)` : undefined,
        clipPath: "circle(50% at 50% 50%)",
        background: color,
        boxShadow: `0 0 ${8 * d.scale}px ${color}`,
      }}
    />
  );
}

function GroundMarking({ left, top, label }: { left: number; top: number; label: string }) {
  return (
    <div
      className="absolute -translate-x-1/2 text-[0.6rem] font-bold tracking-[0.1em] opacity-70"
      style={{ left: `${left}%`, top, color: "#ffcf6b", textShadow: "0 0 4px rgba(255,207,107,0.6)" }}
    >
      {label}
    </div>
  );
}

function HoldShortChevrons({ left, top }: { left: number; top: number }) {
  return (
    <div className="absolute flex -translate-x-1/2 gap-1 opacity-70" style={{ left: `${left}%`, top }}>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-3 w-3" style={{ clipPath: "polygon(0% 0%, 50% 50%, 0% 100%, 25% 100%, 75% 50%, 25% 0%)", background: "#e8e8ec" }} />
      ))}
    </div>
  );
}

// A slow-sweeping radar dish mounted just above the tower cab — the
// airport's own unclaimed signature detail, the same idea as the cave's
// crystal vein or the throne hall's pillars: one deliberately-animated
// piece nowhere else has.
function RadarDish() {
  return (
    <div className="relative h-8 w-8">
      <div
        className="absolute inset-0 origin-bottom animate-[slow-spin_6s_linear_infinite]"
        style={{
          clipPath: "polygon(50% 100%, 0% 20%, 100% 20%)",
          background: "linear-gradient(180deg, #b7c0ca 0%, #6b737c 100%)",
        }}
      />
      <div className="absolute bottom-0 left-1/2 h-3 w-1 -translate-x-1/2" style={{ background: "#454e63" }} />
    </div>
  );
}
