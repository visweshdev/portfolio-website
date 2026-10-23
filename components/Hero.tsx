"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { ensureGsap, gsap, motionAllowed } from "@/lib/gsapConfig";
import GridBackground from "@/components/GridBackground";
import FloatingObject from "@/components/FloatingObject";
import { useElapsedSinceStart } from "@/lib/useElapsedSinceStart";
import { useRichMotion } from "@/lib/useRichMotion";
import { INTRO_DONE_EVENT } from "@/lib/intro";
import { CAR_ON_TRACK_EVENT } from "@/lib/carEvents";
import {
  CameraIcon,
  F1SilhouetteIcon,
  CodeBracketsIcon,
  NodeIcon,
} from "@/components/icons";

// three.js is its own chunk, fetched only when the 3D track will run.
const TrackScene = dynamic(() => import("@/components/three/TrackScene"), {
  ssr: false,
  loading: () => null,
});

const HEADLINE = ["BUILD.", "LEARN.", "CAPTURE."];

/** The signature curve as a flat, still SVG — shown instead of the
 *  three.js scene on touch devices and under reduced motion, where the
 *  3D version's cursor-driven interaction has nothing to respond to.
 *  Also what renders server-side, before the pointer type is known. */
function StaticCurve() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1600 600"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full pointer-events-none"
    >
      <path
        d="M-40 400 C 140 250, 300 210, 440 330 S 660 450, 800 280 S 1060 250, 1180 360 S 1440 300, 1640 320"
        fill="none"
        stroke="var(--color-fg)"
        strokeOpacity="0.32"
        strokeWidth="1.5"
      />
      {[
        [300, 236, "var(--color-accent)"],
        [620, 404, "var(--color-fg)"],
        [930, 268, "var(--color-fg)"],
        [1250, 352, "var(--color-accent)"],
      ].map(([cx, cy, fill]) => (
        <circle key={cx} cx={cx} cy={cy} r="4" fill={fill as string} fillOpacity="0.45" />
      ))}
    </svg>
  );
}

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

/** A hint for the parked F1 car; fades away once the car is on the line. */
function CarHint() {
  const [onTrack, setOnTrack] = useState(false);
  useEffect(() => {
    const done = () => setOnTrack(true);
    window.addEventListener(CAR_ON_TRACK_EVENT, done, { once: true });
    return () => window.removeEventListener(CAR_ON_TRACK_EVENT, done);
  }, []);
  return (
    <p
      aria-hidden="true"
      className={`label-mono transition-opacity duration-700 ${onTrack ? "opacity-0" : "opacity-100"}`}
    >
      <span className="text-accent">DRAG THE CAR ONTO THE LINE</span> · OR JUST SCROLL
    </p>
  );
}

export default function Hero() {
  const linesRef = useRef<(HTMLSpanElement | null)[]>([]);
  // The 3D track (and its 3D pillar objects) only download and run
  // where their cursor-driven interaction actually works.
  const show3d = useRichMotion();

  useEffect(() => {
    const gsapInstance = ensureGsap();
    const lines = linesRef.current.filter(Boolean);

    if (!motionAllowed()) {
      gsapInstance.set(lines, { y: 0, opacity: 1 });
      return;
    }

    gsapInstance.set(lines, { y: "110%" });
    let tween: gsap.core.Tween | null = null;
    const play = () => {
      tween = gsap.to(lines, { y: "0%", duration: 1, ease: "expo.out", stagger: 0.1, delay: 0.15 });
    };
    // On a first visit the lights-out intro covers the page — hold the
    // headline back until the lights go out, so it's actually seen.
    if (document.documentElement.classList.contains("intro")) {
      window.addEventListener(INTRO_DONE_EVENT, play, { once: true });
    } else {
      play();
    }
    return () => {
      window.removeEventListener(INTRO_DONE_EVENT, play);
      tween?.kill();
    };
  }, []);

  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden" aria-label="Introduction">
      <GridBackground />
      {show3d ? (
        <TrackScene />
      ) : (
        <>
          <StaticCurve />
          {/* flat identity icons — the 3D scene has its own 3D versions.
              Positioned to clear the lap clock / scroll cue (top ~12-20%, bottom
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
        </>
      )}

      {/* lap clock (sits below fixed nav) */}
      <div className="page-pad relative z-10 pt-24 md:pt-28 flex justify-end">
        <SessionClock />
      </div>

      {/* headline — bottom padding reserves room for the absolutely
          positioned scroll cue, so on short windows the hero grows
          instead of the headline running into it */}
      <div className="page-pad relative z-10 mt-[8svh] md:mt-[11svh] pb-32">
        <h1 className="font-display font-medium leading-[0.94] tracking-tight text-fg text-[13vw] sm:text-[10vw] md:text-[7.4vw] lg:text-[6.4vw]">
          {HEADLINE.map((line, i) => (
            <span key={line} className="block overflow-hidden">
              <span
                ref={(el) => {
                  linesRef.current[i] = el;
                }}
                className="block"
                data-hero-line=""
              >
                {line}
              </span>
            </span>
          ))}
        </h1>
      </div>

      {/* darkens the bottom of the hero so the bright near end of the 3D
          track doesn't run straight through the scroll cue */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-bg via-bg/70 to-transparent"
      />

      {/* scroll cue */}
      <div className="page-pad absolute bottom-0 left-0 right-0 z-10 pb-8 md:pb-10 flex items-end justify-between gap-4">
        {show3d ? <CarHint /> : <span />}
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
