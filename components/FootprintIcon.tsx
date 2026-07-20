// The glowing footprint used by both the hub's page-transition trail and
// any other in-scene "someone walked here" effect. Color is overridable so
// a purchased footstep dye (see footstepColor.ts) actually changes it.
export function FootprintIcon({ color = "var(--neon)" }: { color?: string }) {
  return (
    <svg
      width="16"
      height="26"
      viewBox="0 0 16 26"
      fill="none"
      style={{
        filter: `drop-shadow(0 0 5px ${color}) drop-shadow(0 0 12px ${color})`,
      }}
    >
      <ellipse cx="8" cy="7" rx="6" ry="7" fill={color} />
      <ellipse cx="8" cy="19" rx="5" ry="6" fill={color} />
    </svg>
  );
}
