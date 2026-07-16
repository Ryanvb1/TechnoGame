const MOUND_CLIP_PATH =
  "polygon(50% 0%, 78% 8%, 94% 28%, 100% 55%, 92% 80%, 70% 100%, 30% 100%, 8% 80%, 0% 55%, 6% 28%, 22% 8%)";

const CROWN_TOP_CLIP_PATH =
  "polygon(0% 100%, 0% 22%, 15% 8%, 30% 20%, 50% 0%, 70% 20%, 85% 8%, 100% 22%, 100% 100%)";

export function Throne() {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ perspective: "1000px", height: 260, width: 300 }}
    >
      {/* ambient glow */}
      <div
        className="absolute h-40 w-40 animate-[fire-glow-pulse_4s_ease-in-out_infinite]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,208,90,0.4), transparent 70%)",
        }}
      />

      {/* the whole scene shares one rotateX so the floor recedes and the
          throne — lifted out on the z-axis — reads as standing on it */}
      <div
        className="relative"
        style={{
          height: 150,
          width: 220,
          transformStyle: "preserve-3d",
          transform: "rotateX(52deg) scale(0.88)",
        }}
      >
        {/* distant gold pile */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: MOUND_CLIP_PATH,
            background:
              "radial-gradient(circle at 50% 25%, #fff2b0 0%, #f6c94c 30%, #c9922a 65%, #7a531a 100%)",
            boxShadow: "0 0 30px rgba(0,0,0,0.5) inset",
          }}
        >
          <div
            className="absolute inset-0 opacity-50"
            style={{
              clipPath: MOUND_CLIP_PATH,
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.4) 0 2px, transparent 3px)",
              backgroundSize: "14px 14px",
            }}
          />
        </div>

        {/* the empty throne, lifted above the pile via translateZ */}
        <div
          className="absolute left-1/2 bottom-[90px]"
          style={{ transform: "translateX(-50%) translateZ(70px)" }}
        >
          <div className="relative flex flex-col items-center">
            <div
              className="h-24 w-16 border-2 border-yellow-600/70"
              style={{
                clipPath: CROWN_TOP_CLIP_PATH,
                background: "linear-gradient(180deg, #6b1530 0%, #3a0a1c 100%)",
                boxShadow: "0 0 18px rgba(250,204,21,0.35)",
              }}
            />
            <div className="relative -mt-2 flex items-end">
              <div className="h-10 w-3 border border-yellow-600/70 bg-gradient-to-b from-yellow-400 to-yellow-700" />
              <div
                className="h-6 w-20 border border-yellow-600/70"
                style={{
                  background: "linear-gradient(180deg, #7a1c3a 0%, #45102a 100%)",
                }}
              />
              <div className="h-10 w-3 border border-yellow-600/70 bg-gradient-to-b from-yellow-400 to-yellow-700" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
