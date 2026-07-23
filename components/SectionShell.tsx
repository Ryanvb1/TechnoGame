"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { ARROW_CLIP_PATH, type Direction } from "./directions";
import { useSceneTravel } from "./PageTransition";

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

export function SectionShell({
  title,
  children,
  centered = false,
  backDirection = "left",
  hideTitle = false,
  titleInvisible = false,
  hideBackLabel = false,
}: {
  title: string;
  children?: React.ReactNode;
  centered?: boolean;
  backDirection?: Direction;
  hideTitle?: boolean;
  // Unlike hideTitle (which omits the h1 entirely, and so drops the
  // vertical space it was occupying), this keeps the h1's layout box in
  // place and just hides its rendering — for scenes tuned to sit at a
  // specific position that would otherwise shift when the title's gone.
  titleInvisible?: boolean;
  hideBackLabel?: boolean;
}) {
  const travel = useSceneTravel();

  function handleBack(e: MouseEvent<HTMLAnchorElement>) {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    e.preventDefault();
    travel(backDirection, "/");
  }

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
        className={`group fixed z-40 flex items-center justify-center outline-none ${WALL_POSITION_CLASS[backDirection]}`}
      >
        <span
          style={{ clipPath: ARROW_CLIP_PATH[backDirection] }}
          className="h-10 w-10 bg-neon-dim shadow-[0_0_10px_var(--neon-dim)] transition-all duration-200 ease-out group-hover:bg-neon group-hover:shadow-[0_0_20px_var(--neon),0_0_40px_var(--neon-dim)]"
        />
        {!hideBackLabel && (
          <span
            className={`absolute whitespace-nowrap text-xs uppercase tracking-[0.3em] text-neon-dim transition-colors duration-200 group-hover:text-neon ${WALL_LABEL_CLASS[backDirection]}`}
          >
            Back
          </span>
        )}
      </Link>
      {!hideTitle && (
        <h1
          className={`text-4xl font-bold uppercase tracking-widest text-neon sm:text-6xl ${
            titleInvisible ? "invisible" : ""
          }`}
        >
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
