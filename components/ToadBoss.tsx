import type { Ref } from "react";

// A massive toad, cresting the horizon behind the whole hall — rendered by
// ThroneHallBackground, sandwiched between the sky and the floor/pillars so
// the floor (painted after it) hides most of his bulk. Only the top of his
// head/eyes rise above the platform — the rest of him (belly and below) is
// implied to still be underneath it.
const WART_SPOTS = [
  { left: "20%", top: "18%", size: 13 },
  { left: "34%", top: "8%", size: 9 },
  { left: "66%", top: "9%", size: 10 },
  { left: "80%", top: "20%", size: 12 },
  { left: "50%", top: "4%", size: 8 },
  { left: "12%", top: "34%", size: 14 },
  { left: "88%", top: "36%", size: 13 },
];

export function ToadBoss({
  hit = false,
  dead = false,
  mouthRef,
}: {
  // Briefly true right as a reflected shot lands back on him.
  hit?: boolean;
  // True once he's been defeated — swaps his eyes to a stunned "X" and
  // sinks him slowly back below the platform instead of holding the risen
  // pose, the mirror image of his entrance.
  dead?: boolean;
  // Exposes the mouth's real DOM position so a thrown molotov can be aimed
  // at exactly where it is on screen, rather than a guessed offset — the
  // toad and the molotov live in unrelated layout containers, so there's
  // no shared percentage space to compute this from.
  mouthRef?: Ref<HTMLDivElement>;
}) {
  return (
    <div
      className="pointer-events-none absolute left-1/2 origin-bottom -translate-x-1/2"
      style={{
        bottom: "70%",
        width: "min(320px, 46vw)",
        height: "26vh",
        // The rise animation has already long finished playing (and is
        // holding its end state via fill-mode) by the time a fight can
        // possibly end, so it's safe to just swap it out for the sink
        // rather than layer the two.
        animation: dead
          ? "toad-sink 2800ms ease-in forwards"
          : "toad-rise 4.5s cubic-bezier(0.22, 1, 0.36, 1) both",
      }}
    >
      {/* sickly ambient glow behind the head */}
      <div
        className="absolute inset-0 animate-[toad-glow-pulse_3.5s_ease-in-out_infinite]"
        style={{ background: "radial-gradient(closest-side, rgba(120,200,60,0.45), transparent 70%)" }}
      />

      {/* head, a wide flattened dome like a toad's, its bottom edge meant
          to run past the horizon so the floor crops the rest of him */}
      <div
        className="absolute bottom-0 left-1/2 h-[88%] w-full -translate-x-1/2"
        style={{
          clipPath: "ellipse(50% 50% at 50% 100%)",
          background:
            "radial-gradient(ellipse at 50% 25%, #7fae4a 0%, #4f7a34 45%, #2c4a1e 80%, #1a2e12 100%)",
          boxShadow: "0 -24px 80px rgba(90,160,60,0.4)",
        }}
      >
        {WART_SPOTS.map((w, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: w.left,
              top: w.top,
              width: w.size,
              height: w.size,
              clipPath: "circle(50% at 50% 50%)",
              background: "radial-gradient(circle at 35% 30%, #3a5c26 0%, #223817 80%)",
              boxShadow: "inset 0 0 4px rgba(0,0,0,0.5)",
            }}
          />
        ))}
      </div>

      {/* wide, gaping mouth, low enough to sit right around/below the
          horizon — sized generously so a thrown molotov has clear room to
          land inside it, with the dark radial gradient reading as an open
          cavity rather than a flat slit */}
      <div
        ref={mouthRef}
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: "24%",
          width: "50%",
          height: "9%",
          clipPath: "ellipse(50% 50% at 50% 50%)",
          background: "radial-gradient(ellipse at 50% 40%, #2a1006 0%, #152510 60%, #0d1a0a 100%)",
          boxShadow: "inset 0 0 10px rgba(0,0,0,0.6)",
        }}
      />

      {/* a brief white flash across the head when reflected fire lands on
          him — a hit reaction rather than the old continuous mouth-fire */}
      {hit && (
        <div
          className="absolute bottom-0 left-1/2 h-[88%] w-full -translate-x-1/2"
          style={{
            clipPath: "ellipse(50% 50% at 50% 100%)",
            background: "#ffffff",
            mixBlendMode: "overlay",
            animation: "toad-hit-flash 380ms ease-out forwards",
          }}
        />
      )}

      {/* two bulging eyes, near the top of the head where they'll read
          clearly above the horizon */}
      <Eye left="32%" dead={dead} />
      <Eye left="68%" dead={dead} />
    </div>
  );
}

function Eye({ left, dead = false }: { left: string; dead?: boolean }) {
  return (
    <div className="absolute -translate-x-1/2" style={{ left, bottom: "58%", width: "19%", height: "19%" }}>
      <div
        className="absolute inset-0"
        style={{
          clipPath: "circle(50% at 50% 50%)",
          background: "radial-gradient(circle at 35% 30%, #e8f2c8 0%, #b8cf7e 55%, #7a9648 100%)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
        }}
      />
      {dead ? (
        // A stunned "X" in place of the normal pupil — the classic
        // cartoon-dead marker.
        <>
          <div
            className="absolute left-1/2 top-1/2 h-[14%] w-[70%] -translate-x-1/2 -translate-y-1/2 rotate-45"
            style={{ background: "#1a1408" }}
          />
          <div
            className="absolute left-1/2 top-1/2 h-[14%] w-[70%] -translate-x-1/2 -translate-y-1/2 -rotate-45"
            style={{ background: "#1a1408" }}
          />
        </>
      ) : (
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: "60%", height: "22%", background: "#1a1408" }}
        />
      )}
    </div>
  );
}
