"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { readSnailRescued, readSnailLocationCommented, markSnailLocationCommented } from "./snailState";
import { ScaredSnail } from "./ScaredSnail";
import { ThoughtBubble } from "./ThoughtBubble";
import { EQUIPPED_ITEM_CHANGED_EVENT, readEquippedItem } from "./inventory";
import { useCompanionSnailHidden } from "./companionSnail";

const COMMENT_DISPLAY_MS = 4200;

// One simple, throwaway line per location — just enough for it to feel
// like he's actually looking around, not a real running commentary.
const LOCATION_COMMENTS: Record<string, string> = {
  "/throne-room": "Ooh, fancy. I want a smaller throne.",
  "/cave": "Dark, damp, and smells like me. Love it.",
  "/airport": "I packed nothing. I am nothing but shell.",
  "/crate": "200 rainbow balls and not one is mine?",
  "/about": "Is this where they explain the snail?",
  "/contact": "Tell them a snail says hi.",
  "/projects": "Bold of you to have 'projects'. I have naps.",
  "/writing": "I'd help you write, but, no hands.",
  "/nicotine": "A gnome AND a cottage? I'm moving in.",
};

// The rescued snail tagging along for moral support on every other
// location page — SectionShell mounts this once, so it covers all of them
// without each page needing its own copy. Home has its own dedicated
// HomeSnail instead (different greeting, different spot on screen), so
// this deliberately doesn't handle "/".
export function LocationSnail() {
  const pathname = usePathname();
  // Same SSR-can't-see-localStorage reasoning as HomeSnail — start false to
  // match the static markup, then sync in the real value after mount.
  const [rescued, setRescued] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [rainbowShell, setRainbowShell] = useState(false);
  // Borrowed out for boss-fight duty (see companionSnail.ts) — hidden here
  // for exactly as long as that scene's own stand-in version of him is on
  // screen, so there's only ever one snail visible at a time.
  const hidden = useCompanionSnailHidden();

  useEffect(() => {
    const saved = readSnailRescued();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage, an external store the server can't see; see comment above.
    setRescued(saved);
    setRainbowShell(readEquippedItem() === "rainbow-shell");
    const comment = LOCATION_COMMENTS[pathname];
    if (saved && comment && !readSnailLocationCommented(pathname)) {
      setShowComment(true);
      markSnailLocationCommented(pathname);
      window.setTimeout(() => setShowComment(false), COMMENT_DISPLAY_MS);
    }
  }, [pathname]);

  // Picks up an equip change made elsewhere on the same page (e.g. the
  // Locker on the kiosk page, which mounts right alongside this same
  // companion snail) immediately, rather than only on the next navigation.
  useEffect(() => {
    function syncShell() {
      setRainbowShell(readEquippedItem() === "rainbow-shell");
    }
    window.addEventListener(EQUIPPED_ITEM_CHANGED_EVENT, syncShell);
    return () => window.removeEventListener(EQUIPPED_ITEM_CHANGED_EVENT, syncShell);
  }, []);

  if (!rescued || hidden) return null;

  return (
    <div className="pointer-events-none fixed bottom-6 left-6 z-20 sm:bottom-10 sm:left-10">
      {showComment && (
        <ThoughtBubble className="absolute bottom-full left-0 mb-4 w-56">
          <p>{LOCATION_COMMENTS[pathname]}</p>
        </ThoughtBubble>
      )}
      <ScaredSnail fear={0} rainbowShell={rainbowShell} />
    </div>
  );
}
