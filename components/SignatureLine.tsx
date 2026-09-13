"use client";

import { useEffect, useRef } from "react";
import { ensureGsap, gsap } from "@/lib/gsapConfig";

/**
 * The site's recurring motif: a thin line that draws itself as you
 * scroll past it — read as a racetrack line, a timeline, and a signal
 * path all at once. Used sparingly as a section transition.
 */
export default function SignatureLine({ className = "" }: { className?: string }) {
  const pathRef = useRef<SVGPathElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    const wrap = wrapRef.current;
    if (!path || !wrap) return;
    ensureGsap();

    const length = path.getTotalLength();
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      gsap.set(path, { strokeDashoffset: 0 });
      return;
    }

    const tween = gsap.to(path, {
      strokeDashoffset: 0,
      ease: "none",
      scrollTrigger: {
        trigger: wrap,
        start: "top 85%",
        end: "bottom 40%",
        scrub: 0.6,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <div ref={wrapRef} className={`w-full ${className}`} aria-hidden="true">
      <svg viewBox="0 0 1200 60" className="w-full h-auto" preserveAspectRatio="none">
        <path
          ref={pathRef}
          d="M0 30 C 150 5, 260 55, 400 30 S 620 5, 760 30 850 50 950 28 1100 6 1200 30"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        {/* sector markers — a small, honest nod to timing/telemetry */}
        {[
          { x: 400, label: "S1" },
          { x: 760, label: "S2" },
          { x: 1100, label: "S3" },
        ].map((s) => (
          <g key={s.label} opacity="0.55">
            <line x1={s.x} y1="18" x2={s.x} y2="42" stroke="var(--color-fg-faint)" strokeWidth="1" />
            <text x={s.x} y="14" fontSize="10" fontFamily="var(--font-mono)" fill="var(--color-fg-faint)" textAnchor="middle">
              {s.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
