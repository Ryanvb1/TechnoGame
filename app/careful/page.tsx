import { SectionShell } from "@/components/SectionShell";
import { FirePit } from "@/components/FirePit";

export default function CarefulPage() {
  return (
    <SectionShell
      title="The Pit"
      centered
      backDirection="up"
      backVisual="rope"
      hideTitle
      hideBackLabel
    >
      <FirePit />
    </SectionShell>
  );
}
