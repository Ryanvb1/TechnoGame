"use client";

import { useState } from "react";

type CrateState = "idle" | "opening" | "spinning" | "opened";

type DailyItem = {
  name: string;
  price: string;
  href: string;
};

const DAILY_ITEMS: DailyItem[] = [
  { name: "Item One", price: "$--.--", href: "#" },
  { name: "Item Two", price: "$--.--", href: "#" },
  { name: "Item Three", price: "$--.--", href: "#" },
];

const LID_OPEN_MS = 450;
const SPIN_MS = 1150;

// Degrees apart around the orbit — evenly spaced for 3 orbs.
const ORB_ANGLES = [0, 120, 240];

export function CrateOpener() {
  const [state, setState] = useState<CrateState>("idle");

  function handleOpen() {
    if (state !== "idle") return;
    setState("opening");
    setTimeout(() => {
      setState("spinning");
      setTimeout(() => setState("opened"), SPIN_MS);
    }, LID_OPEN_MS);
  }

  const lidOpen = state !== "idle";

  return (
    <div className="flex flex-col items-center gap-14">
      <button
        onClick={handleOpen}
        disabled={state !== "idle"}
        aria-label="Open today's crate"
        className="group relative flex h-48 w-40 flex-col items-center justify-end outline-none disabled:cursor-default"
      >
        {state === "spinning" && (
          <div className="absolute left-1/2 top-6 h-14 w-14 -translate-x-1/2">
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
                    className="h-3.5 w-3.5 bg-neon shadow-[0_0_8px_var(--neon),0_0_16px_var(--neon-dim)]"
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
              className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2"
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

        <div className="relative h-24 w-32">
          {/* dark slot revealed once the lid swings open */}
          <div className="absolute bottom-0 h-14 w-24 bg-black/50" style={{ left: "50%", transform: "translateX(-50%)" }} />
          {/* body */}
          <div className="absolute bottom-0 left-1/2 h-14 w-28 -translate-x-1/2 border border-neon-dim/30 bg-white shadow-[0_0_18px_rgba(255,255,255,0.2)]" />
          {/* lid, overhangs the body and swings open on a bottom hinge */}
          <div
            className="absolute left-1/2 h-7 w-32 border border-neon-dim/30 bg-pink-400 shadow-[0_0_12px_rgba(244,114,182,0.55)]"
            style={
              lidOpen
                ? {
                    bottom: "calc(3.5rem - 2px)",
                    transformOrigin: "bottom center",
                    animationName: "lid-open",
                    animationDuration: `${LID_OPEN_MS}ms`,
                    animationTimingFunction: "ease-in",
                    animationFillMode: "forwards",
                  }
                : {
                    bottom: "calc(3.5rem - 2px)",
                    transformOrigin: "bottom center",
                    transform: "translateX(-50%)",
                  }
            }
          />
          {/* bow */}
          <div
            className={`absolute left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-pink-500 transition-opacity duration-200 ${
              lidOpen ? "opacity-0" : "opacity-100"
            }`}
            style={{ bottom: "calc(3.5rem + 1.75rem - 6px)" }}
          />
        </div>

        {state === "idle" && (
          <span className="absolute -bottom-8 text-[0.6rem] uppercase tracking-[0.3em] text-neon-dim transition-colors group-hover:text-neon">
            Open
          </span>
        )}
      </button>

      {state === "opened" && (
        <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-3">
          {DAILY_ITEMS.map((item, i) => (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{ animationDelay: `${i * 150}ms` }}
              className="flex animate-[item-pop-in_0.4s_ease-out_both] flex-col items-center gap-2 border border-neon-dim px-6 py-8 text-center transition-all duration-200 hover:border-neon hover:shadow-[0_0_20px_var(--neon-dim)]"
            >
              <span className="h-10 w-10 rotate-45 bg-neon-dim shadow-[0_0_10px_var(--neon-dim)]" />
              <span className="text-sm uppercase tracking-[0.2em] text-neon">
                {item.name}
              </span>
              <span className="text-xs text-foreground/60">{item.price}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
