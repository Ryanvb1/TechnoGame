import type { ReactNode } from "react";
import { ScaredSnail } from "./ScaredSnail";
import { COLUMNS, ROWS, containsQuadrant, sameQuadrant, type Column, type Quadrant } from "./caveBearGrid";
import { PANELS_RESULT_HOLD_MS, ROAR_TELEGRAPH_MS } from "./caveBearFightConfig";
import type { ActiveAttack } from "./useCaveBearSurvivalPhase";

// Portaled by CaveBearFight straight into CaveBackground's own floor-content
// slot (see CaveBackground.tsx) — this renders *inside* the cave's real
// tilted floor plane (the same perspective/rotateX 3D transform, not a copy
// of it), so the quadrants are a genuine subdivision of that floor rather
// than a separate flat panel sitting near it. Flat content here (cell
// tints, claw marks, dividers) naturally inherits the floor's own tilt;
// anything that needs to stay upright (the player's own sprite, the
// torches, falling rocks) counter-rotates against that same tilt via
// ROTATE_X_DEG below.

// Must match CaveBackground's floor `rotateX(58deg)` exactly — counter-
// rotating by this same angle is what keeps upright content (the player
// token, torches, rocks) from being squashed flat by the floor's own tilt.
const ROTATE_X_DEG = 58;

// Where the 2x3 band sits within the floor's own (pre-transform) rectangle,
// in percentages of that rectangle — tuned by eye against where CaveBear
// himself is positioned in normal flow above it, not derived from any
// exact formula.
const BAND_LEFT_PCT = 27;
const BAND_WIDTH_PCT = 46;
const FAR_ROW_TOP_PCT = 50;
const FAR_ROW_HEIGHT_PCT = 20;
const NEAR_ROW_TOP_PCT = 72;
const NEAR_ROW_HEIGHT_PCT = 24;
const TORCH_TOP_PCT = 40;

const COL_WIDTH_PCT = BAND_WIDTH_PCT / 3;

// How long a WASD step visibly takes to travel between quadrants, rather
// than teleporting — applied to the token's own left/top transition.
const MOVE_TRAVEL_MS = 260;

const ATTACK_COLOR: Record<"panels" | "scratch" | "roar", string> = {
  panels: "#ff6a3d", // the same red the old Body Slam used, per the user
  scratch: "#ff3b3b",
  roar: "#ffb238",
};
const PANELS_CORRECT_COLOR = "var(--neon)";

const ROW_GEOMETRY: Record<0 | 1, { top: number; height: number }> = {
  0: { top: FAR_ROW_TOP_PCT, height: FAR_ROW_HEIGHT_PCT },
  1: { top: NEAR_ROW_TOP_PCT, height: NEAR_ROW_HEIGHT_PCT },
};

function columnLeftPct(col: Column) {
  return BAND_LEFT_PCT + col * COL_WIDTH_PCT;
}

function quadrantCenterPct(q: Quadrant) {
  const { top, height } = ROW_GEOMETRY[q.row];
  return { left: columnLeftPct(q.col) + COL_WIDTH_PCT / 2, top: top + height / 2 };
}

