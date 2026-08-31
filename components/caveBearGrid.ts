// Pure grid/quadrant logic for the Cave Bear arena — no React, no timers.
// The arena is a 2-row x 3-column grid (6 quadrants); each column is one
// of the fight's three vertical 1x2 sections. Kept separate from the
// survival-phase hook so the random-selection logic (there's no existing
// "pick N of M" utility anywhere in this codebase — confirmed by grep) is
// independently readable/testable from the timer plumbing that calls it.

import { PANELS_SEQUENCE_LENGTH, ROAR_WAVE_MAX, ROAR_WAVE_MIN } from "./caveBearFightConfig";

export type Row = 0 | 1;
export type Column = 0 | 1 | 2;
export type Quadrant = { row: Row; col: Column };

export type AttackKind = "panels" | "scratch" | "roar";
export type PrimaryAttackKind = Exclude<AttackKind, "scratch">;

export const ROWS: Row[] = [0, 1];
export const COLUMNS: Column[] = [0, 1, 2];

export const ALL_QUADRANTS: Quadrant[] = ROWS.flatMap((row) => COLUMNS.map((col) => ({ row, col })));

export function sameQuadrant(a: Quadrant, b: Quadrant): boolean {
  return a.row === b.row && a.col === b.col;
}

export function containsQuadrant(list: Quadrant[], target: Quadrant): boolean {
  return list.some((q) => sameQuadrant(q, target));
}

export function quadrantsInColumns(columns: Column[]): Quadrant[] {
  return ALL_QUADRANTS.filter((q) => columns.includes(q.col));
}

// The two columns not currently lit — Scratch always targets exactly these.
export function otherColumns(litColumn: Column): Column[] {
  return COLUMNS.filter((c) => c !== litColumn);
}

// Fisher-Yates shuffle, used both for Roar's random draw and (trivially)
// for picking a torch column.
function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Roar fires 3 consecutive waves per activation, each with its own single
// safe quadrant — this draws all of them up front and guarantees they're
// distinct, so the player has to actually move between waves rather than
// one lucky spot staying safe the whole attack. Independent of the torch
// by design (confirmed with the user) — can include the currently-lit
// column.
export function pickDistinctSafeQuadrants(count: number): Quadrant[] {
  return shuffle(ALL_QUADRANTS).slice(0, count);
}

export function pickRoarWaveCount(): number {
  return ROAR_WAVE_MIN + Math.floor(Math.random() * (ROAR_WAVE_MAX - ROAR_WAVE_MIN + 1));
}

// Every quadrant except one wave's safe spot — what that wave's falling
// rocks actually target.
export function quadrantsExcluding(safe: Quadrant): Quadrant[] {
  return ALL_QUADRANTS.filter((q) => !sameQuadrant(q, safe));
}

// Scratch is a guaranteed follow-up, never a standalone random attack.
export function pickRandomAttackKind(): PrimaryAttackKind {
  const kinds: PrimaryAttackKind[] = ["panels", "roar"];
  return kinds[Math.floor(Math.random() * kinds.length)];
}

// The Falling Panels memory sequence — 4 of the 6 plates (not every one),
// a fresh random subset in a fresh random order every time the attack
// fires.
export function pickPanelSequence(): Quadrant[] {
  return shuffle(ALL_QUADRANTS).slice(0, PANELS_SEQUENCE_LENGTH);
}

// A different column than the one currently lit, for the torch's rotation.
export function pickDifferentColumn(current: Column): Column {
  const options = COLUMNS.filter((c) => c !== current);
  return options[Math.floor(Math.random() * options.length)];
}

export function clampRow(row: number): Row {
  return Math.max(0, Math.min(1, row)) as Row;
}

export function clampColumn(col: number): Column {
  return Math.max(0, Math.min(2, col)) as Column;
}
