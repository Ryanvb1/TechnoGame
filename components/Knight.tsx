"use client";

import { useState } from "react";
import { GNOME_MAX_ORBS, readGnomeOrbs } from "./gnomeProgress";

type Stage = "idle" | "asking" | "place" | "who";

const RESPONSE_DISPLAY_MS = 3200;

export function Knight() {
  const [visible] = useState(() => readGnomeOrbs() >= GNOME_MAX_ORBS);
  const [stage, setStage] = useState<Stage>("idle");

  if (!visible) return null;

  function handleClick() {
    if (stage !== "idle") return;
    setStage("asking");
  }

  function ask(choice: "place" | "who") {
    setStage(choice);
    setTimeout(() => setStage("idle"), RESPONSE_DISPLAY_MS);
  }

  return (
    <div className="relative flex flex-col items-center">
      {stage !== "idle" && (
        <div className="absolute bottom-full mb-4 w-64 border border-neon-dim bg-background/95 px-4 py-3 text-center text-xs text-foreground shadow-[0_0_15px_var(--neon-dim)]">
          {stage === "asking" && (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => ask("place")}
                className="touch-manipulation uppercase tracking-[0.15em] text-neon transition-colors hover:text-white"
              >
                What is this place?
              </button>
              <button
                onClick={() => ask("who")}
                className="touch-manipulation uppercase tracking-[0.15em] text-neon transition-colors hover:text-white"
              >
                Who are you?
              </button>
            </div>
          )}
          {stage === "place" && (
            <p>
              A treasury older than memory. Only the worthy may claim what
              lies within.
            </p>
          )}
          {stage === "who" && (
            <p>
              The last of those sworn to guard this room. Time is not so kind
              to knights.
            </p>
          )}
        </div>
      )}

      {/* button is wider than the armor so the sword — nested in a wrapper
          matching the torso's footprint, reaching up to 80px past that
          wrapper's edge for the hilt — has enough centered margin to stay
          inside the clickable/tappable hit area */}
      <button
        onClick={handleClick}
        aria-label="Speak with the knight"
        className="group relative flex touch-manipulation flex-col items-center outline-none"
        style={{ minWidth: 290 }}
      >
        {/* cape */}
        <div
          className="absolute top-[54px] h-[156px] w-[129px]"
          style={{
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            background: "linear-gradient(180deg, #7a1220 0%, #4a0b14 100%)",
            opacity: 0.9,
          }}
        />

        {/* helmet */}
        <div
          className="relative h-[65px] w-[57px]"
          style={{
            clipPath:
              "polygon(20% 0%, 80% 0%, 100% 35%, 100% 100%, 0% 100%, 0% 35%)",
            background:
              "linear-gradient(160deg, #b7c0ca 0%, #9aa3ad 35%, #5b636c 100%)",
          }}
        >
          <div className="absolute left-1/2 top-[45%] h-[11px] w-9 -translate-x-1/2 bg-black/70" />
          <div className="absolute left-1/2 top-1/3 h-[15px] w-[8px] -translate-x-1/2 bg-[#3a3f45]" />
          <div className="absolute left-[6px] top-[6px] h-[6px] w-[18px] bg-white/30" />
        </div>
        {/* plume: a normal flow element (not absolutely positioned) so its
            tip is counted as part of the button's own height and hit area,
            instead of poking out above it */}
        <div
          className="h-[29px] w-[15px]"
          style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)", background: "#6b1520" }}
        />

        {/* shoulders/torso with a shield emblem and rivets. The sword sits
            in a plain (unclipped) wrapper matching the torso's footprint,
            not directly on the button, so minWidth's centering margin
            actually contains its reach instead of the sword floating a
            fixed distance past the button's own edge regardless of width */}
        <div className="relative -mt-[9px] h-[116px] w-[116px]">
          <div
            className="absolute inset-0"
            style={{
              clipPath:
                "polygon(15% 0%, 85% 0%, 100% 20%, 88% 100%, 12% 100%, 0% 20%)",
              background:
                "linear-gradient(160deg, #a3acb6 0%, #8a929c 35%, #4b525a 100%)",
            }}
          >
            <div
              className="absolute left-1/2 top-[30%] h-[44px] w-[44px] -translate-x-1/2 border border-yellow-600/60"
              style={{
                clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                background: "linear-gradient(180deg, #caa243 0%, #7d5c1f 100%)",
              }}
            />
            <div className="absolute left-[16%] top-[14%] h-[8px] w-[8px] bg-black/40" />
            <div className="absolute right-[16%] top-[14%] h-[8px] w-[8px] bg-black/40" />
            <div className="absolute left-[16%] bottom-[10%] h-[8px] w-[8px] bg-black/40" />
            <div className="absolute right-[16%] bottom-[10%] h-[8px] w-[8px] bg-black/40" />
          </div>

          {/* sword resting beside him */}
          <div className="absolute -right-[44px] top-[44px] h-[155px] w-[11px] bg-gradient-to-b from-[#e4e9ee] to-[#8b9299]" />
          <div className="absolute -right-[51px] top-[36px] h-[11px] w-[29px] bg-[#caa243]" />
        </div>

        {/* arms */}
        <div className="absolute left-[15px] top-[65px] h-[72px] w-[29px] bg-gradient-to-b from-[#a3acb6] to-[#4b525a]" />
        <div className="absolute right-[15px] top-[65px] h-[72px] w-[29px] bg-gradient-to-b from-[#a3acb6] to-[#4b525a]" />

        {/* legs */}
        <div className="-mt-[9px] flex gap-[11px]">
          <div className="h-[87px] w-[44px] bg-gradient-to-b from-[#8d959e] to-[#454b52]" />
          <div className="h-[87px] w-[44px] bg-gradient-to-b from-[#8d959e] to-[#454b52]" />
        </div>
        {/* feet */}
        <div className="-mt-[6px] flex gap-[11px]">
          <div className="h-[18px] w-[51px] bg-[#2c2f33]" />
          <div className="h-[18px] w-[51px] bg-[#2c2f33]" />
        </div>
      </button>
    </div>
  );
}
