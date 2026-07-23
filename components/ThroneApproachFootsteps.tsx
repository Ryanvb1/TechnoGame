"use client";

import { useEffect } from "react";
import { FootprintIcon } from "./FootprintIcon";
import { readFootstepColor } from "./footstepColor";

const STEP_COUNT = 7;
// A deliberate gap between each print rather than a walking pace.
const STEP_STAGGER_MS = 667;
const STEP_FADE_MS = 933;
export const APPROACH_TOTAL_MS = (STEP_COUNT - 1) * STEP_STAGGER_MS + STEP_FADE_MS;

const STEP_OFFSET = 9; // px each print alternates side to side (left/right foot)
// The trail stops at the base of the gold pile rather than climbing all
// the way up onto the throne itself.
const PATH_END_PERCENT = 38;

// A one-shot trail of footprints walking from the viewer's position up to
// the throne, in the same glowing style as the hub's page-transition trail
// — but staged within the scene itself rather than tied to a route change.
export function ThroneApproachFootsteps({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onComplete, APPROACH_TOTAL_MS);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  const color = readFootstepColor();

  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      {Array.from({ length: STEP_COUNT }).map((_, i) => {
        const progress = i / (STEP_COUNT - 1);
        const bottomPercent = 4 + progress * (PATH_END_PERCENT - 4);
        const perp = (i % 2 === 0 ? -1 : 1) * STEP_OFFSET;
        const delay = i * STEP_STAGGER_MS;

        return (
          <div
            key={i}
            className="absolute left-1/2"
            style={{
              bottom: `${bottomPercent}%`,
              transform: `translate(-50%, 0) translateX(${perp}px)`,
            }}
          >
            <div style={{ animation: `footstep-fade ${STEP_FADE_MS}ms ease-out ${delay}ms both` }}>
              <FootprintIcon color={color} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
