"use client";

// Sits quietly in the gold pile at all times, blending into its tones,
// until the toad rises — then it wiggles and picks up a white outline as
// an affordance that it's the thing to click. Clicking it throws it (an
// arc/tumble/fade) into the toad's mouth instead of just vanishing.
export function Molotov({
  active,
  thrown,
  onClick,
}: {
  active: boolean;
  thrown: boolean;
  onClick: () => void;
}) {
  const interactive = active && !thrown;

  return (
    <div className="absolute" style={{ left: "27%", bottom: "33%", width: 24, height: 38 }}>
      <button
        onClick={interactive ? onClick : undefined}
        aria-label="Molotov cocktail"
        disabled={!interactive}
        className={`relative block h-full w-full touch-manipulation outline-none ${
          interactive ? "cursor-pointer" : "pointer-events-none"
        }`}
      >
        <div
          className={`relative h-full w-full ${interactive ? "animate-[molotov-wiggle_0.6s_ease-in-out_infinite]" : ""}`}
          style={{
            filter: interactive
              ? "drop-shadow(0 0 1.5px #fff) drop-shadow(0 0 1.5px #fff) drop-shadow(0 0 5px rgba(255,255,255,0.8))"
              : "none",
            animation: thrown ? "molotov-throw 550ms ease-in forwards" : undefined,
          }}
        >
          {/* rag */}
          <div className="absolute left-1/2 top-0 h-3 w-2 -translate-x-1/2 -rotate-[18deg] bg-[#e8ddc0]" />
          {/* neck */}
          <div className="absolute left-1/2 top-[9px] h-3 w-[6px] -translate-x-1/2 bg-[#3a4a34]" />
          {/* body */}
          <div
            className="absolute bottom-0 left-1/2 h-[22px] w-[18px] -translate-x-1/2"
            style={{
              clipPath: "polygon(30% 0%, 70% 0%, 100% 28%, 100% 100%, 0% 100%, 0% 28%)",
              background: "linear-gradient(180deg, #4a5c3e 0%, #2a3722 100%)",
            }}
          />
        </div>
      </button>
    </div>
  );
}
