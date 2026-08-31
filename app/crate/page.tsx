import { SectionShell } from "@/components/SectionShell";
import { CrateOpener } from "@/components/CrateOpener";
import { VendingMachine } from "@/components/VendingMachine";
import { Locker } from "@/components/Locker";
import { LockedChest } from "@/components/LockedChest";

export default function CratePage() {
  return (
    <SectionShell title="Kiosk" centered backDirection="left" clickOnlyInteractions>
      <div className="flex flex-col items-center gap-2 sm:gap-3">
        {/* Dropped below sm — on a narrow viewport this line alone was
            enough to push the row (the part that actually matters) below
            the fold; the vending machine's own header already shows the
            balance. */}
        <p className="hidden max-w-md text-xs text-foreground/70 sm:block sm:text-sm">
          One crate drops per day, spilling out 200–500 rainbow balls. Spend
          them at the vending machine.
        </p>
        {/* Three columns side by side rather than stacked — the whole
            point is fitting the crate, vending machine, and locker on
            screen together without scrolling. `zoom` (not a transform
            scale) actually shrinks the crate's layout footprint, not just
            its paint, since a scaled transform would still reserve its
            full unscaled height in the row. */}
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-start sm:justify-center sm:gap-6">
          <div style={{ zoom: 0.55 }}>
            <CrateOpener />
          </div>
          <VendingMachine />
          <Locker />
        </div>
      </div>
      <LockedChest />
    </SectionShell>
  );
}
