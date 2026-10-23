"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

let registered = false;

// Tells the inline script in app/layout.tsx that the animation code
// actually loaded. If it never does (blocked/failed JS), that script
// drops the `js` class again so pre-hidden content becomes visible.
if (typeof window !== "undefined") {
  (window as unknown as { __motionReady?: boolean }).__motionReady = true;
}

/**
 * Registers GSAP plugins exactly once, client-side only.
 * Safe to call from any component's render body.
 */
export function ensureGsap() {
  if (registered || typeof window === "undefined") return gsap;
  gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin);
  registered = true;
  return gsap;
}

/** True when the visitor hasn't asked the OS for reduced motion. Client-only. */
export function motionAllowed() {
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export { gsap, ScrollTrigger, SplitText };
