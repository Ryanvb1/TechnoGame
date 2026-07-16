import Link from "next/link";
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
      <div className="absolute bottom-6 right-6 z-10 flex gap-6 text-[0.65rem] uppercase tracking-[0.3em] text-neon-dim/70">
        <Link href="/about" className="transition-colors hover:text-neon">
          About
        </Link>
        <Link href="/writing" className="transition-colors hover:text-neon">
          Writing
        </Link>
      </div>
    </main>
  );
}
