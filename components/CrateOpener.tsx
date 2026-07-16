"use client";

import { useState } from "react";

type CrateState = "idle" | "opening" | "opened";

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

const SHAKE_DURATION_MS = 500;

export function CrateOpener() {
  const [state, setState] = useState<CrateState>("idle");

  function handleOpen() {
    if (state !== "idle") return;
    setState("opening");
    setTimeout(() => setState("opened"), SHAKE_DURATION_MS);
  }

  return (
    <div className="flex flex-col items-center gap-12">
      <button
        onClick={handleOpen}
        disabled={state !== "idle"}
        aria-label="Open today's crate"
        className="group relative flex h-40 w-40 items-center justify-center outline-none disabled:cursor-default"
      >
        <span
          className={`h-28 w-28 rotate-45 border-2 border-neon-dim bg-neon-dim/10 shadow-[0_0_15px_var(--neon-dim)] ${
            state === "idle"
              ? "transition-all duration-300 group-hover:border-neon group-hover:bg-neon/10 group-hover:shadow-[0_0_25px_var(--neon)]"
              : ""
          } ${state === "opening" ? "animate-[crate-shake_0.5s_ease-in-out]" : ""} ${
            state === "opened" ? "animate-[crate-burst_0.4s_ease-out_forwards]" : ""
          }`}
        />
        {state === "idle" && (
          <span className="absolute text-[0.6rem] uppercase tracking-[0.3em] text-neon-dim transition-colors group-hover:text-neon">
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