export function CaveBearArenaGrid({
  playerQuadrant,
  jumping,
  litColumn,
  activeAttack,
}: {
  playerQuadrant: Quadrant;
  jumping: boolean;
  litColumn: Column;
  activeAttack: ActiveAttack;
}) {
  const roaring = activeAttack?.kind === "roar";
  // A brief rattle right as the rocks actually land — set directly on this
  // always-mounted root (never remounted), so toggling the animation
  // string on/off restarts it cleanly each time without any key tricks.
  const shaking = roaring && activeAttack.stage === "resolve";
  const playerTargeted =
    !!activeAttack &&
    activeAttack.kind !== "panels" &&
    activeAttack.stage === "resolve" &&
    containsQuadrant(activeAttack.targetQuadrants, playerQuadrant);
  // Falling Panels' miss check always resolves against wherever the player
  // is actually standing (that's the plate that breaks), so no quadrant
  // comparison is needed here — the attack kind + result alone tell us.
  const playerFalling = activeAttack?.kind === "panels" && activeAttack.stage === "recite" && activeAttack.checkResult === "wrong";
  const playerCenter = quadrantCenterPct(playerQuadrant);
  const playerFar = playerQuadrant.row === 0;

  return (
    <div
      className="absolute inset-0"
      style={{ transformStyle: "preserve-3d", animation: shaking ? "roar-screen-shake 450ms ease-in-out" : "none" }}
    >
      {/* The molten floor beneath every plate — always mounted but normally
          fully hidden behind their opaque stone tops; only reads once a
          plate actually crumbles away during Falling Panels' recite phase. */}
      <LavaField />

      {COLUMNS.map((col) => (
        <Upright key={col} leftPct={columnLeftPct(col) + COL_WIDTH_PCT / 2} topPct={TORCH_TOP_PCT}>
          <Torch lit={col === litColumn} />
        </Upright>
      ))}

      {ROWS.map((row) =>
        COLUMNS.map((col) => {
          const quadrant: Quadrant = { row, col };
          let telegraphing = false;
          let resolving = false;
          let clawing = false;
          let panelsLit = false;
          let panelsCorrect = false;
          let panelsFalling = false;

          if (activeAttack?.kind === "scratch") {
            resolving = containsQuadrant(activeAttack.targetQuadrants, quadrant);
            clawing = resolving;
          } else if (activeAttack?.kind === "roar") {
            const targeted = containsQuadrant(activeAttack.targetQuadrants, quadrant);
            telegraphing = targeted && activeAttack.stage === "telegraph";
            resolving = targeted && activeAttack.stage === "resolve";
          } else if (activeAttack?.kind === "panels") {
            if (activeAttack.stage === "reveal") {
              panelsLit = !!activeAttack.litQuadrant && sameQuadrant(activeAttack.litQuadrant, quadrant);
            } else {
              const isCheckTile = !!activeAttack.checkQuadrant && sameQuadrant(activeAttack.checkQuadrant, quadrant);
              panelsCorrect = isCheckTile && activeAttack.checkResult === "correct";
              panelsFalling = isCheckTile && activeAttack.checkResult === "wrong";
            }
          }

          const lit = col === litColumn;
          const { top, height } = ROW_GEOMETRY[row];
          return (
            <div
              key={`${row}-${col}`}
              className="absolute transition-[box-shadow] duration-200"
              style={{
                left: `${columnLeftPct(col)}%`,
                width: `${COL_WIDTH_PCT}%`,
                top: `${top}%`,
                height: `${height}%`,
                // transform-style: preserve-3d — *not* overflow-hidden, which
                // the CSS Transforms spec forces to flatten its subtree
                // regardless of this setting, breaking the player token's
                // own counter-rotation below. The telegraph/resolve tints
                // are sized via inset percentages of this same box, so
                // nothing needs clipping to stay within it anyway.
                transformStyle: "preserve-3d",
                backgroundImage:
                  "radial-gradient(circle, rgba(0,0,0,0.4) 0 2px, transparent 3px), radial-gradient(circle, rgba(255,255,255,0.05) 0 1.5px, transparent 2.5px)",
                backgroundSize: "22px 22px, 13px 13px",
                backgroundPosition: "0 0, 7px 5px",
                backgroundColor: "#241a14",
                boxShadow: lit ? "inset 0 0 0 1px rgba(255,178,56,0.35)" : "inset 0 0 0 1px rgba(255,255,255,0.06)",
                // The plate breaking away and dropping into the lava now
                // showing through beneath it — a one-shot animation rather
                // than a plain opacity toggle, so it reads as physically
                // falling rather than just vanishing.
                animation: panelsFalling ? `plate-crumble ${PANELS_RESULT_HOLD_MS}ms ease-in forwards` : undefined,
              }}
            >
              {lit && (
                <div
                  className="pointer-events-none absolute inset-0 animate-[fire-glow-pulse_2.4s_ease-in-out_infinite]"
                  style={{ background: "linear-gradient(180deg, rgba(255,178,56,0.32) 0%, transparent 80%)" }}
                />
              )}
              {telegraphing && (
                <div
                  className="absolute inset-[6%] animate-[pillar-fire-warn_0.4s_ease-in-out_infinite] opacity-70"
                  style={{ background: ATTACK_COLOR.roar }}
                />
              )}
              {resolving && (
                <div
                  // Keyed by strike (scratch only) so each of the 3 rapid
                  // hits remounts and replays the flash instead of the
                  // animation staying stuck on strike 0 — roar never
                  // repeats within one attack, so it has no strike to key
                  // on and just keeps its natural mount-on-resolve replay.
                  key={activeAttack?.kind === "scratch" ? activeAttack.strike : undefined}
                  className="absolute inset-0 animate-[toad-hit-flash_0.4s_ease-out] opacity-80"
                  style={{ background: activeAttack?.kind === "scratch" ? ATTACK_COLOR.scratch : ATTACK_COLOR.roar }}
                />
              )}
              {clawing && <ClawMarks key={activeAttack?.kind === "scratch" ? activeAttack.strike : undefined} />}
              {panelsLit && (
                <div
                  className="absolute inset-[6%] animate-[pillar-fire-warn_0.4s_ease-in-out_infinite] opacity-80"
                  style={{ background: ATTACK_COLOR.panels }}
                />
              )}
              {panelsCorrect && (
                <div className="absolute inset-0 animate-[toad-hit-flash_0.4s_ease-out] opacity-80" style={{ background: PANELS_CORRECT_COLOR }} />
              )}
              {panelsFalling && <PlateCrumble />}
            </div>
          );
        }),
      )}

      {/* Roar's rocks — one per targeted quadrant, falling for the whole
          telegraph window and landing (with a dust burst) right as resolve
          begins. Keyed by quadrant so the same element persists across
          that telegraph->resolve transition rather than remounting (which
          would restart the fall mid-way). */}
      {roaring &&
        activeAttack.targetQuadrants.map((q) => (
          <FallingRock key={`${q.row}-${q.col}`} quadrant={q} resolving={activeAttack.stage === "resolve"} />
        ))}

      {/* The player token — a single persistent element whose position
          transitions between quadrant centers instead of teleporting, so a
          WASD step visibly travels rather than snapping. */}
      <Upright leftPct={playerCenter.left} topPct={playerCenter.top}>
        <div
          className="origin-bottom transition-transform duration-200 ease-out"
          style={{
            transform: playerFalling ? undefined : `scale(${playerFar ? 0.68 : 0.85}) translateY(${jumping ? -30 : 0}px)`,
            animation: playerFalling ? `snail-fall-lava ${PANELS_RESULT_HOLD_MS}ms ease-in forwards` : undefined,
          }}
        >
          <ScaredSnail fear={playerTargeted || playerFalling ? 0.9 : 0.15} />
        </div>
      </Upright>
    </div>
  );
}

