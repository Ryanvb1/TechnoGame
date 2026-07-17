"use client";

import { resetGameProgress } from "./resetProgress";

export function ResetButton() {
  function handleReset() {
    resetGameProgress();
    window.location.reload();
  }

  return (
    <button
      onClick={handleReset}
      className="touch-manipulation transition-colors hover:text-neon"
    >
      Reset
    </button>
  );
}
