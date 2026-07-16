"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { ARROW_CLIP_PATH, type Direction } from "./directions";
import { useSceneTravel } from "./PageTransition";

const GRID_AREA: Record<Direction, string> = {
  up: "up",
  down: "down",
  left: "left",
  right: "right",
};

// Below sm, every label sits centered under its arrow so nothing can run off
// the narrow viewport edge. At sm+ left/right labels move out to the side.
const LABEL_CLASS: Record<Direction, string> = {
  up: "-top-6 left-1/2 -translate-x-1/2 sm:-top-8",
  down: "-bottom-6 left-1/2 -translate-x-1/2 sm:-bottom-8",
  left: "top-full left-1/2 mt-2 -translate-x-1/2 sm:top-1/2 sm:left-auto sm:-left-4 sm:mt-0 sm:-translate-x-full sm:-translate-y-1/2",
  right: "top-full left-1/2 mt-2 -translate-x-1/2 sm:top-1/2 sm:left-auto sm:-right-4 sm:mt-0 sm:translate-x-full sm:-translate-y-1/2",
};

export function ArrowButton({
  direction,
  href,
  label,
}: {
  direction: Direction;
  href: string;
  label: string;
}) {
  const travel = useSceneTravel();

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
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
      style={{ gridArea: GRID_AREA[direction] }}
      className="group relative flex items-center justify-center outline-none"
    >
      <span
        style={{ clipPath: ARROW_CLIP_PATH[direction] }}
        className="h-10 w-10 bg-neon-dim shadow-[0_0_10px_var(--neon-dim)] transition-all duration-200 ease-out group-hover:bg-neon group-hover:shadow-[0_0_20px_var(--neon),0_0_40px_var(--neon-dim)] group-focus-visible:bg-neon group-focus-visible:shadow-[0_0_20px_var(--neon),0_0_40px_var(--neon-dim)]"
      />
      <span
        className={`absolute whitespace-nowrap text-xs uppercase tracking-[0.3em] text-neon-dim transition-colors duration-200 group-hover:text-neon group-focus-visible:text-neon ${LABEL_CLASS[direction]}`}
      >
        {label}
      </span>
    </Link>
  );
}
