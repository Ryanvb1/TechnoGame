"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent, type RefObject } from "react";
import {
  BOW_HIT_RADIUS_PCT,
  BOW_SHOT_DAMAGE,
  DAMAGE_PHASE_TIMEOUT_MS,
  DRIFT_MAX_PCT,
  DRIFT_MIN_PCT,
  DRIFT_RETARGET_MAX_MS,
  DRIFT_RETARGET_MIN_MS,
  THROW_ANIM_MS,
} from "./caveBearFightConfig";

export type BowShot = {
  aimX: number;
  bearX: number;
  hit: boolean;
} | null;

const DRIFT_SPEED_PCT_PER_MS = 0.045;

// The bow is always fully drawn — aim by moving the pointer, a click fires
// immediately at wherever it's currently pointing. No hold-to-charge, no
// spread; one shot, one damage value. Bear cannot attack during this
// phase — no attack hook runs alongside it, the caller just doesn't mount
// the survival-phase hook while this one is active.
export function useCaveBearDamagePhase({
  active,
  arenaRef,
  onDamage,
  onComplete,
}: {
  active: boolean;
  arenaRef: RefObject<HTMLDivElement | null>;
  onDamage: (amount: number) => void;
  onComplete: () => void;
}) {
  const [bearDriftX, setBearDriftX] = useState(50);
  const [aimX, setAimX] = useState<number | null>(null);
  const [shot, setShot] = useState<BowShot>(null);

  const bearDriftXRef = useRef(50);
  const aimXRef = useRef<number | null>(null);
  const firedRef = useRef(false);
  const aimRafRef = useRef<number | null>(null);
  const pendingAimRef = useRef<number | null>(null);

  // Resets for each fresh entry into the Damage Phase — same precedented
  // exception as FightScene's own stage-mirroring effect (re-arming
  // showVictory for each "won" transition): this reacts to *entering* a
  // phase to reset that phase's transient UI state, not to an arbitrary
  // value change.
  useEffect(() => {
    if (!active) return;
    firedRef.current = false;
    aimXRef.current = null;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resets this phase's transient UI state for each fresh entry into the Damage Phase, not a reactive sync to an external value.
    setShot(null);
    setAimX(null);
  }, [active]);

  useEffect(() => {
    return () => {
      if (aimRafRef.current !== null) cancelAnimationFrame(aimRafRef.current);
    };
  }, []);

  // The bear's autonomous drift — requires the player to actively track
  // him rather than shoot at a stationary target. A single rAF loop moves
  // bearDriftX toward a periodically re-picked target at a fixed speed,
  // rather than tweening discrete hops, so the motion reads continuous.
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let retargetTimer: number | undefined;
    let rafId: number;
    let lastTime = performance.now();
    let target = bearDriftXRef.current;

    function pickNewTarget() {
      target = DRIFT_MIN_PCT + Math.random() * (DRIFT_MAX_PCT - DRIFT_MIN_PCT);
      const delay = DRIFT_RETARGET_MIN_MS + Math.random() * (DRIFT_RETARGET_MAX_MS - DRIFT_RETARGET_MIN_MS);
      retargetTimer = window.setTimeout(() => {
        if (!cancelled) pickNewTarget();
      }, delay);
    }

    function step(now: number) {
      if (cancelled) return;
      const dt = now - lastTime;
      lastTime = now;
      const current = bearDriftXRef.current;
      const diff = target - current;
      const maxStep = DRIFT_SPEED_PCT_PER_MS * dt;
      const next = Math.abs(diff) <= maxStep ? target : current + Math.sign(diff) * maxStep;
      bearDriftXRef.current = next;
      setBearDriftX(next);
      rafId = requestAnimationFrame(step);
    }

    pickNewTarget();
    rafId = requestAnimationFrame(step);

    return () => {
      cancelled = true;
      window.clearTimeout(retargetTimer);
      cancelAnimationFrame(rafId);
    };
  }, [active]);

  // Auto-timeout if the player never actually fires.
  useEffect(() => {
    if (!active) return;
    const timer = window.setTimeout(() => {
      if (firedRef.current) return;
      firedRef.current = true;
      onComplete();
    }, DAMAGE_PHASE_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onComplete is a stable identity from the owning component.
  }, [active]);

  const updateAimFromClientX = useCallback(
    (clientX: number) => {
      const rect = arenaRef.current?.getBoundingClientRect();
      if (!rect) return;
      const pct = Math.min(98, Math.max(2, ((clientX - rect.left) / rect.width) * 100));
      aimXRef.current = pct;
      pendingAimRef.current = pct;
      if (aimRafRef.current !== null) return;
      aimRafRef.current = requestAnimationFrame(() => {
        aimRafRef.current = null;
        if (pendingAimRef.current !== null) setAimX(pendingAimRef.current);
      });
    },
    [arenaRef],
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!active || firedRef.current) return;
      updateAimFromClientX(e.clientX);
    },
    [active, updateAimFromClientX],
  );

  const handleShoot = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      if (!active || firedRef.current) return;
      firedRef.current = true;
      updateAimFromClientX(e.clientX);
      const aim = aimXRef.current ?? 50;
      const bearX = bearDriftXRef.current;
      const hit = Math.abs(aim - bearX) <= BOW_HIT_RADIUS_PCT;
      if (hit) onDamage(BOW_SHOT_DAMAGE);
      setShot({ aimX: aim, bearX, hit });
      window.setTimeout(() => {
        onComplete();
      }, THROW_ANIM_MS);
    },
    [active, onComplete, onDamage, updateAimFromClientX],
  );

  return { bearDriftX, aimX, shot, handlePointerMove, handleShoot };
}
