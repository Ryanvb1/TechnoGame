// A generic ribboned medal, recolored per boss creature — the shared
// "you defeated this thing" trophy each boss drops (see inventory.ts),
// shown in the Locker (and on the victory chest reveal) alongside whatever
// other specific loot that boss also grants.
export function BadgeIcon({ color, size = 40 }: { color: string; size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div
        className="absolute left-[24%] top-0 h-[42%] w-[16%]"
        style={{
          background: color,
          opacity: 0.75,
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 50% 72%, 0% 100%)",
        }}
      />
      <div
        className="absolute right-[24%] top-0 h-[42%] w-[16%]"
        style={{
          background: color,
          opacity: 0.75,
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 50% 72%, 0% 100%)",
        }}
      />
      <div
        className="absolute bottom-0 left-1/2 h-[64%] w-[64%] -translate-x-1/2"
        style={{
          clipPath: "circle(50% at 50% 50%)",
          background: `radial-gradient(circle at 35% 30%, #ffffff 0%, ${color} 45%, rgba(0,0,0,0.4) 100%)`,
          boxShadow: `0 0 8px ${color}99`,
        }}
      >
        <div className="absolute inset-[18%]" style={{ clipPath: "circle(50% at 50% 50%)", border: "2px solid rgba(255,255,255,0.5)" }} />
      </div>
    </div>
  );
}
