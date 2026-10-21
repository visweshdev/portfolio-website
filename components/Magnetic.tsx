"use client";

import { useRef } from "react";
import { ensureGsap, gsap } from "@/lib/gsapConfig";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * Wraps a button/link so it drifts slightly toward the cursor on
 * approach and springs back on leave — a small, tactile "this thing is
 * alive" moment on the site's key calls to action. Inert under
 * prefers-reduced-motion (the wrapped element still works normally,
 * it just doesn't move).
 */
export default function Magnetic({
  children,
  strength = 0.35,
  className = "",
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reducedMotion) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * strength;
    const y = (e.clientY - rect.top - rect.height / 2) * strength;
    ensureGsap();
    gsap.to(el, { x, y, duration: 0.3, ease: "power3.out" });
  }

  function onLeave() {
    if (reducedMotion) return;
    ensureGsap();
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
  }

  return (
    <div ref={ref} className={`inline-block ${className}`} onMouseMove={onMove} onMouseLeave={onLeave}>
      {children}
    </div>
  );
}
