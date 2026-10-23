"use client";

import { useEffect, useRef } from "react";
import { skillLabels } from "@/data/skills";
import { ensureGsap, gsap, motionAllowed } from "@/lib/gsapConfig";

const BASE_SPEED = 45; // px per second while idle
const MAX_BOOST = 900; // extra px per second at full scroll speed

/**
 * A band of skills scrolling sideways like a trackside banner. It
 * idles slowly, speeds up with how fast you scroll, and reverses
 * direction when you scroll back up. Press and drag (or swipe
 * sideways on a trackpad) to scrub through it by hand; let go and it coasts on, then settles back into its drift. Static (and wrapped) under reduced
 * motion. The list is read once by screen readers — the second copy
 * that makes the loop seamless is aria-hidden.
 */
export default function SkillsTicker() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !motionAllowed()) return;
    ensureGsap();
    track.dataset.running = "true";

    let x = 0;
    let dir = -1;
    let lastY = window.scrollY;
    let boost = 0;
    // drag state: while held, the band follows the pointer; on release it
    // keeps the throw's momentum and decays back into its normal drift
    let dragging = false;
    let lastPointerX = 0;
    let throwVelocity = 0; // px per second

    const wrap = (value: number) => {
      const half = track!.scrollWidth / 2;
      if (half <= 0) return value;
      while (value <= -half) value += half;
      while (value > 0) value -= half;
      return value;
    };

    const band = track.parentElement!;
    function onDown(e: PointerEvent) {
      dragging = true;
      lastPointerX = e.clientX;
      throwVelocity = 0;
      band.setPointerCapture(e.pointerId);
      band.dataset.dragging = "true";
    }
    function onMove(e: PointerEvent) {
      if (!dragging) return;
      const dx = e.clientX - lastPointerX;
      lastPointerX = e.clientX;
      x = wrap(x + dx);
      throwVelocity = dx * 60;
      if (dx !== 0) dir = dx < 0 ? -1 : 1;
      gsap.set(track, { x });
    }
    function onUp() {
      dragging = false;
      delete band.dataset.dragging;
    }
    // trackpad two-finger sideways swipe (or a horizontal mouse wheel):
    // scrub the band. Mostly-vertical gestures are left alone so the
    // page still scrolls normally over it.
    function onWheel(e: WheelEvent) {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      e.stopPropagation();
      x = wrap(x - e.deltaX);
      throwVelocity = -e.deltaX * 30;
      dir = e.deltaX > 0 ? -1 : 1;
      gsap.set(track, { x });
    }
    band.addEventListener("wheel", onWheel, { passive: false });
    band.addEventListener("pointerdown", onDown);
    band.addEventListener("pointermove", onMove);
    band.addEventListener("pointerup", onUp);
    band.addEventListener("pointercancel", onUp);

    function tick(_time: number, deltaMs: number) {
      const dt = Math.min(deltaMs, 50) / 1000;
      if (dragging) return;
      const y = window.scrollY;
      const dy = y - lastY;
      lastY = y;
      if (dy !== 0) dir = dy > 0 ? -1 : 1;
      // scroll velocity in px/s, eased so the band doesn't jitter
      const target = Math.min(Math.abs(dy) / Math.max(dt, 0.001), 4000) / 4000;
      boost += (target - boost) * 0.1;
      throwVelocity *= Math.pow(0.05, dt); // momentum fades within ~a second
      x = wrap(x + dir * (BASE_SPEED + boost * MAX_BOOST) * dt + throwVelocity * dt);
      gsap.set(track, { x });
    }

    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      band.removeEventListener("wheel", onWheel);
      band.removeEventListener("pointerdown", onDown);
      band.removeEventListener("pointermove", onMove);
      band.removeEventListener("pointerup", onUp);
      band.removeEventListener("pointercancel", onUp);
      delete track.dataset.running;
      gsap.set(track, { clearProps: "transform" });
    };
  }, []);

  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {skillLabels.map((label, i) => (
        <li key={label} className="flex items-center">
          <span
            className={`font-display text-4xl md:text-6xl tracking-tight whitespace-nowrap px-6 md:px-8 ${
              i % 2 === 0 ? "text-fg" : "ticker-outline"
            }`}
          >
            {label}
          </span>
          <span className="text-accent text-2xl" aria-hidden="true">
            ✦
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <section
      aria-label="Skills"
      data-cursor="drag"
      className="relative py-10 md:py-14 overflow-hidden border-y border-fg-faint/25 bg-bg/75 select-none cursor-grab data-[dragging]:cursor-grabbing"
      style={{ touchAction: "pan-y" }}
    >
      <div ref={trackRef} className="ticker-track flex w-max">
        {row(false)}
        {row(true)}
      </div>
    </section>
  );
}
