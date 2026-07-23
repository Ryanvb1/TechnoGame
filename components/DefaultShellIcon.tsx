// The same shell shape as RainbowShellIcon, colored with the snail's own
// default (non-equipped) palette (see ScaredSnail.tsx) — lets the Locker
// offer "go back to normal" as a real, visible option alongside actual
// won loot, not just an implicit side effect of unequipping.
export function DefaultShellIcon({ size = 40 }: { size?: number }) {
  return (
    <div
      className="relative"
      style={{
        width: size,
        height: size,
        clipPath: "circle(50% at 50% 50%)",
        background: "repeating-conic-gradient(from -25deg, #e8a659 0deg 20deg, #b9723a 20deg 40deg)",
        boxShadow: "0 3px 6px rgba(0,0,0,0.4), inset 0 0 10px rgba(0,0,0,0.35)",
      }}
    >
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: size * 0.25,
          height: size * 0.25,
          clipPath: "circle(50% at 50% 50%)",
          background: "#7a4423",
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
          background: "rgba(255,255,255,0.32)",
        }}
      />
    </div>
  );
}
