import type { BowShot } from "./useCaveBearDamagePhase";

// Pure presentational overlay for the Damage Phase — the bear's drift
// marker and a bow that's always fully drawn (string taut, arrow nocked),
// sliding along the aim track to follow the pointer; a click/tap fires it
// immediately at wherever it's currently aimed. No charge state, no
// spread — one click, one shot. Owns no pointer handlers itself;
// CaveBearFight wires those to the arena div this sits inside.
export function CaveBearSpearAim({
  bearDriftX,
  aimX,
  shot,
}: {
  bearDriftX: number;
  aimX: number | null;
  shot: BowShot;
}) {
  const rigX = aimX ?? 50;

  return (
    <div className="pointer-events-none absolute inset-0">
      <div
        className="absolute top-8 h-10 w-10 -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${bearDriftX}%`,
          clipPath: "circle(50% at 50% 50%)",
          background: "radial-gradient(circle, rgba(220,40,20,0.5), transparent 70%)",
        }}
      />

      {/* the bow — visible at rest the instant the Damage Phase begins,
          already fully drawn; hidden again once a shot resolves (the
          impact flash takes over the visual). */}
      {!shot && (
        <div
          className="absolute bottom-2 -translate-x-1/2 transition-[left] duration-150 ease-out"
          style={{ left: `${rigX}%` }}
        >
          {/* an inviting pulse on the nocked arrowhead, hinting "click to
              shoot" — the whole point of a bow that's already drawn. */}
          <div
            className="pointer-events-none absolute -top-[34px] left-1/2 h-4 w-4 -translate-x-1/2 animate-[aim-hint-pulse_1.3s_ease-in-out_infinite]"
            style={{ clipPath: "circle(50% at 50% 50%)", background: "var(--neon)", boxShadow: "0 0 10px var(--neon)" }}
          />

          {/* the arrow, nocked and pointing at the target — its tail sits
              right on the bow's taut string (drawn at y=6 in the svg
              below), tip rising above it */}
          <div className="absolute -top-[26px] left-1/2 h-8 w-1 -translate-x-1/2">
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #d8b483 0%, #8a6238 55%, #5a3e22 100%)" }} />
            <div
              className="absolute -top-[10px] left-1/2 h-3.5 w-[10px] -translate-x-1/2"
              style={{ clipPath: "polygon(50% 0%, 100% 100%, 50% 78%, 0% 100%)", background: "linear-gradient(180deg, #eef2f4 0%, #9ea8ad 100%)" }}
            />
            {/* fletching at the nock end */}
            <div
              className="absolute bottom-0 left-1/2 h-2 w-3 -translate-x-1/2"
              style={{ clipPath: "polygon(0% 0%, 100% 0%, 50% 100%)", background: "#c1392b" }}
            />
          </div>

          {/* the bow itself — a wooden arc with a taut string, drawn back
              around the arrow's nock; svg for a real curve rather than
              faking one out of straight polygon edges */}
          <svg width="58" height="34" viewBox="0 0 58 34" style={{ overflow: "visible" }}>
            <path d="M 4 6 Q 29 34 54 6" fill="none" stroke="#6b4a2a" strokeWidth="5" strokeLinecap="round" />
            <path d="M 4 6 Q 29 32 54 6" fill="none" stroke="#4a3220" strokeWidth="1.5" />
            <line x1="4" y1="6" x2="54" y2="6" stroke="#e8e2d0" strokeWidth="1.5" />
          </svg>
        </div>
      )}

      {shot && <ImpactFlash x={shot.aimX} hit={shot.hit} />}
    </div>
  );
}

function ImpactFlash({ x, hit }: { x: number; hit: boolean }) {
  return (
    <div
      className="absolute top-8 h-8 w-8 -translate-x-1/2 -translate-y-1/2 animate-[beam-impact-flash_0.5s_ease-out_forwards]"
      style={{
        left: `${x}%`,
        clipPath: "circle(50% at 50% 50%)",
        background: hit
          ? "radial-gradient(circle, var(--neon), transparent 70%)"
          : "radial-gradient(circle, rgba(255,255,255,0.5), transparent 70%)",
      }}
    />
  );
}
