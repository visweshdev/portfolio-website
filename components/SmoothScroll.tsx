"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { ensureGsap, gsap, ScrollTrigger } from "@/lib/gsapConfig";
import { lenisInstance } from "@/lib/lenisInstance";

/**
 * Wires Lenis smooth scrolling to GSAP's ticker so ScrollTrigger-driven
 * animations stay perfectly in sync with the scroll position.
 *
 * Respects prefers-reduced-motion by skipping Lenis entirely and falling
 * back to native scrolling — content and navigation stay fully usable.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Touch devices keep native, momentum-based scrolling — Lenis is a
    // desktop refinement, not a requirement.
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

    if (prefersReduced || isCoarsePointer) {
      return;
    }

    ensureGsap();

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
    });
    lenisRef.current = lenis;
    lenisInstance.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
      lenisInstance.current = null;
    };
  }, []);

  return <>{children}</>;
}
