export function SolidShellIcon({
  color,
  size = 40,
}: {
  color: "black" | "white";
  size?: number;
}) {
  const dark = color === "black";
  return (
    <div
      className="relative"
      style={{
        width: size,
        height: size,
        clipPath: "circle(50% at 50% 50%)",
        background: dark
          ? "repeating-conic-gradient(from -25deg, #303235 0deg 22deg, #050607 22deg 44deg)"
          : "repeating-conic-gradient(from -25deg, #ffffff 0deg 22deg, #cfd3d7 22deg 44deg)",
        boxShadow: dark
          ? "0 2px 6px rgba(0,0,0,0.7), inset 0 0 9px #000"
          : "0 2px 6px rgba(0,0,0,0.35), inset 0 0 8px rgba(95,105,115,0.35)",
      }}
    >
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: size * 0.25,
          height: size * 0.25,
          clipPath: "circle(50% at 50% 50%)",
          background: dark ? "#000" : "#737b82",
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
          background: dark ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.7)",
        }}
      />
    </div>
  );
}
