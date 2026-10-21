"use client";

import { useEffect, useRef, useState } from "react";
import { ensureGsap, gsap } from "@/lib/gsapConfig";
import { useFinePointer } from "@/lib/usePointerType";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * A simple, solid cursor dot that follows the pointer. It quietly grows
 * over anything tagged `data-cursor` (links, draggable pieces, etc.) as
 * the one interactivity cue — no ring, no text label.
 *
 * Disabled on touch devices (no pointer to follow). Under
 * prefers-reduced-motion it still renders — hiding it entirely would
 * make it look broken rather than accessible — but skips the eased
 * "chasing" lag in favor of snapping straight to the pointer, so there's
 * no added motion effect layered on top of the system cursor's own
 * movement.
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const isFinePointer = useFinePointer();
  const reducedMotion = useReducedMotion();
  const active = isFinePointer;

  useEffect(() => {
    if (!active) return;
    ensureGsap();
    document.documentElement.classList.add("has-custom-cursor");

    const dot = dotRef.current;
    if (!dot) return;

    const lag = reducedMotion ? 0.01 : 0.18;
    const dotX = gsap.quickTo(dot, "x", { duration: lag, ease: "power3" });
    const dotY = gsap.quickTo(dot, "y", { duration: lag, ease: "power3" });

    function onMove(e: MouseEvent) {
      dotX(e.clientX);
      dotY(e.clientY);
    }

    function onOver(e: MouseEvent) {
      const target = (e.target as HTMLElement)?.closest?.("[data-cursor]");
      setHovering(Boolean(target));
    }

    function onLeaveWindow() {
      gsap.to(dot, { opacity: 0, duration: 0.2 });
    }
    function onEnterWindow() {
      gsap.to(dot, { opacity: 1, duration: 0.2 });
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    document.documentElement.addEventListener("mouseleave", onLeaveWindow);
    document.documentElement.addEventListener("mouseenter", onEnterWindow);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      document.documentElement.removeEventListener("mouseleave", onLeaveWindow);
      document.documentElement.removeEventListener("mouseenter", onEnterWindow);
    };
  }, [active, reducedMotion]);

  if (!active) return null;

  return (
    <div
      ref={dotRef}
      className="cursor-dot"
      aria-hidden="true"
      style={{
        width: hovering ? 40 : 28,
        height: hovering ? 40 : 28,
        marginLeft: hovering ? -20 : -14,
        marginTop: hovering ? -20 : -14,
        background: hovering ? "rgba(110, 110, 110, 0.7)" : "rgba(110, 110, 110, 0.55)",
      }}
    />
  );
}
