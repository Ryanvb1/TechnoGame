"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import {
  containsQuadrant,
  otherColumns,
  pickDifferentColumn,
  pickPanelSequence,
  pickRandomAttackKind,
  pickRandomFiveOfSix,
  quadrantsInColumns,
  sameQuadrant,
  type Column,
  type Quadrant,
} from "./caveBearGrid";
import {
  ATTACKS_PER_SURVIVAL_PHASE,
  INTER_ATTACK_DELAY_MS,
  PANELS_CHECK_INTERVAL_MS,
  PANELS_DAMAGE,
  PANELS_RESULT_HOLD_MS,
  PANELS_REVEAL_GAP_MS,
  PANELS_REVEAL_LIT_MS,
  ROAR_DAMAGE,
  ROAR_RESOLVE_FLASH_MS,
  ROAR_TELEGRAPH_MS,
  SCRATCH_DAMAGE,
  SCRATCH_STRIKE_COUNT,
  SCRATCH_STRIKE_INTERVAL_MS,
  TORCH_SWITCH_INTERVAL_MS,
} from "./caveBearFightConfig";

// Falling Panels doesn't fit the plain telegraph/resolve shape the other
// two attacks share (it has its own reveal-then-recite lifecycle with a
// running sequence and per-check feedback), so it gets its own two variants
// instead of being squeezed into the generic { stage, targetQuadrants }
// shape below.
export type ActiveAttack =
  | {
      kind: "scratch";
      stage: "resolve";
      targetQuadrants: Quadrant[];
      // Which of the 3 rapid strikes this is (0-indexed) — lets the
      // renderer key the flash/claw-mark visuals per strike so each one
      // replays instead of the CSS animation staying stuck on strike 0.
      strike: number;
    }
  | { kind: "roar"; stage: "telegraph" | "resolve"; targetQuadrants: Quadrant[] }
  | {
      kind: "panels";
      stage: "reveal";
      sequence: Quadrant[];
      // Which single plate is glowing right now — null during the brief
      // unlit gap between one reveal and the next.
      litQuadrant: Quadrant | null;
    }
  | {
      kind: "panels";
      stage: "recite";
      sequence: Quadrant[];
      // The plate a check just resolved against (wherever the player was
      // actually standing) — null while that check's 1.5s window is still
      // counting down and hasn't landed yet.
      checkQuadrant: Quadrant | null;
      checkResult: "correct" | "wrong" | null;
    }
  | null;

