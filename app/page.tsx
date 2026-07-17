import Link from "next/link";
import { Hub } from "@/components/Hub";
import { ResetButton } from "@/components/ResetButton";
import { AmbientDetails } from "@/components/AmbientDetails";
import { HomeSnail } from "@/components/HomeSnail";

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
      <AmbientDetails />
      <p className="relative z-10 text-xs uppercase tracking-[0.5em] text-neon-dim">
        Choose a direction
      </p>
      <Hub />
      <div className="absolute top-4 left-4 z-10 flex max-w-[260px] flex-wrap justify-start gap-x-4 gap-y-1 text-[0.6rem] uppercase tracking-[0.2em] text-neon-dim/70 sm:top-6 sm:left-6 sm:max-w-none sm:flex-nowrap sm:gap-7 sm:text-[0.78rem] sm:tracking-[0.3em]">
        <Link href="/about" className="transition-colors hover:text-neon">
          About
        </Link>
        <Link href="/writing" className="transition-colors hover:text-neon">
          Writing
        </Link>
        <Link href="/contact" className="transition-colors hover:text-neon">
          Contact
        </Link>
        <ResetButton />
      </div>
      <HomeSnail />
    </main>
  );
}
