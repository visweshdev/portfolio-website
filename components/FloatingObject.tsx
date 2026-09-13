"use client";

import { useEffect, useRef } from "react";
import { ensureGsap, gsap } from "@/lib/gsapConfig";
import { useReducedMotion } from "@/lib/useReducedMotion";

type Props = {
  children: React.ReactNode;
  /** Position, in %, relative to the containing relative/absolute parent. */
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  rotate?: number;
  /** How strongly this object drifts toward the cursor, in px. 0 disables. */
  parallax?: number;
  delay?: number;
  className?: string;
};

/**
 * A sparse, independently-drifting decorative object. Combines a slow
 * idle float with a subtle cursor-parallax nudge — the "physical object
 * on a desk" feel called for by the brief. Fully inert under
 * prefers-reduced-motion.
 */
export default function FloatingObject({
  children,
  top,
  left,
  right,
  bottom,
  rotate = 0,
  parallax = 10,
  delay = 0,
  className = "",
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || reducedMotion) return;
    const gsapInstance = ensureGsap();

    // slow idle float
    gsapInstance.to(wrap, {
      y: "+=10",
      duration: 3.4 + Math.random() * 1.6,
      delay,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });
  }, [delay, reducedMotion]);

  useEffect(() => {
    const inner = innerRef.current;
    if (!inner || reducedMotion || parallax === 0) return;
    ensureGsap();

    const moveX = gsap.quickTo(inner, "x", { duration: 0.6, ease: "power3" });
    const moveY = gsap.quickTo(inner, "y", { duration: 0.6, ease: "power3" });

    function onMove(e: MouseEvent) {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      moveX(nx * parallax);
      moveY(ny * parallax);
    }

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [parallax, reducedMotion]);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className={`absolute select-none pointer-events-none ${className}`}
      style={{ top, left, right, bottom }}
    >
      <div ref={innerRef} style={{ transform: `rotate(${rotate}deg)` }}>
        {children}
      </div>
    </div>
  );
}
