import Link from "next/link";

type Direction = "up" | "down" | "left" | "right";

const CLIP_PATH: Record<Direction, string> = {
  up: "polygon(50% 0%, 0% 100%, 100% 100%)",
  down: "polygon(0% 0%, 100% 0%, 50% 100%)",
  left: "polygon(0% 50%, 100% 0%, 100% 100%)",
  right: "polygon(0% 0%, 100% 50%, 0% 100%)",
};

const GRID_AREA: Record<Direction, string> = {
  up: "up",
  down: "down",
  left: "left",
  right: "right",
};

const LABEL_CLASS: Record<Direction, string> = {
  up: "-top-8 left-1/2 -translate-x-1/2",
  down: "-bottom-8 left-1/2 -translate-x-1/2",
  left: "top-1/2 -left-4 -translate-x-full -translate-y-1/2",
  right: "top-1/2 -right-4 translate-x-full -translate-y-1/2",
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
  return (
    <Link
      href={href}
      style={{ gridArea: GRID_AREA[direction] }}
      className="group relative flex items-center justify-center outline-none"
    >
      <span
        style={{ clipPath: CLIP_PATH[direction] }}
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
