import { SectionShell } from "@/components/SectionShell";
import { FirePit } from "@/components/FirePit";

export default function CarefulPage() {
  return (
    <SectionShell
      title="Careful"
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
