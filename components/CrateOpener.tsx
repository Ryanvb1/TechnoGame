"use client";

import { useState } from "react";
import { addRainbowBalls, rollRainbowBallDrop } from "./rainbowBalls";
import { RainbowBallPile } from "./RainbowBallPile";

type CrateState = "idle" | "opening" | "spinning" | "opened";

const LID_OPEN_MS = 480;
const SPIN_MS = 1150;

// Degrees apart around the orbit — evenly spaced for 3 orbs.
const ORB_ANGLES = [0, 120, 240];

export function CrateOpener() {
  const [state, setState] = useState<CrateState>("idle");
  const [drop, setDrop] = useState(0);
  const [total, setTotal] = useState(0);

  function handleOpen() {
    if (state !== "idle") return;
    setState("opening");
    setTimeout(() => {
      setState("spinning");
      setTimeout(() => {
        const amount = rollRainbowBallDrop();
        setDrop(amount);
        setTotal(addRainbowBalls(amount));
        setState("opened");
      }, SPIN_MS);
    }, LID_OPEN_MS);
  }

  const lidOpen = state !== "idle";

  return (
    <div className="flex flex-col items-center gap-14">
      <button
        onClick={handleOpen}
        disabled={state !== "idle"}
        aria-label="Open today's crate"
        className="group relative flex h-[230px] w-[220px] touch-manipulation flex-col items-center justify-end outline-none disabled:cursor-default"
      >
        {state === "spinning" && (
          <div className="absolute left-1/2 top-[29px] h-[67px] w-[67px] -translate-x-1/2">
            <div
              className="absolute inset-0"
              style={{
                animationName: "orb-spin",
                animationDuration: `${SPIN_MS}ms`,
                animationTimingFunction: "cubic-bezier(0.6, 0.04, 0.98, 0.34)",
                animationFillMode: "forwards",
              }}
            >
              {ORB_ANGLES.map((angle) => (
                <div
                  key={angle}
                  className="absolute left-1/2 top-1/2"
                  style={{ transform: `translate(-50%, -50%) rotate(${angle}deg)` }}
                >
                  <div
                    className="h-[17px] w-[17px] bg-neon shadow-[0_0_8px_var(--neon),0_0_16px_var(--neon-dim)]"
                    style={{
                      clipPath: "circle(50% at 50% 50%)",
                      animationName: "orb-converge",
                      animationDuration: `${SPIN_MS}ms`,
                      animationTimingFunction: "ease-in",
                      animationFillMode: "forwards",
                    }}
                  />
                </div>
              ))}
            </div>
            <div
              className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2"
              style={{
                background:
                  "radial-gradient(circle, #ffffff 0%, var(--neon) 45%, transparent 72%)",
                clipPath: "circle(50% at 50% 50%)",
                animationName: "orb-flash",
                animationDuration: "350ms",
                animationDelay: `${SPIN_MS - 350}ms`,
                animationTimingFunction: "ease-out",
                animationFillMode: "both",
              }}
            />
          </div>
        )}

        <div className="relative h-[115px] w-[154px]">
          {/* soft contact shadow grounding the box */}
          <div
            className="absolute -bottom-2 left-1/2 h-3 w-[130px] -translate-x-1/2"
            style={{
              clipPath: "ellipse(50% 50% at 50% 50%)",
              background:
                "radial-gradient(closest-side, rgba(0,0,0,0.45), transparent 75%)",
            }}
          />

          {/* dark slot revealed once the lid swings open */}
          <div
            className="absolute bottom-0 left-1/2 h-[67px] w-[115px] -translate-x-1/2 bg-black/50"
          />

          {/* body */}
          <div
            className="absolute bottom-0 left-1/2 h-[67px] w-[134px] -translate-x-1/2 border border-neon-dim/30 shadow-[0_0_18px_rgba(255,255,255,0.2)]"
            style={{
              background:
                "linear-gradient(180deg, #ffffff 0%, #f2f0eb 55%, #ddd9d0 100%)",
            }}
          >
            <div className="absolute inset-y-0 left-1/2 w-2 -translate-x-1/2 bg-[#f6c7dc]" />
          </div>

          {/* lid — positioning (centered, overhanging) is static on an outer
              wrapper; the inner lid only ever animates its own rotation, so
              the two never fight over the `transform` property. */}
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{ bottom: "65px" }}
          >
            <div
              className="relative h-[34px] w-[154px] border border-neon-dim/30 shadow-[0_0_12px_rgba(244,114,182,0.55)]"
              style={
                lidOpen
                  ? {
                      transformOrigin: "0% 100%",
                      animationName: "lid-open",
                      animationDuration: `${LID_OPEN_MS}ms`,
                      animationTimingFunction: "ease-in",
                      animationFillMode: "forwards",
                      background:
                        "linear-gradient(180deg, #ff9fc4 0%, #f472b6 55%, #c65490 100%)",
                    }
                  : {
                      background:
                        "linear-gradient(180deg, #ff9fc4 0%, #f472b6 55%, #c65490 100%)",
                    }
              }
            >
              <div className="absolute inset-y-0 left-1/2 w-2 -translate-x-1/2 bg-white/60" />
              <div className="absolute left-0 top-0 h-full w-1/3 bg-white/25" style={{ clipPath: "polygon(0% 0%, 60% 0%, 20% 100%, 0% 100%)" }} />
            </div>
          </div>

          {/* bow */}
          <div
            className={`absolute left-1/2 h-[14px] w-[14px] -translate-x-1/2 rotate-45 bg-pink-500 shadow-[0_0_6px_rgba(244,114,182,0.7)] transition-opacity duration-200 ${
              lidOpen ? "opacity-0" : "opacity-100"
            }`}
            style={{ bottom: "94px" }}
          />
        </div>

        {state === "idle" && (
          // A normal flow element (not absolutely positioned) so its height,
          // plus the margin below the crate, is counted as part of the
          // button's own box — creating room below the crate visual for its
          // grounding shadow too, instead of both escaping past the
          // button's bottom edge regardless of the button's own height.
          <span className="mt-3 text-[0.6rem] uppercase tracking-[0.3em] text-neon-dim transition-colors group-hover:text-neon">
            Open
          </span>
        )}
      </button>

      {state === "opened" && (
        <div className="flex animate-[item-pop-in_0.4s_ease-out_both] flex-col items-center gap-3">
          <RainbowBallPile />
          <p className="text-2xl font-bold uppercase tracking-[0.15em] text-neon drop-shadow-[0_0_10px_var(--neon)]">
            +{drop} Rainbow Balls
          </p>
          <p className="text-xs uppercase tracking-[0.3em] text-foreground/50">
            {total.toLocaleString()} total
          </p>
        </div>
      )}
    </div>
  );
}
