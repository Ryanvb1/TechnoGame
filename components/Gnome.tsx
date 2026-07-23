"use client";

import { useEffect, useState } from "react";
import {
  GNOME_MAX_ORBS,
  GNOME_ORBS_CHANGED_EVENT,
  GNOME_STORAGE_KEY,
  ORB_IDS,
  collectOrb,
  completeOrbMission,
  readGnomeOrbs,
  readOrbMissionCompleted,
  readOrbsCollectedCount,
  startOrbMission,
} from "./gnomeProgress";
import { CatOnBox } from "./CatOnBox";
import { BossFightStartMenu } from "./BossFightStartMenu";
import { VictoryScreen } from "./VictoryScreen";

type Stage =
  | "idle"
  | "menu"
  | "asking"
  | "yes"
  | "no"
  | "full"
  | "mission"
  | "collectOrbs"
  | "orbThanks"
  | "orbVictory";
type Variant = "default" | "female";

const RESPONSE_DISPLAY_MS = 2200;
const ORB_TRAVEL_MS = 600;
const VARIANT_KEY = "techno-gnome-variant";

function readVariant(): Variant {
  if (typeof window === "undefined") return "default";
  return window.localStorage.getItem(VARIANT_KEY) === "female" ? "female" : "default";
}

export function Gnome() {
  // This page is statically generated, so the server/build-time HTML always
  // starts from 0 orbs / the default variant (no localStorage on the
  // server). These effects sync in the real values right after mount — the
  // resulting state updates are what actually repaint the DOM to match; a
  // lazy useState initializer alone computes the right value internally but
  // doesn't force hydration to repaint the tube fill / variant to match it.
  const [orbs, setOrbs] = useState(0);
  const [stage, setStage] = useState<Stage>("idle");
  const [orbAnimKey, setOrbAnimKey] = useState(0);
  const [variant, setVariant] = useState<Variant>("default");
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [collectedOrbCount, setCollectedOrbCount] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage, an external store the server can't see; see comment above.
    setOrbs(readGnomeOrbs());
    setVariant(readVariant());
    setCollectedOrbCount(readOrbsCollectedCount());
  }, []);

  // A CollectibleOrb elsewhere on this same page (e.g. the one tucked
  // behind the mushroom cap on the fairyland page) writes straight to
  // localStorage when collected — that alone doesn't re-render this
  // already-mounted gnome, so the tube would otherwise only catch up on
  // the next full page load. Listens for the event collectOrb() fires
  // instead of polling.
  useEffect(() => {
    function handleOrbsChanged() {
      setOrbs(readGnomeOrbs());
      setCollectedOrbCount(readOrbsCollectedCount());
    }
    window.addEventListener(GNOME_ORBS_CHANGED_EVENT, handleOrbsChanged);
    return () => window.removeEventListener(GNOME_ORBS_CHANGED_EVENT, handleOrbsChanged);
  }, []);

  function chooseVariant(next: Variant) {
    setVariant(next);
    window.localStorage.setItem(VARIANT_KEY, next);
    setCustomizeOpen(false);
  }

  function handleGnomeClick() {
    if (stage !== "idle") return;
    setStage("menu");
  }

  // Finding all the orbs isn't the finish line by itself — the bounty
  // only actually completes once you bring the find back to him in
  // person, which this is: the "Collect Orbs" menu option itself, once
  // there's nothing left to find, becomes that hand-in instead of the
  // normal briefing.
  function handleOpenCollectOrbs() {
    if (collectedOrbCount >= GNOME_MAX_ORBS && !readOrbMissionCompleted()) {
      setStage("orbThanks");
      return;
    }
    setStage("collectOrbs");
  }

  function handleYes() {
    if (orbs >= GNOME_MAX_ORBS) {
      setStage("full");
      setTimeout(() => setStage("idle"), RESPONSE_DISPLAY_MS);
      return;
    }
    const next = orbs + 1;
    setOrbs(next);
    window.localStorage.setItem(GNOME_STORAGE_KEY, String(next));
    setOrbAnimKey((k) => k + 1);
    setStage("yes");
    setTimeout(() => setStage("idle"), RESPONSE_DISPLAY_MS);
  }

  function handleNo() {
    setStage("no");
    setTimeout(() => setStage("idle"), RESPONSE_DISPLAY_MS);
  }

  // The "Collect Orbs" mission's insta-complete — the same fill-to-max
  // shortcut that used to sit directly in this menu as "Test Fill".
  // Actually collects every hidden orb (not just fills the tube) — a plain
  // tube-fill would leave readOrbsCollectedCount() at 0, so returning to
  // the gnome afterward would never reach the "Thank you" hand-in (see
  // handleOpenCollectOrbs above), since that specifically checks each
  // orb's own collected flag, not the shared tube total.
  function handleInstaCollectOrbs() {
    for (const id of ORB_IDS) collectOrb(id);
    setOrbs(readGnomeOrbs());
    setCollectedOrbCount(readOrbsCollectedCount());
    setStage("idle");
  }

  const fillPercent = (orbs / GNOME_MAX_ORBS) * 100;
  const isFemale = variant === "female";

  return (
    <div className="relative flex items-end justify-center gap-2 pt-20 sm:gap-8">
      {orbAnimKey > 0 && stage === "yes" && (
        <div
          key={orbAnimKey}
          className="pointer-events-none absolute bottom-20 left-[calc(50%-38px)] h-[14px] w-[14px]"
          style={{
            clipPath: "circle(50% at 50% 50%)",
            background: "var(--neon)",
            boxShadow: "0 0 8px var(--neon), 0 0 16px var(--neon-dim)",
            animationName: "gnome-orb-drop",
            animationDuration: `${ORB_TRAVEL_MS}ms`,
            animationTimingFunction: "ease-in",
            animationFillMode: "forwards",
          }}
        />
      )}

      {/* customize dropdown, to the left of the gnome — a solid dark
          backdrop with a bright gold border/text so it stays readable
          against the dirt/grass scene behind it, not just the dim neon
          green that used to blend into the ground */}
      <div className="relative mb-4 flex flex-col items-center">
        {/* cat perched up above the customize bar, top-left of the scene */}
        <div className="pointer-events-none absolute bottom-full left-0 mb-3">
          <CatOnBox />
        </div>
        <button
          onClick={() => setCustomizeOpen((o) => !o)}
          className="touch-manipulation border-2 border-[#ffd98a] bg-background/90 px-1.5 py-1 text-[0.5rem] uppercase tracking-[0.15em] text-[#ffd98a] shadow-[0_0_10px_rgba(0,0,0,0.6)] transition-colors hover:bg-[#ffd98a] hover:text-background sm:px-3 sm:py-2 sm:text-[0.6rem] sm:tracking-[0.2em]"
        >
          Customize
        </button>
        {customizeOpen && (
          <div className="absolute top-full z-10 mt-1 flex w-full flex-col border-2 border-[#ffd98a] bg-background/95 shadow-[0_0_15px_rgba(0,0,0,0.7)]">
            <button
              onClick={() => chooseVariant("default")}
              className="touch-manipulation px-3 py-2 text-left text-[0.6rem] uppercase tracking-[0.2em] text-sky-400 transition-colors hover:bg-white/10"
            >
              Male
            </button>
            <button
              onClick={() => chooseVariant("female")}
              className="touch-manipulation px-3 py-2 text-left text-[0.6rem] uppercase tracking-[0.2em] text-pink-400 transition-colors hover:bg-white/10"
            >
              Female
            </button>
          </div>
        )}
      </div>

      <div className="relative flex flex-col items-center">
        {stage !== "idle" && (
          <div className="absolute bottom-full mb-4 w-72 border border-neon-dim bg-background/95 px-4 py-3 text-center text-xs text-foreground shadow-[0_0_15px_var(--neon-dim)]">
            {stage === "menu" && (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setStage("mission")}
                  className="touch-manipulation uppercase tracking-[0.2em] text-neon transition-colors hover:text-white"
                >
                  Mission
                </button>
                <button
                  onClick={() => setStage("asking")}
                  className="touch-manipulation uppercase tracking-[0.2em] text-neon transition-colors hover:text-white"
                >
                  Check In
                </button>
                <button
                  onClick={handleOpenCollectOrbs}
                  className="touch-manipulation uppercase tracking-[0.2em] text-neon transition-colors hover:text-white"
                >
                  Collect Orbs ({collectedOrbCount}/{GNOME_MAX_ORBS})
                </button>
              </div>
            )}
            {stage === "orbThanks" && (
              <div className="flex flex-col gap-3">
                <p>&quot;Thank you, good luck in the throne.&quot;</p>
                <button
                  onClick={() => {
                    completeOrbMission();
                    setStage("orbVictory");
                  }}
                  className="touch-manipulation uppercase tracking-[0.2em] text-neon transition-colors hover:text-white"
                >
                  Continue
                </button>
              </div>
            )}
            {stage === "asking" && (
              <>
                <p className="mb-3">Did you complete your resistance test?</p>
                <div className="flex justify-center gap-6">
                  <button
                    onClick={handleYes}
                    className="touch-manipulation uppercase tracking-[0.2em] text-neon transition-colors hover:text-white"
                  >
                    Yes
                  </button>
                  <button
                    onClick={handleNo}
                    className="touch-manipulation uppercase tracking-[0.2em] text-neon-dim transition-colors hover:text-neon"
                  >
                    No
                  </button>
                </div>
              </>
            )}
            {stage === "mission" && (
              <div className="flex flex-col gap-3">
                <p className="uppercase tracking-[0.4em] text-neon">Mission</p>
                <p>
                  Delay your first usage of nicotine for the day by 1 hour.
                  This act will begin to restore your control.
                </p>
                <p className="font-bold uppercase tracking-[0.15em] text-neon-dim">
                  This is your Resistance Test.
                </p>
                <button
                  onClick={() => setStage("idle")}
                  className="touch-manipulation uppercase tracking-[0.2em] text-neon-dim transition-colors hover:text-neon"
                >
                  Close
                </button>
              </div>
            )}
            {stage === "yes" && <p>Well done. Keep going.</p>}
            {stage === "no" && <p>Return to me when you have progressed.</p>}
            {stage === "full" && <p>Look how far you&apos;ve come.</p>}
          </div>
        )}

        {stage === "collectOrbs" && (
          <BossFightStartMenu
            title="Collect Orbs"
            concept="medium"
            gameplay="easy"
            rewardRarity="uncommon"
            beginLabel="Got It"
            description={
              <div className="flex flex-col items-center gap-3">
                <div
                  className="h-10 w-10 animate-[fire-glow-pulse_2.6s_ease-in-out_infinite]"
                  style={{
                    clipPath: "circle(50% at 50% 50%)",
                    background: "linear-gradient(180deg, #7dd3fc 0%, #0ea5e9 100%)",
                    boxShadow: "0 0 10px rgba(56,189,248,0.8), 0 0 20px rgba(56,189,248,0.5)",
                  }}
                />
                <p>&quot;Find me these and I will grant you opportunity.&quot;</p>
              </div>
            }
            // Unlike the others, backing out doesn't undo anything — the
            // orbs, once the mission's begun, stay in the world across
            // visits regardless of how this particular briefing is closed.
            // Reloads (same as ResetButton) rather than just closing the
            // menu — any CollectibleOrb already mounted on this same page
            // (like this scene's own orb) only checks localStorage once,
            // on mount, so it needs a fresh mount to notice the mission
            // just started.
            onBegin={() => {
              startOrbMission();
              window.location.reload();
            }}
            onBack={() => setStage("idle")}
            onInstaComplete={handleInstaCollectOrbs}
          />
        )}

        {stage === "orbVictory" && (
          <VictoryScreen title="Orbs Collected" rewardRarity="uncommon" onClose={() => setStage("idle")} />
        )}

        {/* ambient presence glow */}
        <div
          className="absolute bottom-7 h-[154px] w-[154px] animate-[fire-glow-pulse_4s_ease-in-out_infinite]"
          style={{
            background: isFemale
              ? "radial-gradient(closest-side, rgba(240,87,158,0.32), transparent 70%)"
              : "radial-gradient(closest-side, rgba(64,170,255,0.32), transparent 70%)",
          }}
        />

        {/* button is sized wider/taller than the body so the arms, hand, and
            cane (all absolutely positioned, so they don't otherwise grow the
            layout box) stay inside the clickable/tappable hit area */}
        <button
          onClick={handleGnomeClick}
          aria-label="Talk to the gnome"
          className="group relative flex touch-manipulation flex-col items-center outline-none"
          style={{ minWidth: 210 }}
        >
          {/* hat */}
          <div
            className="relative h-12 w-12"
            style={{
              clipPath: "polygon(50% 0%, 88% 100%, 12% 100%)",
              background: isFemale
                ? "linear-gradient(160deg, #ff8fc0 0%, #f0579e 35%, #b8286e 100%)"
                : "linear-gradient(160deg, #f05a48 0%, #e04b3b 35%, #a12419 100%)",
            }}
          >
            {isFemale && (
              <div
                className="absolute left-[68%] top-[55%] h-[13px] w-[13px]"
                style={{
                  clipPath:
                    "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
                  background: "#ffe38a",
                  boxShadow: "0 0 6px rgba(255,227,138,0.8)",
                }}
              />
            )}
          </div>
          <div
            className="-mt-0.5 h-2.5 w-[67px]"
            style={{
              background: isFemale
                ? "linear-gradient(180deg, #8a1f5a 0%, #5e1340 100%)"
                : "linear-gradient(180deg, #8a2317 0%, #5e130b 100%)",
            }}
          />

          {/* face */}
          <div
            className="relative mt-1.5 h-[38px] w-[48px]"
            style={{
              clipPath: "circle(50% at 50% 40%)",
              background:
                "radial-gradient(circle at 35% 30%, #f3cda2 0%, #e8b98a 55%, #c99567 100%)",
            }}
          >
            <div className="absolute left-[28%] top-[26%] h-[5px] w-[5px] bg-[#3a2417]" />
            <div className="absolute right-[28%] top-[26%] h-[5px] w-[5px] bg-[#3a2417]" />
            <div className="absolute left-[24%] top-[20%] h-[3px] w-[9px] -rotate-[8deg] bg-[#8a6743]/70" />
            <div className="absolute right-[24%] top-[20%] h-[3px] w-[9px] rotate-[8deg] bg-[#8a6743]/70" />
            <div
              className="absolute left-1/2 top-[42%] h-[9px] w-[8px] -translate-x-1/2"
              style={{ clipPath: "circle(50% at 50% 50%)", background: "#d89f72" }}
            />
            {isFemale && (
              <>
                <div
                  className="absolute left-[8%] top-[50%] h-[8px] w-[8px]"
                  style={{ clipPath: "circle(50% at 50% 50%)", background: "#e8779a", opacity: 0.6 }}
                />
                <div
                  className="absolute right-[8%] top-[50%] h-[8px] w-[8px]"
                  style={{ clipPath: "circle(50% at 50% 50%)", background: "#e8779a", opacity: 0.6 }}
                />
                {/* braids hanging beside the face instead of a beard */}
                <div
                  className="absolute left-[2%] top-[55%] h-[70px] w-[14px]"
                  style={{
                    clipPath: "polygon(30% 0%, 70% 0%, 60% 100%, 40% 100%)",
                    background:
                      "linear-gradient(180deg, #f2efe8 0%, #d8d3c8 60%, #b8b0a0 100%)",
                  }}
                />
                <div
                  className="absolute right-[2%] top-[55%] h-[70px] w-[14px]"
                  style={{
                    clipPath: "polygon(30% 0%, 70% 0%, 60% 100%, 40% 100%)",
                    background:
                      "linear-gradient(180deg, #f2efe8 0%, #d8d3c8 60%, #b8b0a0 100%)",
                  }}
                />
              </>
            )}
          </div>

          {/* beard (default variant only) — small, leaving the neck
              visible below the chin, its bottom just overlapping the top
              of the chest rather than filling the whole neck */}
          {!isFemale && (
            <div
              className="-mt-1 h-6 w-8"
              style={{
                clipPath:
                  "polygon(32% 0%, 68% 0%, 100% 45%, 68% 100%, 50% 82%, 32% 100%, 0% 45%)",
                background:
                  "linear-gradient(180deg, #ffffff 0%, #f7f2e8 45%, #d8cdb8 100%)",
              }}
            />
          )}

          {/* torso/dress + arms + cane */}
          <div className={isFemale ? "relative mt-1" : "relative -mt-2"}>
            <div
              className="absolute -left-[23px] top-2.5 h-[17px] w-[52px] rotate-[-24deg]"
              style={{
                background: isFemale
                  ? "linear-gradient(180deg, #f0579e 0%, #a8206e 100%)"
                  : "linear-gradient(180deg, #3a8fc0 0%, #1c4d6e 100%)",
              }}
            />
            <div
              className="absolute -left-[29px] top-6 h-3 w-3"
              style={{ clipPath: "circle(50% at 50% 50%)", background: "#e8b98a" }}
            />
            <div
              className="absolute -right-[23px] top-2.5 h-[17px] w-[52px] rotate-[24deg]"
              style={{
                background: isFemale
                  ? "linear-gradient(180deg, #f0579e 0%, #a8206e 100%)"
                  : "linear-gradient(180deg, #3a8fc0 0%, #1c4d6e 100%)",
              }}
            />
            <div
              className="absolute -right-[29px] top-6 h-3 w-3"
              style={{ clipPath: "circle(50% at 50% 50%)", background: "#e8b98a" }}
            />

            {/* cane, gripped by the right hand and planted to the ground —
                its bottom edge lines up with the shoes' bottom edge (further
                down for the default variant, which has a separate legs row
                the female variant's longer dress skips), not an arbitrary
                offset, so it never reaches below the button's own hit area */}
            <div
              className="absolute -right-[26px] w-[3px] bg-gradient-to-b from-[#a3703a] to-[#5c3a1a]"
              style={{ top: "22px", bottom: isFemale ? "-9px" : "-35px" }}
            />
            <div className="absolute -right-[33px] top-[18px] h-[3px] w-[13px] bg-[#5c3a1a]" />

            {isFemale ? (
              <div
                className="relative h-[106px] w-[100px]"
                style={{
                  clipPath:
                    "polygon(35% 0%, 65% 0%, 100% 92%, 85% 100%, 15% 100%, 0% 92%)",
                  background:
                    "linear-gradient(160deg, #ff8fc0 0%, #e0579e 35%, #a8206e 100%)",
                }}
              >
                <div className="absolute bottom-[24px] left-1/2 h-[42px] w-[68px] -translate-x-1/2 bg-white/20" />
                <div className="absolute bottom-[64px] left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-[#ffe38a]" />
              </div>
            ) : (
              <div
                className="relative h-[77px] w-[96px]"
                style={{
                  clipPath: "polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)",
                  background:
                    "linear-gradient(160deg, #4098c9 0%, #2f7fb0 35%, #1c4d6e 100%)",
                }}
              >
                <div className="absolute bottom-[19px] left-0 h-[7px] w-full bg-gradient-to-b from-[#e0b658] to-[#a67d2e]" />
                <div className="absolute bottom-[8px] left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-[#caa243]" />
              </div>
            )}
          </div>

          {/* legs (default variant only — the dress covers this on the
              female variant) */}
          {!isFemale && (
            <div className="-mt-1 flex gap-2">
              <div className="h-[29px] w-6 bg-gradient-to-b from-[#5c4020] to-[#3a2810]" />
              <div className="h-[29px] w-6 bg-gradient-to-b from-[#5c4020] to-[#3a2810]" />
            </div>
          )}
          {/* shoes */}
          <div className="-mt-0.5 flex gap-2">
            <div
              className="h-3 w-[29px]"
              style={{
                clipPath: "polygon(0% 0%, 100% 0%, 100% 55%, 55% 100%, 0% 100%)",
                background: "linear-gradient(180deg,#3a2a18,#241708)",
              }}
            />
            <div
              className="h-3 w-[29px]"
              style={{
                clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 45% 100%, 0% 55%)",
                background: "linear-gradient(180deg,#3a2a18,#241708)",
              }}
            />
          </div>
        </button>
      </div>

      <div className="relative h-36 w-8 border border-white/30 bg-white/5 sm:h-48 sm:w-12">
        <div
          className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-sky-500 to-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.6)] transition-[height] duration-500 ease-out"
          style={{ height: `${fillPercent}%` }}
        />
        <div className="absolute inset-y-0 left-1 w-1 bg-white/20" />
      </div>
    </div>
  );
}
