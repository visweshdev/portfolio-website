"use client";

import { useRef } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { playSound } from "@/lib/sound";

type Props = {
  children: React.ReactNode;
  className?: string;
  rotate?: number;
  style?: React.CSSProperties;
};

/**
 * A collage piece you can actually pick up and move — like a real
 * object on a desk, not a hover trick. Pointer Events cover mouse,
 * touch and pen in one code path. There's no snap-back: whatever you
 * drop stays put, because scrapbooks don't reorganize themselves.
 * Falls back to static (non-draggable) under prefers-reduced-motion.
 */
export default function DraggablePiece({ children, className = "", rotate = 0, style }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const drag = useRef<{ active: boolean; sx: number; sy: number; px: number; py: number }>({
    active: false,
    sx: 0,
    sy: 0,
    px: 0,
    py: 0,
  });
  const reducedMotion = useReducedMotion();

  function apply(lift: boolean) {
    const el = ref.current;
    if (!el) return;
    el.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) rotate(${rotate}deg) scale(${lift ? 1.04 : 1})`;
    el.style.zIndex = lift ? "30" : "1";
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (reducedMotion) return;
    // These pieces often sit inside a clickable card (e.g. a project
    // link) — picking one up must never trigger that navigation.
    e.stopPropagation();
    drag.current = { active: true, sx: e.clientX, sy: e.clientY, px: pos.current.x, py: pos.current.y };
    ref.current?.setPointerCapture(e.pointerId);
    apply(true);
    playSound("click");
  }

  function onClick(e: React.MouseEvent<HTMLDivElement>) {
    // Under reduced motion, dragging is disabled entirely — let the
    // click pass through to whatever the piece sits inside (e.g. a
    // project link), so functionality never depends on this motion.
    if (reducedMotion) return;
    e.preventDefault();
    e.stopPropagation();
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current.active) return;
    pos.current = {
      x: drag.current.px + (e.clientX - drag.current.sx),
      y: drag.current.py + (e.clientY - drag.current.sy),
    };
    apply(true);
  }

  function endDrag() {
    if (!drag.current.active) return;
    drag.current.active = false;
    apply(false);
    playSound("pop");
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        transform: `rotate(${rotate}deg)`,
        touchAction: reducedMotion ? undefined : "none",
        cursor: reducedMotion ? undefined : "grab",
      }}
      data-cursor={reducedMotion ? undefined : "drag"}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
