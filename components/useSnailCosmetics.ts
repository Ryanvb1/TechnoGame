"use client";

import { useEffect, useState } from "react";
import {
  EQUIPPED_ITEM_CHANGED_EVENT,
  NECKLACE_COLORS,
  readEquippedNecklace,
  readEquippedShell,
  type ShellItemId,
} from "./inventory";

export type SnailShellStyle = "default" | "rainbow" | "black" | "white";
export type SnailCosmetics = {
  shellStyle: SnailShellStyle;
  necklaceColor: string | null;
};

function shellStyleFor(item: ShellItemId | null): SnailShellStyle {
  if (item === "rainbow-shell") return "rainbow";
  if (item === "black-shell") return "black";
  if (item === "white-shell") return "white";
  return "default";
}

function readCosmetics(): SnailCosmetics {
  const necklace = readEquippedNecklace();
  return {
    shellStyle: shellStyleFor(readEquippedShell()),
    necklaceColor: necklace ? NECKLACE_COLORS[necklace] : null,
  };
}

export function useSnailCosmetics(): SnailCosmetics {
  const [cosmetics, setCosmetics] = useState<SnailCosmetics>({
    shellStyle: "default",
    necklaceColor: null,
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-local equipment is unavailable during server rendering.
    setCosmetics(readCosmetics());
    function syncCosmetics() {
      setCosmetics(readCosmetics());
    }
    window.addEventListener(EQUIPPED_ITEM_CHANGED_EVENT, syncCosmetics);
    return () => window.removeEventListener(EQUIPPED_ITEM_CHANGED_EVENT, syncCosmetics);
  }, []);

  return cosmetics;
}
