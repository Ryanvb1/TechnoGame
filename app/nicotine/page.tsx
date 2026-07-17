import { SectionShell } from "@/components/SectionShell";
import { Gnome } from "@/components/Gnome";
import { FairytaleBackground } from "@/components/FairytaleBackground";

export default function NicotinePage() {
  return (
    <SectionShell title="Gnome" centered backDirection="right">
      <FairytaleBackground />
      <div className="flex flex-col items-center gap-10">
        <p>The Gnome is your friend, he keeps track of your progress.</p>
        <Gnome />
      </div>
    </SectionShell>
  );
}
