"use client";

import { createContext, useContext } from "react";
import { useRouter } from "next/navigation";

type TravelFn = (href: string) => void;

const TravelContext = createContext<TravelFn | null>(null);

export function PageTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  function travel(href: string) {
    router.push(href);
  }

  return <TravelContext.Provider value={travel}>{children}</TravelContext.Provider>;
}

export function useSceneTravel() {
  const travel = useContext(TravelContext);
  if (!travel) {
    throw new Error("useSceneTravel must be used within a PageTransitionProvider");
  }
  return travel;
}
