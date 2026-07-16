import { ArrowButton } from "@/components/ArrowButton";

export function Hub() {
  return (
    <div
      className="grid grid-cols-[5.5rem_5.5rem_5.5rem] grid-rows-[5.5rem_5.5rem_5.5rem] gap-3 sm:grid-cols-[7rem_7rem_7rem] sm:grid-rows-[7rem_7rem_7rem] sm:gap-4"
      style={{
        gridTemplateAreas: `". up ." "left hub right" ". down ."`,
      }}
    >
      <div
        style={{ gridArea: "hub" }}
        className="relative flex items-center justify-center"
      >
        <div className="h-12 w-12 rotate-45 animate-pulse border-2 border-neon shadow-[0_0_15px_var(--neon),0_0_35px_var(--neon-dim)] sm:h-16 sm:w-16" />
        <span className="absolute text-[0.55rem] uppercase tracking-[0.3em] text-neon sm:text-[0.6rem] sm:tracking-[0.35em]">
          Menu
        </span>
      </div>
      <ArrowButton direction="up" href="/throne-room" label="Throne Room" />
      <ArrowButton direction="right" href="/crate" label="Crate" />
      <ArrowButton direction="down" href="/careful" label="Careful" />
      <ArrowButton direction="left" href="/nicotine" label="Quit" />
    </div>
  );
}
