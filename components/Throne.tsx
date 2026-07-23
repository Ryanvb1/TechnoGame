import { PILLAR_COLORS } from "./pillarColors";

const MOUND_CLIP_PATH =
  "polygon(50% 0%, 78% 8%, 94% 28%, 100% 55%, 92% 80%, 70% 100%, 30% 100%, 8% 80%, 0% 55%, 6% 28%, 22% 8%)";

const SMALL_MOUND_CLIP_PATH =
  "polygon(50% 0%, 82% 15%, 100% 50%, 80% 90%, 50% 100%, 20% 90%, 0% 50%, 18% 15%)";

const CROWN_TOP_CLIP_PATH =
  "polygon(0% 100%, 0% 22%, 15% 8%, 30% 20%, 50% 0%, 70% 20%, 85% 8%, 100% 22%, 100% 100%)";

const CROWN_CLIP_PATH =
  "polygon(0% 100%, 0% 45%, 18% 70%, 32% 15%, 50% 55%, 68% 15%, 82% 70%, 100% 45%, 100% 100%)";

const CHEST_LID_CLIP_PATH =
  "polygon(8% 100%, 0% 35%, 20% 0%, 80% 0%, 100% 35%, 92% 100%)";

const CARPET_CLIP_PATH = "polygon(38% 0%, 62% 0%, 84% 100%, 16% 100%)";

// Sizes below are the full desktop scale (50% larger than the original
// design); the `--tscale` custom property (set responsively below) scales
// everything back down together for mobile so nothing overflows there.
//
// Left to right, in the exact order the toad attacks the pillars
// (PILLAR_COLORS) — same convention as the pillar stars themselves and the
// night sky's planets, so all three read as the same sequence rather than
// three unrelated decorations.
const GEMS = [
  { left: "8%", bottom: "6%", size: 18, z: 18, color: PILLAR_COLORS[0] },
  { left: "24%", bottom: "16%", size: 14, z: 21, color: PILLAR_COLORS[1] },
  { left: "40%", bottom: "2%", size: 17, z: 29, color: PILLAR_COLORS[2] },
  { left: "58%", bottom: "12%", size: 14, z: 15, color: PILLAR_COLORS[3] },
  { left: "72%", bottom: "3%", size: 15, z: 26, color: PILLAR_COLORS[4] },
  { left: "88%", bottom: "10%", size: 21, z: 11, color: PILLAR_COLORS[5] },
];

function s(px: number) {
  return `calc(${px}px * var(--tscale))`;
}

