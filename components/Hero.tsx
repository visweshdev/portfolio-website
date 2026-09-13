"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { ensureGsap, gsap } from "@/lib/gsapConfig";
import GridBackground from "@/components/GridBackground";
import FloatingObject from "@/components/FloatingObject";
import SectionLabel from "@/components/SectionLabel";
import { useElapsedSinceStart } from "@/lib/useElapsedSinceStart";
import {
  CameraIcon,
  F1SilhouetteIcon,
  CodeBracketsIcon,
  NodeIcon,
} from "@/components/icons";

const HeroScene = dynamic(() => import("@/components/HeroScene"), {
  ssr: false,
  loading: () => null,
});

const HEADLINE = ["AI BUILDER,", "SKILL COLLECTOR,", "PHOTO CHASER."];

/** A small motorsport-flavored readout: elapsed time since you entered
 *  the site (not since you last landed on this section — it keeps
 *  running across client-side navigation), formatted like a lap clock.
 *  Quietly reinforces the "speed/precision" identity without leaning
 *  on any team's branding. */
function SessionClock() {
  // Deliberately NOT gated by prefers-reduced-motion — this is a text
  // value ticking in place, not a visual motion effect, so pausing it
  // there would just make the clock look broken for no benefit.
  const elapsed = useElapsedSinceStart(true);

  const totalCs = Math.floor(elapsed / 10);
  const mm = String(Math.floor(totalCs / 6000)).padStart(2, "0");
  const ss = String(Math.floor((totalCs / 100) % 60)).padStart(2, "0");
  const cs = String(totalCs % 100).padStart(2, "0");

  return (
    <p className="label-mono tabular-nums" aria-hidden="true">
      LAP {mm}:{ss}.{cs}
    </p>
  );
}

export default function Hero() {
  const linesRef = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const gsapInstance = ensureGsap();
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lines = linesRef.current.filter(Boolean);

    if (prefersReduced) {
      gsapInstance.set(lines, { y: 0, opacity: 1 });
      return;
    }

    gsapInstance.set(lines, { y: "110%" });
    gsap.to(lines, {
      y: "0%",
      duration: 1,
      ease: "expo.out",
      stagger: 0.1,
      delay: 0.25,
    });
  }, []);

  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden bg-bg" aria-label="Introduction">
      <GridBackground />
      <HeroScene />

      {/* floating identity objects — sparse on purpose, one per pillar.
          Positioned to clear the metadata rows (top ~12-20%, bottom
          ~88-100%) and the headline's own footprint. */}
      <FloatingObject top="74%" left="9%" rotate={-6} parallax={14} className="text-fg-faint w-10 hidden sm:block">
        <CameraIcon className="w-10 h-auto" />
      </FloatingObject>
      <FloatingObject top="28%" right="7%" rotate={4} parallax={16} delay={0.2} className="text-fg-faint w-9 hidden sm:block">
        <CodeBracketsIcon className="w-9 h-auto" />
      </FloatingObject>
      <FloatingObject top="46%" right="6%" rotate={-3} parallax={10} delay={0.6} className="text-fg-faint w-8 hidden lg:block">
        <F1SilhouetteIcon className="w-14 h-auto" />
      </FloatingObject>
      <FloatingObject top="76%" right="14%" rotate={0} parallax={12} delay={0.3} className="text-fg-faint w-8 hidden md:block">
        <NodeIcon className="w-8 h-auto" />
      </FloatingObject>

      {/* top metadata row (sits below fixed nav) */}
      <div className="page-pad relative z-10 pt-24 md:pt-28">
        <div className="flex flex-wrap justify-between gap-3">
          <SectionLabel index="01" title="INTRO" />
          <SessionClock />
        </div>
        <div className="flex flex-wrap justify-between gap-3 mt-3">
          <p className="label-mono">BASED IN HYDERABAD, INDIA</p>
          <p className="label-mono text-right">AI / SOFTWARE / PHOTOGRAPHY</p>
        </div>
      </div>

      {/* headline */}
      <div className="page-pad relative z-10 mt-[8svh] md:mt-[11svh]">
        <h1 className="font-display font-medium leading-[0.94] tracking-tight text-fg text-[13vw] sm:text-[10vw] md:text-[7.4vw] lg:text-[6.4vw]">
          {HEADLINE.map((line, i) => (
            <span key={line} className="block overflow-hidden">
              <span
                ref={(el) => {
                  linesRef.current[i] = el;
                }}
                className="block"
              >
                {line}
              </span>
            </span>
          ))}
        </h1>
      </div>

      {/* bottom metadata row */}
      <div className="page-pad absolute bottom-0 left-0 right-0 z-10 pb-8 md:pb-10 flex flex-wrap items-end justify-between gap-4">
        <p className="label-mono">
          COMPUTER SCIENCE
          <br />
          2024—2028
        </p>
        <p className="label-mono text-center">CURRENTLY EXPLORING</p>
        <div className="flex items-center gap-3" aria-hidden="true">
          <span className="label-mono">SCROLL</span>
          <span className="relative h-8 w-px bg-fg-faint overflow-hidden">
            <span className="absolute top-0 left-0 w-full h-1/2 bg-accent animate-[scrollcue_1.8s_ease-in-out_infinite]" />
          </span>
        </div>
      </div>

      <style>{`
        @keyframes scrollcue {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
      `}</style>
    </section>
  );
}
