"use client";

import { useEffect, useState } from "react";
import { ArrowButton } from "@/components/ArrowButton";
import { markTacticViewed, readTacticViewed } from "./tacticState";

export function Hub() {
  // This page is statically generated, so the server/build-time HTML always
  // has to assume "not viewed" (no localStorage on the server). Starting
  // state at false matches that markup exactly, then this effect syncs in
  // the real value right after mount — the resulting state update is what
  // actually repaints the DOM; a lazy useState initializer alone computes
  // the right value but doesn't force hydration to repaint to match it.
  const [viewed, setViewed] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage, an external store the server can't see; see comment above.
    if (readTacticViewed()) setViewed(true);
  }, []);

  function handleTacticClick() {
    if (!viewed) {
      setViewed(true);
      markTacticViewed();
    }
    setShowMessage(true);
  }

  return (
    <div
      className="grid grid-cols-[5.5rem_5.5rem_5.5rem] grid-rows-[5.5rem_5.5rem_5.5rem] gap-3 sm:grid-cols-[8.4rem_8.4rem_8.4rem] sm:grid-rows-[8.4rem_8.4rem_8.4rem] sm:gap-5"
      style={{
        gridTemplateAreas: `". up ." "left hub right" ". down ."`,
      }}
    >
      {showMessage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 px-6 backdrop-blur-sm"
          onClick={() => setShowMessage(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex w-full max-w-xl flex-col items-center gap-6 border border-neon-dim bg-white px-8 py-16 text-center text-black shadow-[0_0_15px_var(--neon-dim),0_0_40px_rgba(57,255,143,0.15)] sm:min-h-[55vh] sm:justify-center"
          >
            <span className="text-xs uppercase tracking-[0.5em] text-black/70">
              Mission
            </span>
            <p className="max-w-sm text-sm uppercase tracking-[0.2em] text-black">
              Delay your first usage of nicotine for the day by 1 hour. This
              act will begin to restore your control.
            </p>
            <p className="max-w-sm border-2 border-black bg-neon px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-black">
              This is your Resistance Test.
            </p>
            <button
              onClick={() => setShowMessage(false)}
              className="touch-manipulation border border-black/60 px-4 py-2 text-[0.65rem] uppercase tracking-[0.3em] text-black transition-colors hover:bg-black hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
      <div
        style={{ gridArea: "hub" }}
        className="relative flex items-center justify-center"
      >
        <button
          onClick={handleTacticClick}
          aria-label="Mission"
          className="group relative flex touch-manipulation items-center justify-center outline-none"
        >
          <div
            className={`h-12 w-12 rotate-45 border-2 transition-all duration-500 sm:h-[77px] sm:w-[77px] ${
              viewed
                ? "border-neon-dim shadow-[0_0_10px_var(--neon-dim)]"
                : "animate-pulse border-neon shadow-[0_0_15px_var(--neon),0_0_35px_var(--neon-dim)]"
            }`}
          />
          <span
            className={`absolute text-[0.55rem] uppercase tracking-[0.3em] transition-colors duration-500 sm:text-[0.72rem] sm:tracking-[0.4em] ${
              viewed ? "text-neon-dim" : "text-neon"
            }`}
          >
            Mission
          </span>
        </button>
      </div>
      <ArrowButton
        direction="up"
        href="/throne-room"
        label="Throne Room"
        disabled={!viewed}
      />
      <ArrowButton direction="right" href="/crate" label="Crate" disabled={!viewed} />
      <ArrowButton
        direction="down"
        href="/careful"
        label="Careful"
        disabled={!viewed}
      />
      <ArrowButton direction="left" href="/nicotine" label="Gnome" disabled={!viewed} />
    </div>
  );
}
