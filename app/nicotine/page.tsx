import { SectionShell } from "@/components/SectionShell";

const MILESTONES = [
  { label: "Day 1", detail: "Cravings peak — this stretch is the hardest." },
  { label: "Day 3", detail: "Most nicotine has cleared your system." },
  { label: "Week 1", detail: "Taste and smell start sharpening back up." },
  { label: "Month 1", detail: "Breathing and circulation keep improving." },
];

export default function NicotinePage() {
  return (
    <SectionShell title="Quit Nicotine" centered backDirection="right">
      <div className="flex flex-col items-center gap-10">
        <p>
          Placeholder — the full guide, resources, and progress tracking will
          live here. For now: a quick video and a visual overview of what to
          expect.
        </p>

        <div className="flex aspect-video w-full max-w-xl items-center justify-center border border-neon-dim bg-black/40">
          <div className="flex flex-col items-center gap-3 text-neon-dim">
            <span
              style={{ clipPath: "polygon(0% 0%, 100% 50%, 0% 100%)" }}
              className="h-8 w-8 bg-neon-dim"
            />
            <span className="text-xs uppercase tracking-[0.3em]">
              Video placeholder
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {MILESTONES.map((m) => (
            <div
              key={m.label}
              className="border border-neon-dim px-4 py-5 text-center"
            >
              <p className="text-sm uppercase tracking-[0.2em] text-neon">
                {m.label}
              </p>
              <p className="mt-2 text-xs text-foreground/70">{m.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
