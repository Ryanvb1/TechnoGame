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
  const [suppressFootsteps, setSuppressFootsteps] = useState(false);

  const travel = useCallback<TravelFn>(
    (dir, href) => {
      if (phaseRef.current !== "idle") return;

      pendingHrefRef.current = href;
      phaseRef.current = "leaving";
      setDirection(dir);
      setPhase("leaving");
      // The careful room's dangling rope/snail scene doesn't want footstep
      // dust kicked up over it, whether arriving or leaving.
      setSuppressFootsteps(pathname === "/careful" || href === "/careful");

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

  return (
    <TravelContext.Provider value={travel}>
      {children}
      {!suppressFootsteps && <FootstepTrail direction={direction} phase={phase} />}
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
