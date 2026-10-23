"use client";

import { useEffect, useRef } from "react";
import { ensureGsap, gsap } from "@/lib/gsapConfig";
import { useRichMotion } from "@/lib/useRichMotion";

/**
 * A 3D arcade cabinet around the open game: a glowing marquee with the
 * game's name, side panels with real depth, a bezel around the "screen"
 * (the live game itself) and a decorative control deck. The cabinet
 * turns gently toward the cursor so the sides catch the light.
 *
 * Built from CSS 3D transforms rather than WebGL so the game inside
 * stays ordinary, fully interactive and accessible DOM. Flat (no tilt)
 * on touch devices and reduced motion; the side panels and deck drop
 * away on small screens so the game keeps its full size.
 */
export default function ArcadeCabinet({ title, children }: { title: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const rich = useRichMotion();

  // Shrink the whole cabinet to fit the window's height, so the game
  // never needs scrolling to reach its bottom (Flappy's tall canvas, 2048's
  // touch pad, Word Guess's keyboard…). Re-measured when the window
  // resizes or the game's own size changes (e.g. once it finishes loading).
  useEffect(() => {
    const stage = stageRef.current;
    const cab = ref.current;
    if (!stage || !cab) return;
    const MARGIN = 96; // room for the close button and breathing space
    function fit() {
      stage!.style.zoom = "1";
      const natural = cab!.offsetHeight;
      const available = window.innerHeight - MARGIN;
      stage!.style.zoom = natural > available ? String(Math.max(available / natural, 0.4)) : "1";
    }
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(cab);
    window.addEventListener("resize", fit);
    // games load as separate chunks — re-check once they've likely arrived
    const timers = [250, 800, 2000].map((ms) => window.setTimeout(fit, ms));
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !rich) return;
    ensureGsap();
    gsap.set(el, { rotationY: -6, rotationX: 2 });
    const rotY = gsap.quickTo(el, "rotationY", { duration: 0.9, ease: "power3" });
    const rotX = gsap.quickTo(el, "rotationX", { duration: 0.9, ease: "power3" });
    function onMove(e: MouseEvent) {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      rotY(nx * 16);
      rotX(2 - ny * 6);
    }
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      gsap.killTweensOf(el);
      gsap.set(el, { clearProps: "transform" });
    };
  }, [rich]);

  return (
    <div ref={stageRef} className="cabinet-stage">
      <div ref={ref} className="cabinet">
        <div className="cabinet__marquee">
          <span>{title}</span>
        </div>
        <div className="cabinet__body">
          <span aria-hidden="true" className="cabinet__side cabinet__side--left" />
          <span aria-hidden="true" className="cabinet__side cabinet__side--right" />
          <div className="cabinet__bezel">
            <div className="cabinet__screen">{children}</div>
          </div>
          <div aria-hidden="true" className="cabinet__deck">
            <span className="cabinet__stick" />
            <span className="cabinet__btn cabinet__btn--a" />
            <span className="cabinet__btn cabinet__btn--b" />
            <span className="cabinet__btn cabinet__btn--c" />
          </div>
        </div>
      </div>
    </div>
  );
}
