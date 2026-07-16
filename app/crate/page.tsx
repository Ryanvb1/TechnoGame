import { SectionShell } from "@/components/SectionShell";
import { CrateOpener } from "@/components/CrateOpener";

export default function CratePage() {
  return (
    <SectionShell title="Daily Crate" centered>
      <div className="flex flex-col items-center gap-8">
        <p>
          Placeholder — one crate drops per day. Click it open to reveal
          today&apos;s three picks.
        </p>
        <CrateOpener />
      </div>
    </SectionShell>
  );
}
