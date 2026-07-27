import { SectionShell } from "@/components/SectionShell";
import { CaveScene } from "@/components/CaveScene";

export default function CavePage() {
  return (
    <SectionShell title="The Cave" centered backDirection="up" titleInvisible>
      <CaveScene />
    </SectionShell>
  );
}
