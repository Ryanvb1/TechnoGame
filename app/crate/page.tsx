import { SectionShell } from "@/components/SectionShell";
import { CrateOpener } from "@/components/CrateOpener";
import { VendingMachine } from "@/components/VendingMachine";
import { Locker } from "@/components/Locker";
import { LockedChest } from "@/components/LockedChest";

export default function CratePage() {
  return (
    <SectionShell title="Kiosk" centered backDirection="left">
      <div className="flex flex-col items-center gap-8">
        <p>
          One crate drops per day, spilling out a pile of rainbow balls —
          somewhere between 200 and 500 of them. Spend what you collect at
          the vending machine.
        </p>
        <div className="flex flex-col items-center gap-10 sm:flex-row sm:items-start sm:justify-center">
          <div className="origin-top scale-75">
            <CrateOpener />
          </div>
          <VendingMachine />
        </div>
        <Locker />
      </div>
      <LockedChest />
    </SectionShell>
  );
}
