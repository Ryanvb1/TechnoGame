"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GNOME_MAX_ORBS, readGnomeOrbs } from "./gnomeProgress";
import { KnightFigure } from "./KnightFigure";

type Stage = "idle" | "challenge";

export function Knight() {
  const [visible] = useState(() => readGnomeOrbs() >= GNOME_MAX_ORBS);
  const [stage, setStage] = useState<Stage>("idle");
  const router = useRouter();

  if (!visible) return null;

  function handleClick() {
    if (stage !== "idle") return;
    setStage("challenge");
  }

  return (
    <div className="relative flex flex-col items-center">
      {stage === "challenge" && (
        <div className="absolute bottom-full mb-4 w-64 border border-neon-dim bg-background/95 px-4 py-3 text-center text-xs text-foreground shadow-[0_0_15px_var(--neon-dim)]">
          <div className="flex flex-col gap-3">
            <p>You are a strong warrior, but the throne must be won.</p>
            <div className="flex justify-center gap-6">
              <button
                onClick={() => router.push("/throne-room/fight")}
                className="touch-manipulation uppercase tracking-[0.15em] text-neon transition-colors hover:text-white"
              >
                Begin Fight
              </button>
              <button
                onClick={() => setStage("idle")}
                className="touch-manipulation uppercase tracking-[0.15em] text-neon-dim transition-colors hover:text-neon"
              >
                Retreat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* button is wider than the armor so the sword — nested in a wrapper
          matching the torso's footprint, reaching up to 80px past that
          wrapper's edge for the hilt — has enough centered margin to stay
          inside the clickable/tappable hit area */}
      <button
        onClick={handleClick}
        aria-label="Speak with the knight"
        className="group relative flex touch-manipulation flex-col items-center outline-none"
        style={{ minWidth: 290 }}
      >
        <KnightFigure />
      </button>
    </div>
  );
}
