import { Hub } from "@/components/Hub";
import { AmbientDetails } from "@/components/AmbientDetails";

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
      <Hub />
    </main>
  );
}
