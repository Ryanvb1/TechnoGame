"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, MouseEvent } from "react";
import { collectOrb, readOrbCollected, readOrbMissionStarted, type OrbId } from "./gnomeProgress";
import { useSoundEffects } from "./MusicProvider";

const REVEAL_MS = 350;
const COLLECT_MS = 400;

type Phase = "hidden" | "revealing" | "collecting";

// One of the orbs scattered across the site for the gnome's "Collect Orbs"
// bounty (see Gnome.tsx) — styled in the exact blue of his progress tube so
// a found one visibly reads as "this feeds that". Like every other mission
// on the site, none of these physically exist in the world until the
// bounty's actually been accepted from the gnome — hence the
// mission-started check below, alongside the usual "already collected"
// one. This page is statically generated, so the server/build-time HTML
// always has to assume neither is true yet (no localStorage on the
// server); the effect below syncs in the real values right after mount,
// same pattern as the rest of the site's progress state.
//
// This renders nothing but the orb itself — it's meant to be dropped
// inside an existing scene prop (the cave mound, the locked chest, the
// fairytale cottage, the fire pit's ground) *before* whatever part of that
// prop should cover it, so plain DOM stacking order does the "half
// hidden" work rather than this component drawing its own occluder.
// `style` positions it (absolute, relative to that prop's own
// position:relative container). Clicking it pops it fully into view, then
// zooms it away as if collected; only once that whole beat finishes does
// it actually register as collected and disappear for good.
//
// A clickable div (role="button"), not an actual <button> — several of
// its hosts (Cave, Airport, LockedChest) are themselves one big <button>
// covering their whole scene, and a nested <button> inside a <button> is
// invalid HTML that Next.js flags as a hydration error.
export function CollectibleOrb({ id, style }: { id: OrbId; style?: CSSProperties }) {
  const playSound = useSoundEffects();
  const [collected, setCollected] = useState(false);
  const [missionStarted, setMissionStarted] = useState(false);
  const [phase, setPhase] = useState<Phase>("hidden");
  const timers = useRef<number[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage, an external store the server can't see; see comment above.
    setCollected(readOrbCollected(id));
    setMissionStarted(readOrbMissionStarted());
  }, [id]);

  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps -- reads the ref's value at unmount time, not a snapshot from mount; see the same pattern in SnailRescueRope.
      timers.current.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  if (!missionStarted || collected) return null;

  function collect(e: MouseEvent | KeyboardEvent) {
    // Stops this from also triggering whatever host prop it's nested
    // inside (Cave/Airport/LockedChest's own "Locked" click handler).
    e.stopPropagation();
    if (phase !== "hidden") return;
    playSound("reward");
    setPhase("revealing");
    timers.current.push(
      window.setTimeout(() => {
        setPhase("collecting");
        timers.current.push(
          window.setTimeout(() => {
            collectOrb(id);
            setCollected(true);
          }, COLLECT_MS)
        );
      }, REVEAL_MS)
    );
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key !== " " && e.key !== "Enter") return;
    e.preventDefault();
    collect(e);
  }

  const transform =
    phase === "hidden" ? "translateY(0) scale(1)" : phase === "revealing" ? "translateY(-10px) scale(1.15)" : "translateY(-32px) scale(0)";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={collect}
      onKeyDown={handleKeyDown}
      aria-label="A glinting orb"
      data-sfx="none"
      className="group pointer-events-auto absolute h-4 w-4 touch-manipulation outline-none"
      style={{
        ...style,
        transform,
        opacity: phase === "collecting" ? 0 : 1,
        transition: `transform ${phase === "collecting" ? COLLECT_MS : REVEAL_MS}ms ease-out, opacity ${COLLECT_MS}ms ease-out`,
      }}
    >
      <div
        className="h-full w-full animate-[fire-glow-pulse_2.6s_ease-in-out_infinite] transition-transform duration-200 group-hover:scale-125"
        style={{
          clipPath: "circle(50% at 50% 50%)",
          background: "linear-gradient(180deg, #7dd3fc 0%, #0ea5e9 100%)",
          boxShadow: "0 0 10px rgba(56,189,248,0.8), 0 0 20px rgba(56,189,248,0.5)",
        }}
      />
    </div>
  );
}
