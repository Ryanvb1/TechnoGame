// The same rainbow sweep used everywhere else the site's currency shows
// up (RainbowBallCounter, RainbowShellIcon) — his default shell, once the
// Rainbow Shell from the toad fight is equipped (see inventory.ts,
// Locker.tsx), is styled to match rather than invent a second "rainbow".
const RAINBOW_SHELL_BACKGROUND =
  "conic-gradient(from 180deg, #ff4d4d, #ff9f43, #ffe066, #6bcf6b, #4dabf7, #7c5cff, #ff6ec7, #ff4d4d)";

// A cheerful cartoon snail (think Snail Bob), seen from the side so the
// shell + elongated body read clearly as a snail. `fear` (0 = safe,
// 1 = terrified) drives the pupils and mouth curve mainly, plus a slight
// nervous shake once he's close to the flames.
export function ScaredSnail({
  fear,
  rainbowShell = false,
  shellStyle = "default",
  necklaceColor,
}: {
  fear: number;
  rainbowShell?: boolean;
  shellStyle?: "default" | "rainbow" | "black" | "white";
  necklaceColor?: string | null;
}) {
  const pupilScale = 0.8 + fear * 0.45;
  const isScared = fear > 0.5;
  const shiver = fear > 0.75;
  const activeShell = rainbowShell ? "rainbow" : shellStyle;
  const shellBackground =
    activeShell === "rainbow"
      ? RAINBOW_SHELL_BACKGROUND
      : activeShell === "black"
        ? "repeating-conic-gradient(from -25deg, #303235 0deg 22deg, #050607 22deg 44deg)"
        : activeShell === "white"
          ? "repeating-conic-gradient(from -25deg, #ffffff 0deg 22deg, #cfd3d7 22deg 44deg)"
          : "repeating-conic-gradient(from -25deg, #e8a659 0deg 20deg, #b9723a 20deg 40deg)";
  const shellCenter =
    activeShell === "rainbow"
      ? "#20141f"
      : activeShell === "black"
        ? "#000"
        : activeShell === "white"
          ? "#737b82"
          : "#7a4423";

  return (
    <div
      className={`relative ${shiver ? "animate-[snail-shiver_0.2s_ease-in-out_infinite]" : ""}`}
      style={{ width: 78, height: 42 }}
    >
      {/* body/foot, a low arc from the tail (under the shell) to the head */}
      <div
        className="absolute bottom-0 left-0 h-6 w-16"
        style={{
          clipPath: "polygon(0% 55%, 8% 18%, 26% 0%, 68% 0%, 90% 14%, 100% 52%, 88% 100%, 10% 100%)",
          background: "linear-gradient(180deg, #cdeaa0 0%, #9fc96e 55%, #7aa84e 100%)",
          boxShadow: "0 2px 4px rgba(0,0,0,0.35)",
        }}
      />

      {/* shell, resting on the back half of the body */}
      <div
        data-snail-shell={activeShell}
        className="absolute left-0 top-0 h-10 w-10"
        style={{
          clipPath: "circle(50% at 50% 50%)",
          background: shellBackground,
          boxShadow: "0 3px 6px rgba(0,0,0,0.4), inset 0 0 10px rgba(0,0,0,0.35)",
        }}
      >
        <div
          className="absolute left-1/2 top-1/2 h-[10px] w-[10px] -translate-x-1/2 -translate-y-1/2"
          style={{ clipPath: "circle(50% at 50% 50%)", background: shellCenter }}
        />
        <div
          className="absolute left-[20%] top-[16%] h-3 w-4"
          style={{ clipPath: "circle(55% at 30% 30%)", background: "rgba(255,255,255,0.32)" }}
        />
      </div>

      {/* head, at the front tip, facing away from the shell */}
      <div className="absolute bottom-[6px] right-0 h-6 w-6">
        {/* back stalk — shorter, sits slightly behind, a subtle depth cue */}
        <div className="absolute right-[9px] -top-3 h-4 w-[3px] rotate-[10deg] bg-gradient-to-b from-[#8fb85a] to-[#6a9142]">
          <div
            className="absolute -top-1.5 left-1/2 h-[7px] w-[7px] -translate-x-1/2"
            style={{ clipPath: "circle(50% at 50% 50%)", background: "#e8ecdf" }}
          >
            <div
              className="absolute left-1/2 top-1/2 h-[4px] w-[4px] -translate-x-1/2 -translate-y-1/2 transition-transform"
              style={{ clipPath: "circle(50% at 50% 50%)", background: "#20180f", transform: `scale(${pupilScale})` }}
            />
          </div>
        </div>
        {/* front stalk — taller, the main visible eye */}
        <div className="absolute right-0 -top-4 h-5 w-[3px] rotate-[16deg] bg-gradient-to-b from-[#8fb85a] to-[#6a9142]">
          <div
            className="absolute -top-2 left-1/2 h-[11px] w-[11px] -translate-x-1/2"
            style={{ clipPath: "circle(50% at 50% 50%)", background: "#fbfbf2", boxShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
          >
            <div
              className="absolute left-1/2 top-1/2 h-[6px] w-[6px] -translate-x-1/2 -translate-y-1/2 transition-transform"
              style={{ clipPath: "circle(50% at 50% 50%)", background: "#20180f", transform: `scale(${pupilScale})` }}
            />
            <div
              className="absolute left-[62%] top-[16%] h-[2px] w-[2px]"
              style={{ clipPath: "circle(50% at 50% 50%)", background: "rgba(255,255,255,0.9)" }}
            />
          </div>
        </div>

        {/* head blob, connecting the stalks down to the body, with the
            mouth on its front-facing tip */}
        <div
          className="absolute bottom-0 right-0 h-4 w-5"
          style={{
            clipPath: "circle(58% at 65% 55%)",
            background: "linear-gradient(180deg, #cdeaa0 0%, #9fc96e 60%, #7aa84e 100%)",
          }}
        >
          <div
            className="absolute right-[1px] top-1/2 h-[2px] w-[7px] -translate-y-1/2"
            style={{
              background: "#5c3a2a",
              transformOrigin: "left center",
              transform: `rotate(${isScared ? 22 : -22}deg)`,
            }}
          />
        </div>
      </div>

      {necklaceColor && (
        <div
          data-snail-necklace={necklaceColor}
          aria-hidden="true"
          className="absolute -bottom-[3px] right-[11px] z-10 h-[30px] w-[27px]"
          style={{ transform: "rotate(-13deg)", transformOrigin: "50% 12%" }}
        >
          <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 31 31">
            {/* Dark under-stroke keeps the chain legible against the pale
                green neck; the dashed gold stroke reads as actual links. */}
            <path
              d="M8 4 C9 16 12 22 16 24 C20 22 22 16 23 5"
              fill="none"
              stroke="rgba(37,27,15,0.8)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M8 4 C9 16 12 22 16 24 C20 22 22 16 23 5"
              fill="none"
              stroke="#e4c86e"
              strokeWidth="1.8"
              strokeDasharray="1.5 1.35"
              strokeLinecap="round"
              style={{ filter: "drop-shadow(0 0 1.5px rgba(255,222,112,0.9))" }}
            />
            {/* The dimmer upper arc is the rear half of the necklace,
                connecting both hanging sides behind the neck. */}
            <path
              d="M8 4 C12 1.5 19 1.5 23 5"
              fill="none"
              stroke="rgba(37,27,15,0.8)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M8 4 C12 1.5 19 1.5 23 5"
              fill="none"
              stroke="#c9ad58"
              strokeWidth="1.7"
              strokeDasharray="1.5 1.35"
              strokeLinecap="round"
              opacity="0.78"
            />
            <circle cx="15.5" cy="2.1" r="1.6" fill="#f5dc82" stroke="#6b5427" strokeWidth="0.8" />
          </svg>
          <div
            className="absolute bottom-0 left-[10px] h-[13px] w-[13px]"
            style={{
              clipPath: "polygon(50% 0%, 92% 24%, 82% 78%, 50% 100%, 18% 78%, 8% 24%)",
              background: `linear-gradient(135deg, #fff 0%, ${necklaceColor} 32%, ${necklaceColor} 62%, #17110c 100%)`,
              boxShadow: `0 0 7px ${necklaceColor}`,
            }}
          >
            <div
              className="absolute inset-[28%]"
              style={{
                clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                background: "rgba(255,255,255,0.72)",
              }}
            />
            <div
              className="absolute left-[18%] top-[13%] h-[2px] w-[4px] rotate-[-20deg]"
              style={{ background: "rgba(255,255,255,0.9)" }}
            />
          </div>
        </div>
      )}

      {/* soft contact shadow, grounding him on the ledge he sits on */}
      <div
        className="absolute -bottom-1 left-2 h-1 w-14"
        style={{ background: "rgba(0,0,0,0.28)", clipPath: "ellipse(50% 50% at 50% 50%)" }}
      />
    </div>
  );
}
