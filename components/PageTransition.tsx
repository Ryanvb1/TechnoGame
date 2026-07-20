"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { Direction } from "./directions";
import { ARRIVE_MS, FootstepTrail, LEAVE_MS, type TravelPhase } from "./FootstepTrail";

type TravelFn = (direction: Direction, href: string) => void;

const TravelContext = createContext<TravelFn | null>(null);

export function PageTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const phaseRef = useRef<TravelPhase>("idle");
  const pendingHrefRef = useRef<string | null>(null);
  const [direction, setDirection] = useState<Direction>("up");
  const [phase, setPhase] = useState<TravelPhase>("idle");
  // Tracked separately per leg of the trip: the pit and throne room should
  // never show footsteps once you've actually arrived in them, but the
  // walk leaving whatever room you departed FROM (toward one of them) is
  // a different leg and still plays normally.
  const [suppressLeaving, setSuppressLeaving] = useState(false);
  const [suppressArriving, setSuppressArriving] = useState(false);

  const travel = useCallback<TravelFn>(
    (dir, href) => {
      if (phaseRef.current !== "idle") return;

      pendingHrefRef.current = href;
      phaseRef.current = "leaving";
      setDirection(dir);
      setPhase("leaving");
      // Leaving the pit/throne room stays silent (no dust kicked up over
      // the pit's dangling rope/snail scene, and leaving the throne room
      // should feel like a clean cut); arriving in either should never
      // show trailing footsteps once the scene has actually cut over.
      setSuppressLeaving(pathname === "/careful" || pathname === "/throne-room");
      setSuppressArriving(href === "/careful" || href === "/throne-room");

      window.setTimeout(() => {
        if (pendingHrefRef.current) {
          router.push(pendingHrefRef.current);
          pendingHrefRef.current = null;
        }
        phaseRef.current = "arriving";
        setPhase("arriving");

        window.setTimeout(() => {
          phaseRef.current = "idle";
          setPhase("idle");
        }, ARRIVE_MS);
      }, LEAVE_MS);
    },
    [router, pathname]
  );

  const suppressed = phase === "leaving" ? suppressLeaving : phase === "arriving" ? suppressArriving : false;

  return (
    <TravelContext.Provider value={travel}>
      {children}
      {!suppressed && <FootstepTrail direction={direction} phase={phase} />}
    </TravelContext.Provider>
  );
}

export function useSceneTravel() {
  const travel = useContext(TravelContext);
  if (!travel) {
    throw new Error("useSceneTravel must be used within a PageTransitionProvider");
  }
  return travel;
}
