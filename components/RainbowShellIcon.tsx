// The same shell shape as the snail's own (see ScaredSnail.tsx), swapped
// to the exact rainbow sweep used everywhere else on the site the
// currency shows up (RainbowBallCounter, the crate's own reward orbs) —
// so "rainbow" reads as the same rainbow throughout, not a new palette.
export function RainbowShellIcon({ size = 40 }: { size?: number }) {
  return (
    <div
      className="relative"
      style={{
        width: size,
        height: size,
        clipPath: "circle(50% at 50% 50%)",
        background: "conic-gradient(from 180deg, #ff4d4d, #ff9f43, #ffe066, #6bcf6b, #4dabf7, #7c5cff, #ff6ec7, #ff4d4d)",
        boxShadow: "0 3px 6px rgba(0,0,0,0.4), inset 0 0 10px rgba(0,0,0,0.35)",
      }}
    >
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: size * 0.25,
          height: size * 0.25,
          clipPath: "circle(50% at 50% 50%)",
          background: "#20141f",
        }}
      />
      <div
        className="absolute"
        style={{
          left: size * 0.2,
          top: size * 0.16,
          width: size * 0.3,
          height: size * 0.3,
          clipPath: "circle(55% at 30% 30%)",
          background: "rgba(255,255,255,0.35)",
        }}
      />
    </div>
  );
}
