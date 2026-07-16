import { SectionShell } from "@/components/SectionShell";
import { Throne } from "@/components/Throne";

export default function ThroneRoomPage() {
  return (
    <SectionShell title="Throne Room" centered backDirection="down">
      <div className="flex flex-col items-center gap-8">
        <p>Placeholder — the throne sits empty, atop a distant pile of gold.</p>
        <Throne />
      </div>
    </SectionShell>
  );
}
