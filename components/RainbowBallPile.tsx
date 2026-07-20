// A little heap of glossy rainbow-colored balls — the crate's reveal
// visual now that it drops a variable quantity of currency instead of
// fixed items. The exact count isn't depicted (it can be in the
// hundreds); this is just "a pile of them".
const PALETTE = ["#ff4d4d", "#ff9f43", "#ffe066", "#6bcf6b", "#4dabf7", "#7c5cff", "#ff6ec7"];

const BALLS = [
  { left: "50%", bottom: "0%", size: 22, color: 0 },
  { left: "28%", bottom: "3%", size: 17, color: 2 },
  { left: "70%", bottom: "2%", size: 18, color: 4 },
  { left: "14%", bottom: "12%", size: 14, color: 5 },
  { left: "42%", bottom: "19%", size: 19, color: 1 },
  { left: "62%", bottom: "17%", size: 15, color: 6 },
  { left: "82%", bottom: "11%", size: 13, color: 3 },
  { left: "6%", bottom: "1%", size: 12, color: 3 },
  { left: "90%", bottom: "0%", size: 13, color: 0 },
  { left: "50%", bottom: "34%", size: 14, color: 2 },
  { left: "34%", bottom: "36%", size: 11, color: 5 },
  { left: "66%", bottom: "35%", size: 12, color: 1 },
];

export function RainbowBallPile() {
  return (
    <div className="relative h-24 w-32">
      {/* soft contact shadow, grounding the pile */}
      <div
        className="absolute -bottom-1 left-1/2 h-3 w-24 -translate-x-1/2"
        style={{
          clipPath: "ellipse(50% 50% at 50% 50%)",
          background: "radial-gradient(closest-side, rgba(0,0,0,0.4), transparent 75%)",
        }}
      />
      {BALLS.map((b, i) => (
        <div
          key={i}
          className="absolute -translate-x-1/2"
          style={{ left: b.left, bottom: b.bottom, width: b.size, height: b.size }}
        >
          <div
            className="absolute inset-0"
            style={{
              clipPath: "circle(50% at 50% 50%)",
              background: `radial-gradient(circle at 32% 28%, #ffffff 0%, ${PALETTE[b.color]} 42%, ${PALETTE[b.color]} 100%)`,
              boxShadow: `0 2px 4px rgba(0,0,0,0.4), 0 0 8px ${PALETTE[b.color]}66`,
            }}
          />
        </div>
      ))}
    </div>
  );
}
