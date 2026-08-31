import { SectionShell } from "@/components/SectionShell";
import { CautionTape } from "@/components/CautionTape";

export default function AirportPage() {
  return (
    <SectionShell title="The Airport" centered backDirection="down">
      <div className="mt-20 border border-neon-dim/40 bg-background/85 px-8 py-7 text-center shadow-[0_0_20px_rgba(28,143,82,0.15)]">
        <CautionTape className="w-72 max-w-[70vw] -rotate-3" />
        <CautionTape className="mt-5 w-72 max-w-[70vw] rotate-3" />
      </div>
    </SectionShell>
  );
}
