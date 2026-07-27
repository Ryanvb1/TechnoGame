import { SectionShell } from "@/components/SectionShell";
import { AirportScene } from "@/components/AirportScene";

export default function AirportPage() {
  return (
    <SectionShell title="The Airport" centered backDirection="down" titleInvisible>
      <AirportScene />
    </SectionShell>
  );
}
