"use client";

import type { MouseEvent, ReactNode } from "react";
import Link from "next/link";
import { type Direction } from "./directions";
import { useSceneTravel } from "./PageTransition";
import { LockOutline } from "./LockOutline";

const GRID_AREA: Record<Direction, string> = {
  up: "up",
  down: "down",
  left: "left",
  right: "right",
};

// Below sm, every label sits centered under its icon so nothing can run off
// the narrow viewport edge. At sm+ left/right labels move out to the side.
const LABEL_CLASS: Record<Direction, string> = {
  up: "-top-6 left-1/2 -translate-x-1/2 sm:-top-8",
  down: "-bottom-6 left-1/2 -translate-x-1/2 sm:-bottom-8",
  left: "top-full left-1/2 mt-2 -translate-x-1/2 sm:top-1/2 sm:left-auto sm:-left-4 sm:mt-0 sm:-translate-x-full sm:-translate-y-1/2",
  right: "top-full left-1/2 mt-2 -translate-x-1/2 sm:top-1/2 sm:left-auto sm:-right-4 sm:mt-0 sm:translate-x-full sm:-translate-y-1/2",
};

// A small scene prop reflecting each destination — the same idea as the
// Cave/Airport props elsewhere on the hub — instead of a plain directional
// arrow. Direction still doubles as which destination this is (this
// component is only ever used for these four), so the icon can just be
// keyed off it directly.
const DESTINATION_ICON: Record<Direction, ReactNode> = {
  up: <ThroneIcon />,
  right: <KioskIcon />,
  down: <PitIcon />,
  left: <FairylandIcon />,
};

export function ArrowButton({
  direction,
  href,
  label,
  disabled = false,
}: {
  direction: Direction;
  href: string;
  label: string;
  disabled?: boolean;
}) {
  const travel = useSceneTravel();

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    if (disabled) {
      e.preventDefault();
      return;
    }
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    e.preventDefault();
    travel(direction, href);
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : undefined}
      style={{ gridArea: GRID_AREA[direction] }}
      className={`group relative flex touch-manipulation items-center justify-center outline-none ${
        disabled ? "cursor-not-allowed" : ""
      }`}
    >
      {/* red when locked, green when available — the same signal at a
          glance regardless of what's actually drawn inside (see
          LockOutline, shared with every other hub destination) */}
      <LockOutline
        unlocked={!disabled}
        className={`h-14 w-14 sm:h-16 sm:w-16 ${disabled ? "opacity-50" : ""}`}
      >
        {DESTINATION_ICON[direction]}
      </LockOutline>
      <span
        className={`absolute whitespace-nowrap text-xs uppercase tracking-[0.3em] transition-colors duration-200 sm:text-sm ${LABEL_CLASS[direction]} ${
          disabled
            ? "text-neon-dim/35"
            : "text-neon-dim group-hover:text-neon group-focus-visible:text-neon"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}

// Throne Room — the same crown resting on the actual throne (see
// Throne.tsx's own CROWN_CLIP_PATH), just standalone.
function ThroneIcon() {
  return (
    <div
      className="h-5 w-8 sm:h-6 sm:w-10"
      style={{
        clipPath: "polygon(0% 100%, 0% 45%, 18% 70%, 32% 15%, 50% 55%, 68% 15%, 82% 70%, 100% 45%, 100% 100%)",
        background: "linear-gradient(180deg,#ffe08a,#caa243)",
        boxShadow: "0 0 8px rgba(250,204,21,0.6)",
      }}
    />
  );
}

// Kiosk — a miniature of the vending machine on that page: a dark cabinet,
// a window of little wares, a coin slot.
function KioskIcon() {
  const dots = ["#ff4d4d", "#4dabf7", "#ffe066", "#6bcf6b"];
  return (
    <div
      className="relative h-8 w-6 sm:h-9 sm:w-7"
      style={{ background: "linear-gradient(180deg,#3a4044,#20242a)", border: "1px solid rgba(255,255,255,0.15)" }}
    >
      <div className="absolute inset-x-1 top-1 grid grid-cols-2 gap-[2px]">
        {dots.map((c, i) => (
          <div key={i} className="h-1 w-1" style={{ background: c, clipPath: "circle(50% at 50% 50%)" }} />
        ))}
      </div>
      <div className="absolute inset-x-1 bottom-1 h-[3px] bg-black/60" />
    </div>
  );
}

// The Pit — three of FirePit's own flame silhouettes, shrunk down.
function PitIcon() {
  return (
    <div className="flex h-8 w-8 items-end justify-center gap-[2px] sm:h-9 sm:w-9">
      <div
        className="h-4 w-2"
        style={{
          clipPath: "polygon(50% 0%, 80% 35%, 65% 40%, 90% 70%, 50% 100%, 10% 70%, 35% 40%, 20% 35%)",
          background: "linear-gradient(to top, #7a0d02, #ff4d0f, #ffb238)",
        }}
      />
      <div
        className="h-6 w-2"
        style={{
          clipPath:
            "polygon(50% 0%, 75% 28%, 60% 24%, 85% 52%, 64% 48%, 90% 78%, 52% 100%, 16% 86%, 30% 56%, 8% 46%, 36% 30%, 18% 14%)",
          background: "linear-gradient(to top, #8f1400, #ff5b12, #ffe9a8)",
        }}
      />
      <div
        className="h-4 w-2"
        style={{
          clipPath: "polygon(48% 0%, 70% 18%, 92% 42%, 68% 58%, 94% 84%, 54% 100%, 18% 92%, 4% 60%, 28% 50%, 8% 24%, 40% 14%)",
          background: "linear-gradient(to top, #6e0d03, #ef3d0f, #ffd98a)",
        }}
      />
    </div>
  );
}

// Fairyland — the same mushroom-capped cottage roof (see
// FairytaleBackground.tsx's MushroomCottage), shrunk to an icon.
function FairylandIcon() {
  return (
    <div className="relative flex h-8 w-7 flex-col items-center sm:h-9 sm:w-8">
      <div
        className="relative h-4 w-7 sm:h-5 sm:w-8"
        style={{
          clipPath: "circle(50% at 50% 100%)",
          background: "radial-gradient(circle at 50% 20%, #e0546a 0%, #b8324a 55%, #7a1c2e 100%)",
        }}
      >
        <div
          className="absolute left-[22%] top-[25%] h-1 w-1"
          style={{ clipPath: "circle(50% at 50% 50%)", background: "rgba(255,255,255,0.7)" }}
        />
        <div
          className="absolute right-[22%] top-[38%] h-1 w-1"
          style={{ clipPath: "circle(50% at 50% 50%)", background: "rgba(255,255,255,0.65)" }}
        />
      </div>
      <div className="h-3 w-3 sm:h-4 sm:w-3" style={{ background: "linear-gradient(180deg,#f2efe8,#c9c0ab)" }} />
    </div>
  );
}
