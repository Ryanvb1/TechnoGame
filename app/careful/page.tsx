import { SectionShell } from "@/components/SectionShell";
import { FirePit } from "@/components/FirePit";

export default function CarefulPage() {
  return (
    <SectionShell
      title="Careful"
      centered
      backDirection="up"
      backVisual="rope"
    >
      <div className="flex flex-col items-center gap-8">
        <p className="max-w-40 sm:max-w-none">
          Placeholder — a pit of fire, for now. Climb the rope to get back.
        </p>
        <FirePit />
      </div>
    </SectionShell>
  );
}
