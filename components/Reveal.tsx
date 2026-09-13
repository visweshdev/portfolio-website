"use client";

import { useEffect, useRef } from "react";
import { ensureGsap, gsap, ScrollTrigger } from "@/lib/gsapConfig";

type Props = {
  children: React.ReactNode;
  className?: string;
  y?: number;
  delay?: number;
  as?: "div" | "span";
};

/**
 * Fades and lifts its children into place once scrolled into view.
 * A single, restrained reveal used throughout the site instead of a
 * different bespoke animation per section.
 */
export default function Reveal({ children, className = "", y = 28, delay = 0, as = "div" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const gsapInstance = ensureGsap();

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      gsapInstance.set(el, { opacity: 1, y: 0 });
      return;
    }

    gsapInstance.set(el, { opacity: 0, y });
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top 88%",
      once: true,
      onEnter: () => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          delay,
          ease: "expo.out",
        });
      },
    });

    return () => trigger.kill();
  }, [y, delay]);

  const Comp = as;
  return (
    <Comp ref={ref as never} className={className}>
      {children}
    </Comp>
  );
}
