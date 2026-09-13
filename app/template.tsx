"use client";

import { useEffect, useRef } from "react";
import { ensureGsap, gsap } from "@/lib/gsapConfig";

/**
 * Next.js remounts `template.tsx` on every navigation (unlike layout,
 * which persists) — the exact hook needed for a per-page entrance
 * animation without a bespoke router wrapper. Kept deliberately quiet:
 * a short fade + lift, never a hard cut, never a hijack of scroll.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const gsapInstance = ensureGsap();
    gsapInstance.set(el, { opacity: 0, y: 14 });
    gsap.to(el, { opacity: 1, y: 0, duration: 0.55, ease: "power2.out" });
  }, []);

  return <div ref={ref}>{children}</div>;
}
