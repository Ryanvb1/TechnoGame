"use client";

import { useEffect, useRef } from "react";

// The first global (window-level) keydown listener in this codebase —
// every other keyboard handler here is scoped to a focused div/button
// (FightScene's arrow-key beam nudge, SnailRescueRope's hold-to-charge).
// A grid-movement mechanic needs to work regardless of DOM focus, so this
// listens on window instead, following the same mount/cleanup idiom as
// the game's other window listeners (HomeSnail/Gnome's custom-event
// listeners) just with raw keyboard events.
//
// `enabled` is read through a ref inside the handler rather than gating
// whether the listener itself is attached, so a keystroke landing right
// at a survival/damage stage boundary is never silently dropped by a
// listener that's mid-teardown.
export function useCaveBearControls({
  enabled,
  onMoveCol,
  onMoveRow,
  onJump,
}: {
  enabled: boolean;
  onMoveCol: (delta: -1 | 1) => void;
  onMoveRow: (delta: -1 | 1) => void;
  onJump: () => void;
}) {
  const enabledRef = useRef(enabled);
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const handlersRef = useRef({ onMoveCol, onMoveRow, onJump });
  useEffect(() => {
    handlersRef.current = { onMoveCol, onMoveRow, onJump };
  }, [onMoveCol, onMoveRow, onJump]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!enabledRef.current) return;
      const { onMoveCol, onMoveRow, onJump } = handlersRef.current;
      switch (e.key.toLowerCase()) {
        case "a":
          e.preventDefault();
          onMoveCol(-1);
          break;
        case "d":
          e.preventDefault();
          onMoveCol(1);
          break;
        case "w":
          e.preventDefault();
          onMoveRow(-1);
          break;
        case "s":
          e.preventDefault();
          onMoveRow(1);
          break;
        case " ":
          e.preventDefault();
          // OS key-repeat guard, same intent as SnailRescueRope's e.repeat
          // check — a held Space shouldn't queue up multiple jumps.
          if (!e.repeat) onJump();
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
