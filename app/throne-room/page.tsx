import { SectionShell } from "@/components/SectionShell";
import { Throne } from "@/components/Throne";
import { Knight } from "@/components/Knight";
import { ThroneHallBackground } from "@/components/ThroneHallBackground";

export default function ThroneRoomPage() {
  return (
    <SectionShell title="Throne Room" centered backDirection="down">
      <ThroneHallBackground />
      <div className="flex flex-col items-center gap-8">
        {/* Knight stands beside the pile rather than flowing below it —
            flowing below pushed the page tall enough that he'd render
            past the fold, effectively cut off at the bottom. */}
        <div className="relative">
          <Throne />
          <div className="absolute bottom-[21%] right-[2%]">
            <Knight />
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
