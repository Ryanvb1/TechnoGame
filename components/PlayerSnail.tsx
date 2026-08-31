"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ScaredSnail } from "./ScaredSnail";
import { ThoughtBubble } from "./ThoughtBubble";
import {
  markSnailGreeted,
  markSnailLocationCommented,
  readSnailGreeted,
  readSnailLocationCommented,
  readSnailRescued,
} from "./snailState";
import { useCompanionSnailHidden } from "./companionSnail";
import { useSnailCosmetics } from "./useSnailCosmetics";

const SNAIL_WIDTH = 78;
const SNAIL_HEIGHT = 42;
const EDGE_PADDING = 12;
const MOVE_SPEED_PX_PER_SECOND = 460;
const INTERACTION_DISTANCE = 105;
const COMMENT_DISPLAY_MS = 4200;
const INTERACTIVE_SELECTOR = 'button, a[href], [role="button"]';

const LOCATION_COMMENTS: Record<string, string> = {
  "/throne-room": "Ooh, fancy. I want a smaller throne.",
  "/cave": "Dark, damp, and smells like me. Love it.",
  "/airport": "I packed nothing. I am nothing but shell.",
  "/crate": "200 rainbow balls and not one is mine?",
  "/about": "Is this where they explain the snail?",
  "/contact": "Tell them a snail says hi.",
  "/projects": "Bold of you to have 'projects'. I have naps.",
  "/writing": "I'd help you write, but, no hands.",
  "/nicotine": "A gnome AND a cottage? I'm moving in.",
};

type Position = { x: number; y: number };
type MovementBounds = { minX: number; maxX: number; minY: number; maxY: number };
function spawnPosition(): Position {
  if (typeof window === "undefined") return { x: 0, y: 0 };
  return {
    x: Math.max(EDGE_PADDING, window.innerWidth / 2 - SNAIL_WIDTH / 2),
    y: Math.max(EDGE_PADDING, window.innerHeight - SNAIL_HEIGHT - 28),
  };
}

function readMovementBounds(): MovementBounds {
  const viewportBounds = {
    minX: EDGE_PADDING,
    maxX: window.innerWidth - SNAIL_WIDTH - EDGE_PADDING,
    minY: EDGE_PADDING,
    maxY: window.innerHeight - SNAIL_HEIGHT - EDGE_PADDING,
  };
  const boundary = document.querySelector<HTMLElement>("[data-snail-boundary]");
  if (!boundary) return viewportBounds;

  const rect = boundary.getBoundingClientRect();
  const minX = Math.max(viewportBounds.minX, rect.left);
  const maxX = Math.min(viewportBounds.maxX, rect.right - SNAIL_WIDTH);
  const minY = Math.max(viewportBounds.minY, rect.top);
  const maxY = Math.min(viewportBounds.maxY, rect.bottom - SNAIL_HEIGHT);

  return {
    minX,
    maxX: Math.max(minX, maxX),
    minY,
    maxY: Math.max(minY, maxY),
  };
}

function clampToMovementBounds(position: Position): Position {
  const bounds = readMovementBounds();
  return {
    x: Math.min(bounds.maxX, Math.max(bounds.minX, position.x)),
    y: Math.min(bounds.maxY, Math.max(bounds.minY, position.y)),
  };
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  );
}

function distanceToRect(point: { x: number; y: number }, rect: DOMRect) {
  const dx = Math.max(rect.left - point.x, 0, point.x - rect.right);
  const dy = Math.max(rect.top - point.y, 0, point.y - rect.bottom);
  return Math.hypot(dx, dy);
}

function canInteract(element: HTMLElement) {
  if (element.closest("[data-snail-click-only]")) return false;
  if (element.matches(":disabled") || element.getAttribute("aria-disabled") === "true") return false;

  const style = window.getComputedStyle(element);
  const eOnly = element.hasAttribute("data-snail-e-only");
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    (eOnly || style.pointerEvents !== "none") &&
    element.getClientRects().length > 0
  );
}

function findNearbyInteraction(position: Position) {
  const point = {
    x: position.x + SNAIL_WIDTH / 2,
    y: position.y + SNAIL_HEIGHT / 2,
  };

  let nearest: { element: HTMLElement; distance: number; area: number } | null = null;
  const elements = document.querySelectorAll<HTMLElement>(INTERACTIVE_SELECTOR);

  for (const element of elements) {
    if (!canInteract(element)) continue;
    const rect = element.getBoundingClientRect();
    const distance = distanceToRect(point, rect);
    if (distance > INTERACTION_DISTANCE) continue;

    const area = rect.width * rect.height;
    if (
      nearest === null ||
      distance < nearest.distance - 0.5 ||
      (Math.abs(distance - nearest.distance) <= 0.5 && area < nearest.area)
    ) {
      nearest = { element, distance, area };
    }
  }

  return nearest?.element ?? null;
}

