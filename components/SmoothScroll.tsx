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

  // Every full load / reload starts at the top, on the hero. The inline
  // script in app/layout.tsx already turns off the browser's own scroll
  // restoration; ScrollTrigger keeps a separate scroll memory and restores
  // it after its first layout pass, so clear that too and re-assert the top
  // once the page (fonts, pins, images) has settled. Runs once, on mount —
  // client-side navigations don't remount this layout component.
  useEffect(() => {
    ensureGsap();
    ScrollTrigger.clearScrollMemory("manual");
    const toTop = () => {
      lenisInstance.current?.scrollTo(0, { immediate: true });
      window.scrollTo(0, 0);
    };
    toTop();
    const timers = [100, 400, 1000].map((ms) => window.setTimeout(toTop, ms));
    window.addEventListener("load", toTop, { once: true });
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("load", toTop);
    };
  }, []);

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

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
      lenisInstance.current = null;
    };
  }, []);

  return <>{children}</>;
}
