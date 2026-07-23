"use client";

// Shown once a mission's been completed for good (the snail rescued, the
// knight defeated, the toad beaten back) — pinned to the top of the
// screen rather than tucked into whatever spot the original encounter's
// own start affordance lived, so it reads the same way across every
// mission. Deliberately doesn't jump straight back into the encounter —
// clicking it is expected to bring the same BossFightStartMenu briefing
// back up (see each caller), exactly like the first time through, rather
// than skipping straight past it.
export function ReplayMissionButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed top-8 left-1/2 z-30 -translate-x-1/2 touch-manipulation border border-neon-dim px-4 py-1.5 text-[0.6rem] uppercase tracking-[0.3em] text-neon-dim transition-colors hover:text-neon sm:top-10"
    >
      Replay Mission
    </button>
  );
}
