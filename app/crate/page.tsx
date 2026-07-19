import { SectionShell } from "@/components/SectionShell";
import { CrateOpener } from "@/components/CrateOpener";
import { LockedChest } from "@/components/LockedChest";

export default function CratePage() {
  return (
    <SectionShell title="Daily Crate" centered backDirection="left">
      <div className="flex flex-col items-center gap-8">
        <p>
          One crate drops per day — three niche, well-reviewed finds you
          probably haven&apos;t stumbled across before. Click it open to
          reveal today&apos;s picks.
        </p>
        <CrateOpener />
      </div>
      <LockedChest />
    </SectionShell>
  );
}
