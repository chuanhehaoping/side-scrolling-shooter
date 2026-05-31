"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EVENTS } from "@/game/constants";
import { bus } from "@/game/eventBus";
import type { InputState } from "@/game/types";

const DEAD_ZONE = 0.28;
const MAX_RADIUS = 46;

/**
 * Touch controls: an analog-style joystick (left) for movement plus FIRE and
 * SLOW buttons (right). Directional + action state is merged and pushed to the
 * Phaser scene over the shared event bus.
 */
export default function MobileControls() {
  const baseRef = useRef<HTMLDivElement>(null);
  const pointerId = useRef<number | null>(null);
  const [thumb, setThumb] = useState({ x: 0, y: 0 });

  const move = useRef({ up: false, down: false, left: false, right: false });
  const fire = useRef(false);
  const slow = useRef(false);

  const emit = useCallback(() => {
    const state: InputState = {
      up: move.current.up,
      down: move.current.down,
      left: move.current.left,
      right: move.current.right,
      fire: fire.current,
      slow: slow.current,
    };
    bus.emit(EVENTS.INPUT_STATE, state);
  }, []);

  useEffect(() => {
    // Make sure a stale "pressed" state never leaks when the component unmounts.
    return () => {
      move.current = { up: false, down: false, left: false, right: false };
      fire.current = false;
      slow.current = false;
      bus.emit(EVENTS.INPUT_STATE, {
        up: false,
        down: false,
        left: false,
        right: false,
        fire: false,
        slow: false,
      });
    };
  }, []);

  const updateFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const base = baseRef.current;
      if (!base) return;
      const rect = base.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      let dx = clientX - cx;
      let dy = clientY - cy;
      const dist = Math.hypot(dx, dy) || 1;
      const clamped = Math.min(dist, MAX_RADIUS);
      dx = (dx / dist) * clamped;
      dy = (dy / dist) * clamped;
      setThumb({ x: dx, y: dy });

      const nx = dx / MAX_RADIUS;
      const ny = dy / MAX_RADIUS;
      move.current = {
        left: nx < -DEAD_ZONE,
        right: nx > DEAD_ZONE,
        up: ny < -DEAD_ZONE,
        down: ny > DEAD_ZONE,
      };
      emit();
    },
    [emit],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    pointerId.current = e.pointerId;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    updateFromPointer(e.clientX, e.clientY);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (pointerId.current !== e.pointerId) return;
    updateFromPointer(e.clientX, e.clientY);
  };

  const endJoystick = (e: React.PointerEvent) => {
    if (pointerId.current !== e.pointerId) return;
    pointerId.current = null;
    setThumb({ x: 0, y: 0 });
    move.current = { up: false, down: false, left: false, right: false };
    emit();
  };

  const setFire = (v: boolean) => {
    fire.current = v;
    emit();
  };

  const toggleSlow = () => {
    slow.current = !slow.current;
    setSlowOn(slow.current);
    emit();
  };

  const [slowOn, setSlowOn] = useState(false);

  return (
    <div className="pointer-events-none absolute inset-0 z-20 select-none md:hidden">
      {/* Joystick */}
      <div
        ref={baseRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endJoystick}
        onPointerCancel={endJoystick}
        className="pointer-events-auto absolute bottom-5 left-4 flex h-28 w-28 touch-none items-center justify-center rounded-full border border-white/15 bg-white/5 backdrop-blur-sm"
      >
        <div className="absolute h-28 w-28 rounded-full border border-hud-cyan/10" />
        <div
          className="h-12 w-12 rounded-full border border-hud-cyan/60 bg-hud-cyan/20 shadow-glow"
          style={{ transform: `translate(${thumb.x}px, ${thumb.y}px)` }}
        />
      </div>

      {/* Action buttons */}
      <div className="absolute bottom-5 right-4 flex items-end gap-3">
        <button
          type="button"
          onPointerDown={toggleSlow}
          className={`pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full border text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm transition active:scale-95 ${
            slowOn
              ? "border-hud-amber bg-hud-amber/20 text-hud-amber"
              : "border-white/20 bg-white/5 text-white/70"
          }`}
        >
          Slow
        </button>
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            setFire(true);
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            setFire(false);
          }}
          onPointerLeave={() => setFire(false)}
          onPointerCancel={() => setFire(false)}
          className="pointer-events-auto flex h-20 w-20 touch-none items-center justify-center rounded-full border-2 border-hud-magenta/70 bg-hud-magenta/25 text-sm font-black uppercase tracking-wider text-white shadow-glow backdrop-blur-sm transition active:scale-90"
        >
          Fire
        </button>
      </div>
    </div>
  );
}