export function PlayerSnail() {
  const pathname = usePathname();
  const hidden = useCompanionSnailHidden();
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const positionRef = useRef(position);
  const pressedKeys = useRef(new Set<string>());
  const [facingLeft, setFacingLeft] = useState(false);
  const { shellStyle, necklaceColor } = useSnailCosmetics();
  const [nearbyInteraction, setNearbyInteraction] = useState<HTMLElement | null>(null);
  const nearbyInteractionRef = useRef<HTMLElement | null>(null);
  const [comment, setComment] = useState<string | null>(null);

  const updatePosition = useCallback((next: Position) => {
    positionRef.current = next;
    setPosition(next);
  }, []);

  const refreshNearbyInteraction = useCallback(() => {
    const next = findNearbyInteraction(positionRef.current);
    if (nearbyInteractionRef.current !== next) {
      nearbyInteractionRef.current = next;
      setNearbyInteraction(next);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- route changes are an external navigation boundary; respawn from the current viewport.
    updatePosition(clampToMovementBounds(spawnPosition()));
    if (!readSnailRescued()) return;
    const locationComment = LOCATION_COMMENTS[pathname];
    const shouldGreet = pathname === "/" && !readSnailGreeted();
    const shouldComment =
      pathname !== "/" &&
      Boolean(locationComment) &&
      !readSnailLocationCommented(pathname);

    if (shouldGreet) {
      setComment("Traveler, you saved my life.");
      markSnailGreeted();
    } else if (shouldComment) {
      setComment(locationComment);
      markSnailLocationCommented(pathname);
    }

    if (shouldGreet || shouldComment) {
      const timer = window.setTimeout(() => setComment(null), COMMENT_DISPLAY_MS);
      return () => window.clearTimeout(timer);
    }
  }, [pathname, updatePosition]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isTypingTarget(event.target)) return;
      const key = event.key.toLowerCase();

      if (key === "e") {
        if (event.repeat) return;
        const target = findNearbyInteraction(positionRef.current);
        if (target) {
          event.preventDefault();
          target.click();
        }
        return;
      }

      if (key === "w" || key === "a" || key === "s" || key === "d") {
        event.preventDefault();
        pressedKeys.current.add(key);
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      pressedKeys.current.delete(event.key.toLowerCase());
    }

    function clearKeys() {
      pressedKeys.current.clear();
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", clearKeys);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", clearKeys);
    };
  }, []);

  useEffect(() => {
    let frame = 0;
    let previousTime = performance.now();

    function animate(time: number) {
      const elapsedSeconds = Math.min((time - previousTime) / 1000, 0.05);
      previousTime = time;
      const keys = pressedKeys.current;
      let horizontal = Number(keys.has("d")) - Number(keys.has("a"));
      let vertical = Number(keys.has("s")) - Number(keys.has("w"));

      if (horizontal !== 0 || vertical !== 0) {
        const magnitude = Math.hypot(horizontal, vertical);
        horizontal /= magnitude;
        vertical /= magnitude;
        if (horizontal !== 0) setFacingLeft(horizontal < 0);

        const current = positionRef.current;
        updatePosition(
          clampToMovementBounds({
            x: current.x + horizontal * MOVE_SPEED_PX_PER_SECOND * elapsedSeconds,
            y: current.y + vertical * MOVE_SPEED_PX_PER_SECOND * elapsedSeconds,
          }),
        );
      }

      refreshNearbyInteraction();
      frame = window.requestAnimationFrame(animate);
    }

    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, [refreshNearbyInteraction, updatePosition]);

  useEffect(() => {
    function keepInBounds() {
      const current = positionRef.current;
      updatePosition(clampToMovementBounds(current));
    }
    window.addEventListener("resize", keepInBounds);
    return () => window.removeEventListener("resize", keepInBounds);
  }, [updatePosition]);

  if (hidden || pathname === "/careful") return null;

  return (
    <>
      <div className="pointer-events-none fixed left-4 top-4 z-30 border border-neon-dim/60 bg-background/80 px-3 py-2 text-[0.58rem] uppercase tracking-[0.18em] text-neon-dim shadow-[0_0_12px_rgba(28,143,82,0.25)]">
        WASD Move <span className="mx-1 text-foreground/30">•</span> E Interact
      </div>
      <div
        className="pointer-events-none fixed left-0 top-0 z-30 will-change-transform"
        style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
        aria-label="Player snail"
      >
        {comment && (
          <ThoughtBubble className="absolute bottom-full left-1/2 mb-4 w-56 -translate-x-1/2">
            <p>{comment}</p>
          </ThoughtBubble>
        )}
        {nearbyInteraction && (
          <div className="absolute bottom-full left-1/2 mb-3 -translate-x-1/2 whitespace-nowrap border border-neon bg-background/95 px-2 py-1 text-[0.58rem] font-bold uppercase tracking-[0.18em] text-neon shadow-[0_0_12px_var(--neon-dim)]">
            E
          </div>
        )}
        <div style={{ transform: facingLeft ? "scaleX(-1)" : undefined }}>
          <ScaredSnail fear={0} shellStyle={shellStyle} necklaceColor={necklaceColor} />
        </div>
      </div>
    </>
  );
}
