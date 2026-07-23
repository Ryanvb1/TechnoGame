"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { REWARD_RARITY_INFO, type RewardRarity } from "./rewardRarity";

type ChestState = "idle" | "opening" | "spinning" | "opened";

const LID_OPEN_MS = 480;
const SPIN_MS = 1150;
const ORB_ANGLES = [0, 120, 240];

// The shared "you won" screen for every mission — a silver chest that
// opens to reveal loot in the mission's own reward-rarity color (see
// BossFightStartMenu, which previews this same color/tier beforehand as a
// locked mystery box). Most missions don't have a specific item defined
// yet (see the itemName/itemIcon comment below) and just show a generic
// mystery reward in that color; more real loot comes later.
export function VictoryScreen({
  title,
  rewardRarity,
  itemName,
  itemIcon,
  onReveal,
  onClose,
}: {
  title: string;
  rewardRarity: RewardRarity;
  // A specific, named item (e.g. the toad's "Rainbow Shell") instead of
  // an unnamed mystery reward — most missions don't have one of these
  // defined yet, so this (and itemIcon) stay optional for now.
  itemName?: string;
  itemIcon?: ReactNode;
  // Fires the instant the chest actually opens (not when this screen
  // mounts) — the right moment for a caller to actually grant an
  // inventory item, so it lines up with the reveal the player sees.
  onReveal?: () => void;
  onClose: () => void;
}) {
  const [state, setState] = useState<ChestState>("idle");
  const info = REWARD_RARITY_INFO[rewardRarity];

  function handleOpen() {
    if (state !== "idle") return;
    setState("opening");
    window.setTimeout(() => {
      setState("spinning");
      window.setTimeout(() => {
        setState("opened");
        onReveal?.();
      }, SPIN_MS);
    }, LID_OPEN_MS);
  }

  const lidOpen = state !== "idle";

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-background/90 px-6 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs uppercase tracking-[0.5em] text-neon-dim">Victory</span>
        <h2 className="text-2xl font-bold uppercase tracking-[0.2em] text-neon">{title}</h2>
      </div>

      <button
        onClick={handleOpen}
        disabled={state !== "idle"}
        aria-label="Open the chest"
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
                    className="h-[17px] w-[17px]"
                    style={{
                      clipPath: "circle(50% at 50% 50%)",
                      background: info.color,
                      boxShadow: `0 0 8px ${info.color}, 0 0 16px ${info.color}99`,
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
                background: `radial-gradient(circle, #ffffff 0%, ${info.color} 45%, transparent 72%)`,
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
              background: "radial-gradient(closest-side, rgba(0,0,0,0.45), transparent 75%)",
            }}
          />

          {/* dark slot revealed once the lid swings open */}
          <div className="absolute bottom-0 left-1/2 h-[67px] w-[115px] -translate-x-1/2 bg-black/50" />

          {/* body — silver */}
          <div
            className="absolute bottom-0 left-1/2 h-[67px] w-[134px] -translate-x-1/2 border border-neon-dim/30 shadow-[0_0_18px_rgba(255,255,255,0.25)]"
            style={{ background: "linear-gradient(180deg, #e8ecf0 0%, #b8c0c8 55%, #6b737c 100%)" }}
          >
            <div className="absolute inset-y-0 left-1/2 w-2 -translate-x-1/2 bg-[#4b525a]" />
          </div>

          {/* lid — positioning (centered, overhanging) is static on an outer
              wrapper; the inner lid only ever animates its own rotation, so
              the two never fight over the `transform` property. */}
          <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: "65px" }}>
            <div
              className="relative h-[34px] w-[154px] border border-neon-dim/30 shadow-[0_0_12px_rgba(200,210,220,0.5)]"
              style={{
                ...(lidOpen
                  ? {
                      transformOrigin: "0% 100%",
                      animationName: "lid-open",
                      animationDuration: `${LID_OPEN_MS}ms`,
                      animationTimingFunction: "ease-in",
                      animationFillMode: "forwards",
                    }
                  : {}),
                background: "linear-gradient(180deg, #e8ecf0 0%, #b8c0c8 55%, #6b737c 100%)",
              }}
            >
              <div className="absolute inset-y-0 left-1/2 w-2 -translate-x-1/2 bg-white/60" />
              <div
                className="absolute left-0 top-0 h-full w-1/3 bg-white/25"
                style={{ clipPath: "polygon(0% 0%, 60% 0%, 20% 100%, 0% 100%)" }}
              />
            </div>
          </div>

          {/* lock gem — colored to the reward's rarity, hides once opened */}
          <div
            className={`absolute left-1/2 h-[14px] w-[14px] -translate-x-1/2 rotate-45 transition-opacity duration-200 ${
              lidOpen ? "opacity-0" : "opacity-100"
            }`}
            style={{ bottom: "94px", background: info.color, boxShadow: `0 0 8px ${info.color}` }}
          />
        </div>

        {state === "idle" && (
          <span className="mt-3 text-[0.6rem] uppercase tracking-[0.3em] text-neon-dim transition-colors group-hover:text-neon">
            Open
          </span>
        )}
      </button>

      {state === "opened" && (
        <div className="flex animate-[item-pop-in_0.4s_ease-out_both] flex-col items-center gap-3">
          {itemIcon ?? (
            <div
              className="flex h-14 w-14 items-center justify-center text-xl font-bold"
              style={{
                background: `linear-gradient(160deg, ${info.color} 0%, rgba(0,0,0,0.35) 130%)`,
                boxShadow: `0 0 14px ${info.color}99`,
                color: "rgba(0,0,0,0.55)",
              }}
            >
              ?
            </div>
          )}
          <p className="text-xl font-bold uppercase tracking-[0.15em]" style={{ color: info.color }}>
            {itemName ?? `${info.label} Reward`}
          </p>
          <p className="text-xs uppercase tracking-[0.3em] text-foreground/50">{info.label}</p>
          <button
            onClick={onClose}
            className="mt-2 touch-manipulation border border-neon-dim px-5 py-2 text-xs uppercase tracking-[0.2em] text-neon-dim transition-colors hover:text-neon"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}
