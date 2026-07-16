import { ArrowButton } from "@/components/ArrowButton";

export function Hub() {
  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateAreas: `". up ." "left hub right" ". down ."`,
        gridTemplateColumns: "7rem 7rem 7rem",
        gridTemplateRows: "7rem 7rem 7rem",
      }}
    >
      <div
        style={{ gridArea: "hub" }}
        className="relative flex items-center justify-center"
      >
        <div className="h-16 w-16 rotate-45 animate-pulse border-2 border-neon shadow-[0_0_15px_var(--neon),0_0_35px_var(--neon-dim)]" />
        <span className="absolute text-[0.6rem] uppercase tracking-[0.35em] text-neon">
          Menu
        </span>
      </div>
      <ArrowButton direction="up" href="/projects" label="Projects" />
      <ArrowButton direction="right" href="/crate" label="Crate" />
      <ArrowButton direction="down" href="/contact" label="Contact" />
      <ArrowButton direction="left" href="/nicotine" label="Quit" />
    </div>
  );
}
