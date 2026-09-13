"use client";

import { useEffect, useRef } from "react";
import { ensureGsap, ScrollTrigger } from "@/lib/gsapConfig";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * Counts up from 0 to `value` (e.g. "1,000+", "25+") once scrolled into
 * view. Renders the final value directly for the first paint (SSR-safe,
 * no hydration mismatch) — the count-up is a purely client-side,
 * post-mount embellishment layered on top via direct DOM mutation.
 *
 * Never touches textContent until the moment it's actually about to
 * animate, and always restores the real `value` on cleanup — otherwise
 * an effect re-run (e.g. `reducedMotion` settling from its SSR-safe
 * default to its real value right after mount) can tear the animation
 * down mid-flight and leave the number stuck at 0.
 */
export default function AnimatedNumber({ value, className = "" }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion) return;
    const match = value.match(/^([\d,]+)(.*)$/);
    if (!match) return;
    const target = parseInt(match[1].replace(/,/g, ""), 10);
    const suffix = match[2];
    if (Number.isNaN(target)) return;

    const gsapInstance = ensureGsap();
    const counter = { n: 0 };
    let tween: gsap.core.Tween | null = null;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: () => {
        el.textContent = "0" + suffix;
        tween = gsapInstance.to(counter, {
          n: target,
          duration: 1.2,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = Math.floor(counter.n).toLocaleString() + suffix;
          },
          onComplete: () => {
            el.textContent = value;
          },
        });
      },
    });

    return () => {
      trigger.kill();
      tween?.kill();
      el.textContent = value;
    };
  }, [value, reducedMotion]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