// Counter-rotates against the floor's own rotateX tilt so whatever's
// inside stands upright and faces the camera instead of lying flat with
// the floor — the standard "billboard on a tilted plane" CSS trick.
// leftPct/topPct are plain CSS percentages, so they resolve against
// whichever positioned ancestor this is actually nested inside — the
// whole floor band for a torch, or a single cell for the player token —
// with no special-casing needed here. The position transition is harmless
// on things that never move (torches) and is what makes the player token
// (and a falling rock re-centering, though that never actually changes
// mid-fall) travel smoothly instead of teleporting.
function Upright({ leftPct, topPct, children }: { leftPct: number; topPct: number; children: ReactNode }) {
  return (
    <div
      className="absolute transition-[left,top] ease-out"
      style={{ left: `${leftPct}%`, top: `${topPct}%`, transformStyle: "preserve-3d", transitionDuration: `${MOVE_TRAVEL_MS}ms` }}
    >
      <div className="origin-bottom" style={{ transform: `translate(-50%, -50%) rotateX(${-ROTATE_X_DEG}deg)`, transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </div>
  );
}

// A real standing torch — wooden stake, flickering flame (same fire
// language as CaveBackground's Lantern), and a glow pool — rather than a
// dot-plus-label; whether it's lit is legible from the flame itself, and
// its column's own wash (the lit-cell gradient above) shows what it's
// actually lighting.
function Torch({ lit }: { lit: boolean }) {
  return (
    <div className="relative flex flex-col items-center" style={{ width: 26, height: 46 }}>
      {lit && (
        <div
          className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 animate-[fire-glow-pulse_2.2s_ease-in-out_infinite]"
          style={{ width: 70, height: 70, background: "radial-gradient(closest-side, rgba(255,150,60,0.55), transparent 70%)" }}
        />
      )}
      <div
        className="relative"
        style={{
          width: 13,
          height: 19,
          clipPath: "polygon(50% 0%, 80% 35%, 62% 30%, 88% 65%, 50% 100%, 12% 65%, 38% 30%, 20% 35%)",
          background: lit ? "linear-gradient(to top, #7a1200 0%, #ff7a1f 45%, #ffe9a8 100%)" : "linear-gradient(to top, #2a2016 0%, #443626 100%)",
          boxShadow: lit ? "0 0 12px rgba(255,140,20,0.9)" : "none",
          animationName: lit ? "fire-flicker" : undefined,
          animationDuration: "0.9s",
          animationTimingFunction: "ease-in-out",
          animationIterationCount: "infinite",
        }}
      />
      <div className="relative" style={{ width: 5, height: 24, background: "linear-gradient(180deg, #6b4a2a 0%, #3a2814 100%)" }} />
      <div className="relative" style={{ width: 16, height: 4, background: "#241a14" }} />
    </div>
  );
}

// A single rock, billboarded upright, falling from above the ceiling down
// onto its target quadrant over the full Roar telegraph window — the
// actual warning the player reads, rather than only a floor tint. Lands
// (and stays landed, `forwards` fill) right as the telegraph ends; a
// separate dust puff mounts fresh the instant resolve begins.
function FallingRock({ quadrant, resolving }: { quadrant: Quadrant; resolving: boolean }) {
  const center = quadrantCenterPct(quadrant);
  return (
    <div className="absolute" style={{ left: `${center.left}%`, top: `${center.top}%`, transformStyle: "preserve-3d" }}>
      <div className="origin-bottom" style={{ transform: `translate(-50%, -50%) rotateX(${-ROTATE_X_DEG}deg)`, transformStyle: "preserve-3d" }}>
        <div className="relative" style={{ width: 30, height: 26 }}>
          <div
            className="absolute inset-0"
            style={{
              clipPath: "polygon(20% 100%, 0% 58%, 14% 18%, 46% 0%, 82% 8%, 100% 42%, 90% 84%, 58% 100%)",
              background: "linear-gradient(160deg, #766b61 0%, #453d36 55%, #241f1a 100%)",
              boxShadow: "0 4px 6px rgba(0,0,0,0.5)",
              animation: `rock-fall ${ROAR_TELEGRAPH_MS}ms ease-in forwards`,
            }}
          />
          {resolving && (
            <div
              className="pointer-events-none absolute -inset-3 animate-[rock-impact-dust_450ms_ease-out_forwards]"
              style={{ clipPath: "circle(50% at 50% 50%)", background: "radial-gradient(circle, rgba(180,160,140,0.6), transparent 70%)" }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Scratch's claw marks — three diagonal streaks torn across a targeted
// tile, staggered slightly so they read as one swipe rather than firing
// all at once. Flat within the cell (not billboarded) since these are
// gouges *in* the floor, not standing objects.
function ClawMarks() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-[8%]">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-[75%] w-[9%]" style={{ transform: "rotate(-22deg)" }}>
          <div
            className="h-full w-full"
            style={{
              background:
                "linear-gradient(180deg, transparent 0%, rgba(30,4,2,0.9) 18%, rgba(90,10,6,0.95) 50%, rgba(30,4,2,0.9) 82%, transparent 100%)",
              animation: `claw-swipe-mark 350ms ease-out ${i * 40}ms both`,
            }}
          />
        </div>
      ))}
    </div>
  );
}

// Fixed, eyeballed bubble positions (not derived from any grid math) —
// this only ever peeks through the gap of whichever single plate is
// currently missing, so it just needs to look molten wherever that happens
// to land rather than lining up with anything else on the floor.
const LAVA_BUBBLES = [
  { left: 10, top: 15, size: 46, delay: 0 },
  { left: 42, top: 55, size: 38, delay: 0.7 },
  { left: 72, top: 20, size: 42, delay: 1.3 },
  { left: 60, top: 75, size: 34, delay: 2 },
  { left: 88, top: 60, size: 30, delay: 0.4 },
];

// The molten floor beneath the plates — sits behind them in the DOM (so
// their opaque stone tops normally cover it completely) spanning the same
// band the 2x3 grid occupies, and only becomes visible through whichever
// single plate is mid-crumble during Falling Panels' recite phase.
function LavaField() {
  return (
    <div
      className="absolute overflow-hidden"
      style={{
        left: `${BAND_LEFT_PCT}%`,
        width: `${BAND_WIDTH_PCT}%`,
        top: `${FAR_ROW_TOP_PCT}%`,
        height: `${NEAR_ROW_TOP_PCT + NEAR_ROW_HEIGHT_PCT - FAR_ROW_TOP_PCT}%`,
        background: "linear-gradient(180deg, #3a0a00 0%, #1a0400 100%)",
      }}
    >
      {LAVA_BUBBLES.map((b, i) => (
        <div
          key={i}
          className="absolute animate-[lava-bubble_2.6s_ease-in-out_infinite]"
          style={{
            left: `${b.left}%`,
            top: `${b.top}%`,
            width: b.size,
            height: b.size,
            clipPath: "circle(50% at 50% 50%)",
            background: "radial-gradient(closest-side, rgba(255,120,20,0.85), rgba(255,40,0,0.3) 60%, transparent 80%)",
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// The stone shards kicked loose right as a plate fails its Falling Panels
// check — a hot flare at the crack itself, plus a few pieces dropping away
// into the lava now showing through beneath (the base tile's own
// plate-crumble animation, set by the caller, handles the tile itself
// fading/sinking out of the way).
function PlateCrumble() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 animate-[lava-flare_450ms_ease-out_forwards]"
        style={{ background: "radial-gradient(circle, rgba(255,140,40,0.85), transparent 70%)" }}
      />
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="pointer-events-none absolute h-[38%] w-[30%] animate-[plate-shard-fall_450ms_ease-in_forwards]"
          style={{
            left: `${18 + i * 26}%`,
            top: `${8 + (i % 2) * 22}%`,
            background: "linear-gradient(160deg, #4a3d33 0%, #241a14 80%)",
            clipPath: "polygon(10% 0%, 90% 6%, 100% 70%, 60% 100%, 0% 80%)",
            animationDelay: `${i * 40}ms`,
          }}
        />
      ))}
    </>
  );
}
