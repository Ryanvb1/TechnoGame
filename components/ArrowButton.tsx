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
      <span
        style={{ clipPath: ARROW_CLIP_PATH[direction] }}
        className={`h-10 w-10 transition-all duration-200 ease-out sm:h-12 sm:w-12 ${
          disabled
            ? "bg-neon-dim/25"
            : "bg-neon-dim shadow-[0_0_10px_var(--neon-dim)] group-hover:bg-neon group-hover:shadow-[0_0_20px_var(--neon),0_0_40px_var(--neon-dim)] group-focus-visible:bg-neon group-focus-visible:shadow-[0_0_20px_var(--neon),0_0_40px_var(--neon-dim)]"
        }`}
      />
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
