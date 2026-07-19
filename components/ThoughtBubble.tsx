// A cloud-shaped speech/thought bubble — off-white with dark text and a
// trail of shrinking circles pointing down at whoever is "speaking",
// instead of the site's usual neon-bordered dark box. Built with
// clip-path rather than border-radius, since the global reset in
// globals.css forces every border-radius to 0.
const BUBBLE_CLIP_PATH =
  "polygon(6% 22%, 11% 6%, 26% 0%, 74% 0%, 89% 6%, 94% 22%, 100% 46%, 96% 74%, 88% 95%, 70% 100%, 30% 100%, 12% 95%, 4% 74%, 0% 46%)";

export function ThoughtBubble({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      {/* cloud puffs along the top edge, overlapping the body so the seam
          doesn't show */}
      <div
        className="absolute -top-1.5 left-[14%] h-3 w-3"
        style={{ clipPath: "circle(50% at 50% 50%)", background: "#fbf8ee" }}
      />
      <div
        className="absolute -top-2.5 left-[38%] h-4 w-4"
        style={{ clipPath: "circle(50% at 50% 50%)", background: "#fbf8ee" }}
      />
      <div
        className="absolute -top-2 right-[16%] h-3.5 w-3.5"
        style={{ clipPath: "circle(50% at 50% 50%)", background: "#fbf8ee" }}
      />

      <div
        className="relative px-4 py-3 text-center text-xs font-medium text-[#241f16]"
        style={{
          clipPath: BUBBLE_CLIP_PATH,
          background: "#fbf8ee",
          boxShadow: "inset 0 0 0 1.5px rgba(36,31,22,0.15), 0 4px 14px rgba(0,0,0,0.4)",
        }}
      >
        {children}
      </div>

      {/* trailing circles, shrinking down toward the speaker's head */}
      <div
        className="absolute left-[36%] h-2.5 w-2.5"
        style={{ top: "100%", marginTop: 2, clipPath: "circle(50% at 50% 50%)", background: "#fbf8ee" }}
      />
      <div
        className="absolute left-[30%] h-[7px] w-[7px]"
        style={{ top: "100%", marginTop: 11, clipPath: "circle(50% at 50% 50%)", background: "#fbf8ee" }}
      />
    </div>
  );
}
