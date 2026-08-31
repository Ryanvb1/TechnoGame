import type { PointerEvent } from "react";
import type { BowShot } from "./useCaveBearDamagePhase";
import { BOW_HIT_RADIUS_PCT } from "./caveBearFightConfig";

export function CaveBearSpearAim({
  bearDriftX,
  aimX,
  shot,
  onShoot,
}: {
  bearDriftX: number;
  aimX: number | null;
  shot: BowShot;
  onShoot: (event: PointerEvent<HTMLElement>) => void;
}) {
  const bowX = aimX ?? 50;
  const aligned = Math.abs(bowX - bearDriftX) <= BOW_HIT_RADIUS_PCT;
  const aimColor = aligned ? "var(--neon)" : "#ff4d4d";

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <Bullseye x={bearDriftX} color={aimColor} aligned={aligned} />

      {!shot && (
        <>
          <div
            className="absolute bottom-[54px] top-[42px] w-px -translate-x-1/2 opacity-35"
            style={{ left: `${bowX}%`, background: aimColor, willChange: "left" }}
          />
          <button
            type="button"
            aria-label="Fire bow"
            onPointerDown={onShoot}
            className="pointer-events-auto absolute bottom-1 h-[64px] w-[82px] -translate-x-1/2 touch-manipulation outline-none active:scale-95"
            style={{ left: `${bowX}%`, willChange: "left" }}
          >
            <Bow color={aimColor} aligned={aligned} />
          </button>
        </>
      )}

      {shot && (
        <>
          <FlyingArrow x={shot.aimX} />
          <ImpactFlash x={shot.aimX} hit={shot.hit} />
        </>
      )}
    </div>
  );
}

function Bullseye({ x, color, aligned }: { x: number; color: string; aligned: boolean }) {
  return (
    <div
      className="absolute top-7 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px]"
      style={{
        left: `${x}%`,
        borderColor: color,
        boxShadow: aligned ? `0 0 18px ${color}` : `0 0 8px ${color}88`,
        willChange: "left",
      }}
    >
      <div className="absolute inset-[6px] rounded-full border-2" style={{ borderColor: color }} />
      <div
        className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: color, boxShadow: `0 0 8px ${color}` }}
      />
    </div>
  );
}

function Bow({ color, aligned }: { color: string; aligned: boolean }) {
  return (
    <div className="relative h-full w-full">
      <div
        className="absolute left-1/2 top-0 h-5 w-5 -translate-x-1/2 rounded-full"
        style={{
          background: color,
          boxShadow: aligned ? `0 0 16px ${color}` : `0 0 7px ${color}`,
          animation: "aim-hint-pulse 1.1s ease-in-out infinite",
        }}
      />
      <div className="absolute left-1/2 top-1 h-10 w-[5px] -translate-x-1/2 bg-gradient-to-b from-[#eef2f4] via-[#ba8b55] to-[#704522]">
        <div
          className="absolute -top-2 left-1/2 h-3 w-4 -translate-x-1/2"
          style={{
            clipPath: "polygon(50% 0%, 100% 100%, 50% 72%, 0% 100%)",
            background: "#eef2f4",
          }}
        />
        <div
          className="absolute -bottom-1 left-1/2 h-3 w-5 -translate-x-1/2"
          style={{ clipPath: "polygon(0 0, 50% 30%, 100% 0, 72% 100%, 50% 72%, 28% 100%)", background: "#c1392b" }}
        />
      </div>
      <svg className="absolute bottom-0 left-1/2 -translate-x-1/2" width="82" height="46" viewBox="0 0 82 46" aria-hidden="true">
        <path d="M 7 4 Q 14 27 41 42 Q 68 27 75 4" fill="none" stroke="#8a572d" strokeWidth="7" strokeLinecap="round" />
        <path d="M 7 4 Q 15 26 41 40 Q 67 26 75 4" fill="none" stroke="#d49a54" strokeWidth="2" />
        <path d="M 7 4 L 41 35 L 75 4" fill="none" stroke="#f3ead7" strokeWidth="2" />
      </svg>
    </div>
  );
}

function FlyingArrow({ x }: { x: number }) {
  return (
    <div
      className="absolute bottom-5 left-1/2 h-11 w-[5px]"
      style={{
        left: `${x}%`,
        background: "linear-gradient(180deg, #eef2f4 0 18%, #ba8b55 18% 100%)",
        animation: "bow-arrow-flight 430ms cubic-bezier(0.2, 0.85, 0.3, 1) forwards",
      }}
    />
  );
}

function ImpactFlash({ x, hit }: { x: number; hit: boolean }) {
  const color = hit ? "var(--neon)" : "#ff4d4d";
  return (
    <div
      className="absolute top-7 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
      style={{
        left: `${x}%`,
        background: `radial-gradient(circle, ${color}, transparent 70%)`,
        animation: "beam-impact-flash 300ms ease-out 300ms forwards",
      }}
    />
  );
}
