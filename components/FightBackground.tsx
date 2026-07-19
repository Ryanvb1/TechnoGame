// A simple dusk arena backdrop for the fight screen: a stone floor strip
// under a dark sky, flanked by torches — deliberately plainer than the
// throne hall itself since this is a v1 placeholder for the fight system.
export function FightBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, #0a0608 0%, #1a0e12 45%, #2a1418 100%)" }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[36%]"
        style={{ background: "linear-gradient(180deg, #241a16 0%, #120b09 100%)" }}
      />
      <div
        className="absolute inset-x-0 opacity-30"
        style={{
          bottom: 0,
          height: "36%",
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(0,0,0,0.4) 0 2px, transparent 2px 64px)",
        }}
      />
      <div
        className="absolute inset-x-0"
        style={{
          bottom: "36%",
          height: 2,
          background: "linear-gradient(90deg, transparent, rgba(255,140,20,0.5), transparent)",
        }}
      />
      <Torch className="left-[6%] sm:left-[10%]" />
      <Torch className="right-[6%] sm:right-[10%]" />
    </div>
  );
}

function Torch({ className }: { className: string }) {
  return (
    <div className={`absolute bottom-[36%] ${className}`}>
      <div style={{ width: 4, height: 60, background: "#2a1c10", margin: "0 auto" }} />
      <div
        className="absolute -top-3 left-1/2 h-5 w-4 -translate-x-1/2"
        style={{
          clipPath: "polygon(50% 0%, 90% 60%, 50% 100%, 10% 60%)",
          background: "linear-gradient(to top, #ff6a12, #ffd27a)",
          boxShadow: "0 0 16px rgba(255,140,20,0.85)",
          animationName: "fire-flicker",
          animationDuration: "1s",
          animationTimingFunction: "ease-in-out",
          animationIterationCount: "infinite",
        }}
      />
    </div>
  );
}
