"use client";

import type { MouseEvent } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ARROW_CLIP_PATH, type Direction } from "./directions";
import { useSceneTravel } from "./PageTransition";
import { GNOME_MAX_ORBS, readGnomeOrbs } from "./gnomeProgress";
import { ScaredSnail } from "./ScaredSnail";

// Pins the arrow to the screen edge it points toward. Up/down sit in the
// top-right/bottom-right corner rather than dead-center — page titles are
// left-aligned (or centered, on "centered" pages) and can run wide enough on
// narrow screens to collide with a horizontally-centered arrow.
const WALL_POSITION_CLASS: Record<Direction, string> = {
  up: "top-8 right-8 sm:top-12 sm:right-12",
  down: "bottom-8 right-8 sm:bottom-12 sm:right-12",
  left: "left-8 top-1/2 -translate-y-1/2 sm:left-12",
  right: "right-8 top-1/2 -translate-y-1/2 sm:right-12",
};

// Keeps the label on the inward side so it never runs off-screen. Below sm,
// left/right labels sit under the icon (like up/down always do) instead of
// beside it — on narrow "centered" pages that side-reach was enough to land
// on top of full-width content (e.g. the nicotine page's video box).
const WALL_LABEL_CLASS: Record<Direction, string> = {
  up: "top-full left-1/2 mt-3 -translate-x-1/2",
  down: "bottom-full left-1/2 mb-3 -translate-x-1/2",
  left: "top-full left-1/2 mt-2 -translate-x-1/2 sm:top-1/2 sm:left-full sm:mt-0 sm:ml-3 sm:translate-x-0 sm:-translate-y-1/2",
  right: "top-full left-1/2 mt-2 -translate-x-1/2 sm:top-1/2 sm:left-auto sm:right-full sm:mt-0 sm:mr-3 sm:translate-x-0 sm:-translate-y-1/2",
};

// How far down the rope can reach (from its roof anchor to just above the
// fire) versus how short it gets at full progress.
const ROPE_MAX_DROP = "calc(100vh - 240px)";
const ROPE_MIN_FRACTION = 0.3;

export function SectionShell({
  title,
  children,
  centered = false,
  backDirection = "left",
  backVisual = "arrow",
  hideTitle = false,
  hideBackLabel = false,
}: {
  title: string;
  children?: React.ReactNode;
  centered?: boolean;
  backDirection?: Direction;
  backVisual?: "arrow" | "rope";
  hideTitle?: boolean;
  hideBackLabel?: boolean;
}) {
  const travel = useSceneTravel();
  const [orbs, setOrbs] = useState(0);

  useEffect(() => {
    if (backVisual === "rope") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage, an external store the server can't see (this page is statically generated).
      setOrbs(readGnomeOrbs());
    }
  }, [backVisual]);

  function handleBack(e: MouseEvent<HTMLAnchorElement>) {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    e.preventDefault();
    travel(backDirection, "/");
  }

  const ropeFraction =
    ROPE_MIN_FRACTION + (1 - orbs / GNOME_MAX_ORBS) * (1 - ROPE_MIN_FRACTION);

  return (
    <main
      className={`flex min-h-screen flex-col gap-10 px-8 py-12 sm:px-16 ${
        centered ? "items-center text-center" : "items-start"
      }`}
    >
      <Link
        href="/"
        onClick={handleBack}
        aria-label="Back to menu"
        className={`group fixed z-40 flex items-center justify-center outline-none ${
          backVisual === "rope" ? "left-1/2 top-0 -translate-x-1/2" : WALL_POSITION_CLASS[backDirection]
        }`}
      >
        {backVisual === "rope" ? (
          <div className="flex origin-top animate-[rope-sway_3.5s_ease-in-out_infinite] flex-col items-center">
            <div
              className="w-3 transition-[height] duration-700 ease-out"
              style={{
                height: `calc(${ROPE_MAX_DROP} * ${ropeFraction})`,
                background:
                  "repeating-linear-gradient(65deg, #cbaa70 0px, #cbaa70 3px, #9c7a44 3px, #9c7a44 6px)",
                boxShadow: "1px 0 3px rgba(0,0,0,0.45)",
              }}
            />
            {/* knot, doubling as the ledge the snail sits on — the rope
                connects straight into it, uninterrupted */}
            <div className="relative flex flex-col items-center">
              <div
                className="h-3 w-11 transition-colors duration-200 group-hover:brightness-110"
                style={{ background: "linear-gradient(180deg, #b8935c 0%, #7d5c34 100%)" }}
              />
              {/* frayed end */}
              <div className="flex gap-0.5">
                <div className="h-3 w-[3px] origin-top rotate-[-14deg] bg-[#cbaa70]" />
                <div className="h-4 w-[3px] origin-top bg-[#cbaa70]" />
                <div className="h-3 w-[3px] origin-top rotate-[14deg] bg-[#cbaa70]" />
              </div>
              {/* the closer the rope hangs to the flames (low progress),
                  the more terrified our passenger gets — positioned to
                  overlap the seam where the rope knots into the ledge,
                  so he visually sits on it rather than replacing it */}
              <div className="absolute bottom-full left-1/2 z-10 mb-[-8px] -translate-x-1/2">
                <ScaredSnail fear={1 - orbs / GNOME_MAX_ORBS} />
              </div>
            </div>
          </div>
        ) : (
          <span
            style={{ clipPath: ARROW_CLIP_PATH[backDirection] }}
            className="h-10 w-10 bg-neon-dim shadow-[0_0_10px_var(--neon-dim)] transition-all duration-200 ease-out group-hover:bg-neon group-hover:shadow-[0_0_20px_var(--neon),0_0_40px_var(--neon-dim)]"
          />
        )}
        {!hideBackLabel && (
          <span
            className={`absolute whitespace-nowrap text-xs uppercase tracking-[0.3em] text-neon-dim transition-colors duration-200 group-hover:text-neon ${WALL_LABEL_CLASS[backDirection]}`}
          >
            Back
          </span>
        )}
      </Link>
      {!hideTitle && (
        <h1 className="text-4xl font-bold uppercase tracking-widest text-neon sm:text-6xl">
          {title}
        </h1>
      )}
      <div
        className={`max-w-2xl text-foreground/80 ${
          centered && (backDirection === "left" || backDirection === "right")
            ? "px-12 sm:px-0"
            : ""
        }`}
      >
        {children}
      </div>
    </main>
  );
}
