// A chunky trophy necklace: individually suggested gold links converge on
// a faceted, creature-colored pendant rather than reading like a badge.
export function NecklaceIcon({ color, size = 40 }: { color: string; size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 48 48" aria-hidden="true">
        <path
          d="M5 5 C6 23 14 34 24 36 C34 34 42 23 43 5"
          fill="none"
          stroke="rgba(32,24,15,0.8)"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <path
          d="M5 5 C6 23 14 34 24 36 C34 34 42 23 43 5"
          fill="none"
          stroke="#e4c86e"
          strokeWidth="2.4"
          strokeDasharray="2.2 2"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 2px rgba(255,221,112,0.8))" }}
        />
        <path
          d="M5 5 C14 0 34 0 43 5"
          fill="none"
          stroke="rgba(32,24,15,0.8)"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <path
          d="M5 5 C14 0 34 0 43 5"
          fill="none"
          stroke="#c9ad58"
          strokeWidth="2.2"
          strokeDasharray="2.2 2"
          strokeLinecap="round"
          opacity="0.78"
        />
        <circle cx="24" cy="1.8" r="2.1" fill="#f5dc82" stroke="#6b5427" strokeWidth="1" />
      </svg>
      <div
        className="absolute bottom-0 left-1/2 h-[40%] w-[42%] -translate-x-1/2"
        style={{
          clipPath: "polygon(50% 0%, 92% 24%, 82% 78%, 50% 100%, 18% 78%, 8% 24%)",
          background: `linear-gradient(135deg, #ffffff 0%, ${color} 28%, ${color} 62%, #17110c 100%)`,
          boxShadow: `0 0 ${Math.max(4, size * 0.18)}px ${color}99`,
        }}
      >
        <div
          className="absolute inset-[24%]"
          style={{
            clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
            background: "rgba(255,255,255,0.65)",
            boxShadow: `0 0 ${Math.max(2, size * 0.08)}px ${color}`,
          }}
        />
        <div
          className="absolute left-[22%] top-[16%] h-[16%] w-[28%]"
          style={{
            clipPath: "polygon(0% 50%, 100% 0%, 70% 100%)",
            background: "rgba(255,255,255,0.75)",
          }}
        />
      </div>
    </div>
  );
}
