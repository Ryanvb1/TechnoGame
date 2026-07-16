import { Hub } from "@/components/Hub";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-16 overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(var(--neon-dim) 1px, transparent 1px), linear-gradient(90deg, var(--neon-dim) 1px, transparent 1px)",
          backgroundSize: "4rem 4rem",
        }}
      />
      <p className="relative z-10 text-xs uppercase tracking-[0.5em] text-neon-dim">
        Choose a direction
      </p>
      <Hub />
    </main>
  );
}
