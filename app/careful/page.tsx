import { SectionShell } from "@/components/SectionShell";
import { FirePit, FirePitOrbGround } from "@/components/FirePit";
import { PitGate } from "@/components/PitGate";

export default function CarefulPage() {
  return (
    <SectionShell title="The Pit" centered backDirection="up" hideTitle>
      <PitGate>
        <FirePit />
      </PitGate>
      <FirePitOrbGround />
    </SectionShell>
  );
}