// Runs the Survival Phase's 3-attack sequence (each independently random,
// repeats allowed) with a 4s gap between attacks, plus the torch's own 8s
// rotation clock — kept in one effect (rather than split across several)
// specifically so the torch's "never switch mid-Scratch, then switch right
// after and reset the clock" rule can share state with the attack loop
// without cross-effect ref plumbing. Shaped after ThroneRoomScene's single
// targetColor effect: one cancelled flag, a pile of timer handles, full
// cleanup.
export function useCaveBearSurvivalPhase({
  active,
  playerQuadrantRef,
  // How long to wait before the first attack (and the torch clock) starts
  // once this phase activates — 0 for the fight's very first Survival
  // Phase, POST_DAMAGE_PHASE_COOLDOWN_MS every other time, since every
  // later activation is necessarily a hand-back from the Damage Phase (see
  // CaveBearFight's cameFromDamagePhaseRef).
  startDelayMs = 0,
  onDamage,
  onComplete,
}: {
  active: boolean;
  playerQuadrantRef: RefObject<Quadrant>;
  startDelayMs?: number;
  onDamage: (amount: number) => void;
  onComplete: () => void;
}) {
  const [activeAttack, setActiveAttack] = useState<ActiveAttack>(null);
  const [litColumn, setLitColumn] = useState<Column>(0);
  const litColumnRef = useRef<Column>(0);

  useEffect(() => {
    if (!active) return;

    let cancelled = false;
    let attackTimer: number | undefined;
    let interAttackTimer: number | undefined;
    let torchTimer: number | undefined;
    let scratchInProgress = false;

    function advanceTorch() {
      const next = pickDifferentColumn(litColumnRef.current);
      litColumnRef.current = next;
      setLitColumn(next);
    }

    // Re-armed every time it fires (or deferred past a live Scratch, which
    // instead re-arms it itself once that Scratch resolves) so exactly one
    // clock is ever running.
    function scheduleTorchSwitch() {
      torchTimer = window.setTimeout(() => {
        if (cancelled) return;
        if (scratchInProgress) return; // Scratch's own resolve will switch + reschedule
        advanceTorch();
        scheduleTorchSwitch();
      }, TORCH_SWITCH_INTERVAL_MS);
    }

    function afterResolve(n: number) {
      setActiveAttack(null);
      interAttackTimer = window.setTimeout(() => {
        if (cancelled) return;
        runAttack(n + 1);
      }, INTER_ATTACK_DELAY_MS);
    }

    // Falling Panels: reveal shows every plate lit red, one at a time, in a
    // fresh random order; then the player must recite that same order,
    // standing on the right plate by the end of each 1.5s check. A miss
    // ends the attack immediately (per the user) — no partial credit for
    // however far the player got.
    function runPanels(n: number) {
      const sequence = pickPanelSequence();

      function revealStep(index: number) {
        setActiveAttack({ kind: "panels", stage: "reveal", sequence, litQuadrant: sequence[index] });
        attackTimer = window.setTimeout(() => {
          if (cancelled) return;
          setActiveAttack({ kind: "panels", stage: "reveal", sequence, litQuadrant: null });
          attackTimer = window.setTimeout(() => {
            if (cancelled) return;
            if (index + 1 < sequence.length) {
              revealStep(index + 1);
            } else {
              checkStep(0);
            }
          }, PANELS_REVEAL_GAP_MS);
        }, PANELS_REVEAL_LIT_MS);
      }

      function checkStep(index: number) {
        // Arm a fresh window with no result showing yet — the player has
        // until this timeout fires to get onto sequence[index].
        setActiveAttack({ kind: "panels", stage: "recite", sequence, checkQuadrant: null, checkResult: null });
        attackTimer = window.setTimeout(() => {
          if (cancelled) return;
          const standingOn = playerQuadrantRef.current;
          const correct = sameQuadrant(standingOn, sequence[index]);
          setActiveAttack({ kind: "panels", stage: "recite", sequence, checkQuadrant: standingOn, checkResult: correct ? "correct" : "wrong" });
          if (!correct) onDamage(PANELS_DAMAGE);
          attackTimer = window.setTimeout(() => {
            if (cancelled) return;
            if (!correct || index + 1 >= sequence.length) {
              afterResolve(n);
            } else {
              checkStep(index + 1);
            }
          }, PANELS_RESULT_HOLD_MS);
        }, PANELS_CHECK_INTERVAL_MS);
      }

      revealStep(0);
    }

    function runScratch(n: number) {
      // Not telegraphed, per spec — the player must already be in the lit
      // column when each strike resolves. Targets stay fixed on the same
      // two non-lit columns for the whole combo (the torch doesn't move
      // mid-Scratch). One Scratch instance is 3 rapid strikes, 0.8s apart,
      // each independently checking the player's position — so a player
      // who dodges into the lit column partway through only eats the
      // strikes that already landed before they got there.
      const targets = quadrantsInColumns(otherColumns(litColumnRef.current));
      scratchInProgress = true;

      function strike(strikeIndex: number) {
        setActiveAttack({ kind: "scratch", stage: "resolve", targetQuadrants: targets, strike: strikeIndex });
        if (containsQuadrant(targets, playerQuadrantRef.current)) onDamage(SCRATCH_DAMAGE);
        attackTimer = window.setTimeout(() => {
          if (cancelled) return;
          if (strikeIndex + 1 < SCRATCH_STRIKE_COUNT) {
            strike(strikeIndex + 1);
            return;
          }
          scratchInProgress = false;
          // Every Scratch combo rotates the torch once the whole thing
          // resolves and resets the 8s clock from that point, per spec.
          advanceTorch();
          scheduleTorchSwitch();
          afterResolve(n);
        }, SCRATCH_STRIKE_INTERVAL_MS);
      }

      strike(0);
    }

    function runRoar(n: number) {
      // Independent random 5-of-6 draw every time — leaves exactly one
      // random tile safe, and can include the lit column (torch protection
      // is scoped to Scratch only, per the user).
      const targets = pickRandomFiveOfSix();
      setActiveAttack({ kind: "roar", stage: "telegraph", targetQuadrants: targets });
      attackTimer = window.setTimeout(() => {
        if (cancelled) return;
        setActiveAttack({ kind: "roar", stage: "resolve", targetQuadrants: targets });
        if (containsQuadrant(targets, playerQuadrantRef.current)) onDamage(ROAR_DAMAGE);
        attackTimer = window.setTimeout(() => {
          if (cancelled) return;
          afterResolve(n);
        }, ROAR_RESOLVE_FLASH_MS);
      }, ROAR_TELEGRAPH_MS);
    }

    function runAttack(n: number) {
      if (n > ATTACKS_PER_SURVIVAL_PHASE) {
        onComplete();
        return;
      }
      switch (pickRandomAttackKind()) {
        case "panels":
          runPanels(n);
          break;
        case "scratch":
          runScratch(n);
          break;
        case "roar":
          runRoar(n);
          break;
      }
    }

    // Fresh start each time a Survival Phase begins, from a random column
    // so the torch isn't glued to wherever it last landed.
    litColumnRef.current = pickDifferentColumn(litColumnRef.current);
    setLitColumn(litColumnRef.current);
    // The torch state above is established right away, but the attack
    // loop itself (and the torch's own switch clock) waits out
    // startDelayMs first — that's the 5s post-Damage-Phase cooldown.
    const startTimer = window.setTimeout(() => {
      if (cancelled) return;
      runAttack(1);
      scheduleTorchSwitch();
    }, startDelayMs);

    return () => {
      cancelled = true;
      window.clearTimeout(startTimer);
      window.clearTimeout(attackTimer);
      window.clearTimeout(interAttackTimer);
      window.clearTimeout(torchTimer);
      setActiveAttack(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onDamage/onComplete/refs are stable identities from the owning component, and startDelayMs only needs to be read once at the instant this effect starts (the render that flips `active` true always carries the right value, per CaveBearFight's cameFromDamagePhaseRef); re-running this effect on every render would restart the whole attack sequence.
  }, [active]);

  return { activeAttack, litColumn };
}
