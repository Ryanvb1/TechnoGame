// Pure grid/quadrant logic for the Cave Bear arena — no React, no timers.
// The arena is a 2-row x 3-column grid (6 quadrants); each column is one
// of the fight's three vertical 1x2 sections. Kept separate from the
// survival-phase hook so the random-selection logic (there's no existing
// "pick N of M" utility anywhere in this codebase — confirmed by grep) is
// independently readable/testable from the timer plumbing that calls it.

export type Row = 0 | 1;
export type Column = 0 | 1 | 2;
export type Quadrant = { row: Row; col: Column };

export type AttackKind = "panels" | "scratch" | "roar";

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

// Roar's draw is independent of the torch by design (confirmed with the
// user) — it can include the currently-lit column. Leaves exactly one
// random quadrant safe from the falling rocks each time.
export function pickRandomFiveOfSix(): Quadrant[] {
  return shuffle(ALL_QUADRANTS).slice(0, 5);
}

export function pickRandomAttackKind(): AttackKind {
  const kinds: AttackKind[] = ["panels", "scratch", "roar"];
  return kinds[Math.floor(Math.random() * kinds.length)];
}

// The Falling Panels memory sequence — every plate, once each, in a fresh
// random order every time the attack fires.
export function pickPanelSequence(): Quadrant[] {
  return shuffle(ALL_QUADRANTS);
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
