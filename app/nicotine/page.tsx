import { SectionShell } from "@/components/SectionShell";
import { Gnome } from "@/components/Gnome";
import { FairytaleBackground, MushroomCottage } from "@/components/FairytaleBackground";

export default function NicotinePage() {
  return (
    <SectionShell title="Fairyland" centered backDirection="right">
      <FairytaleBackground />
      <MushroomCottage />
      <div className="flex flex-col items-center gap-10">
        <p>The Gnome is your friend, they keep track of your progress.</p>
        <Gnome />
      </div>
    </SectionShell>
  );
}
