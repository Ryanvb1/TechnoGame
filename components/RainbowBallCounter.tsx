"use client";

import { useEffect, useState } from "react";
import { readRainbowBalls } from "./rainbowBalls";

// Pinned to the corner of the viewport (not the hub grid itself) so it
// reads as a persistent currency counter rather than part of the menu.
export function RainbowBallCounter() {
  // This page is statically generated, so the server/build-time HTML always
  // starts from 0 (no localStorage on the server); this effect syncs in the
  // real value right after mount, same pattern as the rest of the site's
  // progress state.
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage, an external store the server can't see; see comment above.
    setTotal(readRainbowBalls());
  }, []);

  return (
    <div className="fixed left-4 top-4 z-30 flex items-center gap-2 sm:left-8 sm:top-8">
      <div
        className="h-4 w-4 shrink-0"
        style={{
          clipPath: "circle(50% at 50% 50%)",
          background:
            "conic-gradient(from 180deg, #ff4d4d, #ff9f43, #ffe066, #6bcf6b, #4dabf7, #7c5cff, #ff6ec7, #ff4d4d)",
          boxShadow: "0 0 8px rgba(255,255,255,0.45)",
        }}
      />
      <span className="text-xs uppercase tracking-[0.2em] text-neon-dim">
        {total.toLocaleString()}
      </span>
    </div>
  );
}
