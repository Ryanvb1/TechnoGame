// A simple bronze key silhouette — a hollow ring bow, a shaft, and two
// teeth jutting off it. Used for the cave bear's chest-key drop (see
// inventory.ts) on the victory reveal and in the Locker.
export function KeyIcon({ size = 26, color = "#4ade80" }: { size?: number; color?: string }) {
  const ringSize = size * 0.46;
  const ringBorder = Math.max(2, size * 0.12);
  const shaftWidth = size * 0.14;
  const shaftHeight = size * 0.42;
  const shaftTop = ringSize - ringBorder * 0.4;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* bow — a hollow ring so it reads as a real key rather than a solid blob */}
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2 rounded-full"
        style={{ width: ringSize, height: ringSize, border: `${ringBorder}px solid ${color}`, boxShadow: `0 0 6px ${color}99` }}
      />
      {/* shaft */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{ top: shaftTop, width: shaftWidth, height: shaftHeight, background: color }}
      />
      {/* teeth, jutting off the shaft's right side near its tip */}
      <div
        className="absolute left-1/2"
        style={{ top: shaftTop + shaftHeight * 0.55, width: size * 0.22, height: shaftWidth, background: color }}
      />
      <div
        className="absolute left-1/2"
        style={{ top: shaftTop + shaftHeight - shaftWidth, width: size * 0.3, height: shaftWidth, background: color }}
      />
    </div>
  );
}
