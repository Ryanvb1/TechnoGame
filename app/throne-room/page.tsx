import { SectionShell } from "@/components/SectionShell";
import { Throne } from "@/components/Throne";
import { Knight } from "@/components/Knight";
import { ThroneHallBackground } from "@/components/ThroneHallBackground";

export default function ThroneRoomPage() {
  return (
    <SectionShell title="Throne Room" centered backDirection="down">
      <ThroneHallBackground />
      <div className="flex flex-col items-center gap-8">
        <p>Placeholder — the throne sits empty, atop a distant pile of gold.</p>
        <Throne />
        <Knight />
      </div>
    </SectionShell>
  );
}
