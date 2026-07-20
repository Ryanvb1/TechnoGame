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

export function ToadBoss({ fireBreathing = false }: { fireBreathing?: boolean }) {
  return (
    <div
      className="pointer-events-none absolute left-1/2 origin-bottom -translate-x-1/2"
      style={{
        bottom: "70%",
        width: "min(320px, 46vw)",
        height: "26vh",
        animation: "toad-rise 4.5s cubic-bezier(0.22, 1, 0.36, 1) both",
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

      {/* wide mouth, low enough to sit right around/below the horizon */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: "30%",
          width: "48%",
          height: "3%",
          clipPath: "polygon(0% 40%, 15% 0%, 85% 0%, 100% 40%, 85% 100%, 15% 100%)",
          background: "#152510",
        }}
      />

      {/* fire breath, flickering from the mouth once he's been hit —
          reuses the same fire-flicker keyframe as the hall's torches */}
      {fireBreathing && (
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ bottom: "29%", width: "22%", height: "16%" }}
        >
          <div
            className="absolute inset-0"
            style={{
              clipPath: "polygon(50% 0%, 90% 55%, 68% 55%, 100% 100%, 0% 100%, 32% 55%, 10% 55%)",
              background: "linear-gradient(to bottom, #ffe9a0 0%, #ff9a2e 45%, #d94a12 100%)",
              boxShadow: "0 0 18px rgba(255,140,20,0.9), 0 0 34px rgba(255,90,20,0.6)",
              animationName: "fire-flicker",
              animationDuration: "0.4s",
              animationTimingFunction: "ease-in-out",
              animationIterationCount: "infinite",
            }}
          />
        </div>
      )}

      {/* two bulging eyes, near the top of the head where they'll read
          clearly above the horizon */}
      <Eye left="32%" />
      <Eye left="68%" />
    </div>
  );
}

function Eye({ left }: { left: string }) {
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
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: "60%", height: "22%", background: "#1a1408" }}
      />
    </div>
  );
}
