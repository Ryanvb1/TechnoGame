import type { CSSProperties } from "react";

// A long regal hall, seen in perspective: stone pillars flanking a red
// carpet that runs from the viewer's feet all the way back to the throne
// (rendered separately, in Throne.tsx, sitting at the far/narrow end).
// Each pillar spans from the ceiling (y=0) down to where the floor is at
// its depth (`floorPct`), so every one of them visibly connects floor to
// ceiling rather than floating as a short segment partway down.
const PILLAR_ROWS = [
  { floorPct: 26, xPct: 33, width: 26, opacity: 0.6 },
  { floorPct: 46, xPct: 24, width: 38, opacity: 0.75 },
  { floorPct: 68, xPct: 14, width: 54, opacity: 0.9 },
  { floorPct: 92, xPct: 3, width: 76, opacity: 1 },
];

// Matches the width of Throne.tsx's own carpet (68% of its 396px-wide
// group) so the two read as one continuous carpet, not two different ones
// meeting at a seam.
const HALL_CARPET_WIDTH = "min(400px, 68vw)";
const HALL_CARPET_CLIP_PATH = "polygon(16% 0%, 84% 0%, 92% 100%, 8% 100%)";

export function ThroneHallBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* dim regal atmosphere, warm glow gathering toward the throne */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 50% 24%, rgba(255,205,120,0.16), transparent 65%), linear-gradient(180deg, #0d090c 0%, #1a1014 40%, #120c0f 100%)",
        }}
      />

      {/* high side walls, receding with the hall */}
      <div
        className="absolute inset-y-0 left-0 w-[18%]"
        style={{ background: "linear-gradient(90deg, #241a16 0%, transparent 100%)" }}
      />
      <div
        className="absolute inset-y-0 right-0 w-[18%]"
        style={{ background: "linear-gradient(270deg, #241a16 0%, transparent 100%)" }}
      />

      {/* the long hall itself, tilted back for real 3D depth */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          top: "16%",
          bottom: 0,
          width: "min(1500px, 240vw)",
          perspective: "900px",
        }}
      >
        <div
          className="relative h-full w-full"
          style={{ transformStyle: "preserve-3d", transform: "rotateX(58deg)" }}
        >
          {/* stone floor */}
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

          {/* the royal carpet — narrow, matching the throne's own carpet
              width, so it reads as one carpet running the whole room */}
          <div
            className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2"
            style={{ width: HALL_CARPET_WIDTH }}
          >
            <div
              className="absolute inset-0"
              style={{
                clipPath: HALL_CARPET_CLIP_PATH,
                background: "linear-gradient(180deg, #6b0f22 0%, #8a1530 45%, #a3203e 100%)",
                boxShadow: "0 0 40px rgba(140,20,40,0.5)",
              }}
            >
              {/* gold trim running down both edges of the carpet */}
              <div
                className="absolute inset-0 opacity-70"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(180deg, rgba(250,204,80,0.35) 0 3px, transparent 3px 40px)",
                  mixBlendMode: "overlay",
                }}
              />
            </div>
          </div>

          {/* pillar rows, converging and shrinking toward the throne,
              each one stretching floor to ceiling */}
          {PILLAR_ROWS.map((row, i) => (
            <div key={i}>
              <Pillar row={row} side="left" />
              <Pillar row={row} side="right" />
            </div>
          ))}
        </div>
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
}: {
  row: { floorPct: number; xPct: number; width: number; opacity: number };
  side: "left" | "right";
}) {
  const sideStyle: CSSProperties =
    side === "left" ? { left: `${row.xPct}%` } : { right: `${row.xPct}%` };

  return (
    <div
      className="absolute top-0"
      style={{
        height: `${row.floorPct}%`,
        width: row.width,
        opacity: row.opacity,
        filter: row.opacity < 0.75 ? "blur(0.5px)" : undefined,
        ...sideStyle,
      }}
    >
      {/* capital, meeting the ceiling */}
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2"
        style={{ width: row.width * 1.35, height: row.width * 0.4, background: "#c2a67e" }}
      />
      {/* fluted shaft */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, #a88f6c 0%, #6b5a44 45%, #4a3d2e 100%)",
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.14) 0 2px, transparent 2px 9px)",
        }}
      />
      {/* bright rim-light edge for definition against the dark hall */}
      <div
        className="absolute left-0 top-0 h-full w-[2px]"
        style={{ background: "rgba(255,225,180,0.4)" }}
      />
      {/* base, meeting the floor at this row's depth */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{ width: row.width * 1.4, height: row.width * 0.45, background: "#c2a67e" }}
      />
      {/* torch, on the nearer two rows only */}
      {row.opacity > 0.7 && (
        <div className="absolute left-1/2 -translate-x-1/2" style={{ top: "-8%" }}>
          <div style={{ width: 3, height: row.width * 0.5, background: "#2a1c10", margin: "0 auto" }} />
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
    </div>
  );
}
