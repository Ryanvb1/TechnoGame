import { SectionShell } from "@/components/SectionShell";
import { ThroneRoomScene } from "@/components/ThroneRoomScene";

export default function ThroneRoomPage() {
  return (
    <SectionShell title="Throne Room" centered backDirection="down" titleInvisible>
      <ThroneRoomScene />
    </SectionShell>
  );
}
