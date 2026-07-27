"use client";

// Shown once a mission's been completed for good (the snail rescued, the
// knight defeated, the toad beaten back) — pinned to the top of the
// screen rather than tucked into whatever spot the original encounter's
// own start affordance lived, so it reads the same way across every
// mission. Deliberately doesn't jump straight back into the encounter —
// clicking it is expected to bring the same BossFightStartMenu briefing
// back up (see each caller), exactly like the first time through, rather
// than skipping straight past it.
// `align` lets two of these coexist without stacking directly on top of
// each other — the throne room shows one for the knight and one for the
// toad at the same time (defeating the toad requires the knight already
// beaten), so "center" alone isn't enough once both are on screen.
const ALIGN_CLASS: Record<"center" | "left" | "right", string> = {
  center: "left-1/2 -translate-x-1/2",
  left: "left-1/2 -translate-x-[110%]",
  right: "left-1/2 translate-x-[10%]",
};

export function ReplayMissionButton({
  onClick,
  label = "Replay Mission",
  align = "center",
}: {
  onClick: () => void;
  label?: string;
  align?: "center" | "left" | "right";
}) {
  return (
    <button
      onClick={onClick}
      className={`fixed top-8 z-30 touch-manipulation border border-neon-dim px-4 py-1.5 text-[0.6rem] uppercase tracking-[0.3em] text-neon-dim transition-colors hover:text-neon sm:top-10 ${ALIGN_CLASS[align]}`}
    >
      {label}
    </button>
  );
}