export function Throne() {
  return (
    <div
      className="relative flex items-center justify-center [--tscale:0.6] sm:[--tscale:1]"
      style={{ perspective: "1200px", height: s(504), width: s(576) }}
    >
      {/* ambient glow */}
      <div
        className="absolute animate-[fire-glow-pulse_4s_ease-in-out_infinite]"
        style={{
          height: s(317),
          width: s(317),
          background:
            "radial-gradient(closest-side, rgba(255,208,90,0.42), transparent 70%)",
        }}
      />

      {/* the whole scene shares one rotateX so the floor recedes and the
          throne — lifted out on the z-axis — reads as standing on it */}
      <div
        className="relative"
        style={{
          height: s(270),
          width: s(396),
          transformStyle: "preserve-3d",
          transform: "rotateX(52deg) scale(0.88)",
        }}
      >
        {/* small overflow coin heaps beside the main pile */}
        <div
          className="absolute bottom-0 left-[-6%]"
          style={{
            height: s(69),
            width: s(93),
            clipPath: SMALL_MOUND_CLIP_PATH,
            background:
              "radial-gradient(circle at 50% 30%, #fff2b0 0%, #f6c94c 35%, #b3811f 100%)",
            transform: `translateZ(${s(2)})`,
          }}
        />
        <div
          className="absolute bottom-0 right-[-8%]"
          style={{
            height: s(57),
            width: s(78),
            clipPath: SMALL_MOUND_CLIP_PATH,
            background:
              "radial-gradient(circle at 50% 30%, #fff2b0 0%, #f6c94c 35%, #b3811f 100%)",
            transform: `translateZ(${s(2)})`,
          }}
        />

        {/* distant gold pile */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: MOUND_CLIP_PATH,
            background:
              "radial-gradient(circle at 50% 25%, #fff2b0 0%, #f6c94c 30%, #c9922a 65%, #7a531a 100%)",
            boxShadow: "0 0 36px rgba(0,0,0,0.5) inset",
          }}
        >
          <div
            className="absolute inset-0 opacity-50"
            style={{
              clipPath: MOUND_CLIP_PATH,
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.4) 0 2px, transparent 3px)",
              backgroundSize: "16px 16px",
            }}
          />
          {/* red carpet leading up to the throne */}
          <div
            className="absolute inset-x-0 bottom-0 top-[6%] opacity-90"
            style={{
              clipPath: CARPET_CLIP_PATH,
              background: "linear-gradient(180deg, #8a1530 0%, #5c0d20 100%)",
            }}
          />
        </div>

        {/* scattered gems among the gold */}
        {GEMS.map((gem, i) => (
          <div
            key={i}
            className="absolute border border-white/40"
            style={{
              left: gem.left,
              bottom: gem.bottom,
              width: s(gem.size),
              height: s(gem.size),
              background: gem.color,
              boxShadow: `0 0 9px ${gem.color}`,
              transform: `translateZ(${s(gem.z)}) rotate(45deg)`,
            }}
          />
        ))}

        {/* treasure chests flanking the throne, spilling coins */}
        <div
          className="absolute left-[3%] bottom-[34%]"
          style={{ transform: `translateZ(${s(50)})` }}
        >
          <div className="relative flex flex-col items-center">
            <div
              className="absolute left-1/2 -translate-x-1/2"
              style={{
                top: s(-6),
                width: s(12),
                height: s(12),
                background: "#f6c94c",
                boxShadow: "0 0 7px #f6c94c",
                transform: "rotate(45deg)",
              }}
            />
            <div
              className="border border-yellow-700/70"
              style={{
                width: s(67),
                height: s(14),
                clipPath: CHEST_LID_CLIP_PATH,
                background: "linear-gradient(180deg,#8a5a2b,#5c3a1a)",
                transform: `rotate(-10deg) translateY(${s(2)})`,
              }}
            />
            <div
              className="border border-yellow-700/70 bg-gradient-to-b from-[#7a4c22] to-[#4a2e14]"
              style={{ width: s(67), height: s(38) }}
            />
          </div>
        </div>
        <div
          className="absolute right-[3%] bottom-[38%]"
          style={{ transform: `translateZ(${s(58)})` }}
        >
          <div className="relative flex flex-col items-center">
            <div
              className="border border-yellow-700/70"
              style={{
                width: s(58),
                height: s(14),
                clipPath: CHEST_LID_CLIP_PATH,
                background: "linear-gradient(180deg,#8a5a2b,#5c3a1a)",
                transform: `rotate(8deg) translateY(${s(2)})`,
              }}
            />
            <div
              className="border border-yellow-700/70 bg-gradient-to-b from-[#7a4c22] to-[#4a2e14]"
              style={{ width: s(58), height: s(34) }}
            />
          </div>
        </div>

        {/* the empty throne, lifted above the pile via translateZ */}
        <div
          className="absolute left-1/2"
          style={{ bottom: s(108), transform: `translateX(-50%) translateZ(${s(84)})` }}
        >
          <div className="relative flex flex-col items-center">
            <div
              className="border-2 border-yellow-600/70"
              style={{
                width: s(77),
                height: s(115),
                clipPath: CROWN_TOP_CLIP_PATH,
                background:
                  "linear-gradient(160deg, #8a1f42 0%, #6b1530 40%, #3a0a1c 100%)",
                boxShadow: "0 0 22px rgba(250,204,21,0.35)",
              }}
            />
            <div className="relative flex items-end" style={{ marginTop: s(-10) }}>
              {/* crown resting on the empty seat */}
              <div
                className="absolute bottom-full left-1/2 -translate-x-1/2 border border-yellow-300/70"
                style={{
                  marginBottom: s(4),
                  width: s(38),
                  height: s(19),
                  clipPath: CROWN_CLIP_PATH,
                  background: "linear-gradient(180deg,#ffe08a,#caa243)",
                  boxShadow: "0 0 12px rgba(250,204,21,0.6)",
                }}
              />
              <div
                className="border border-yellow-600/70 bg-gradient-to-b from-yellow-400 to-yellow-700"
                style={{ width: s(14), height: s(48) }}
              />
              <div
                className="border border-yellow-600/70"
                style={{
                  width: s(96),
                  height: s(29),
                  background:
                    "linear-gradient(160deg, #9a2349 0%, #7a1c3a 40%, #45102a 100%)",
                }}
              />
              <div
                className="border border-yellow-600/70 bg-gradient-to-b from-yellow-400 to-yellow-700"
                style={{ width: s(14), height: s(48) }}
              />
            </div>
            {/* legs */}
            <div className="flex justify-between" style={{ marginTop: s(2), width: s(77) }}>
              <div
                className="border border-yellow-700/70 bg-gradient-to-b from-yellow-500 to-yellow-800"
                style={{ width: s(12), height: s(43) }}
              />
              <div
                className="border border-yellow-700/70 bg-gradient-to-b from-yellow-500 to-yellow-800"
                style={{ width: s(12), height: s(43) }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
