"use client";

import { useEffect, useRef } from "react";
import { ensureGsap, gsap } from "@/lib/gsapConfig";
import { useRichMotion } from "@/lib/useRichMotion";

/**
 * Tilts its content in 3D toward the cursor, with a soft highlight that
 * follows the pointer — a physical "card in your hand" feel. Pauses
 * while a button is held (so dragging a collage piece inside doesn't
 * fight it) and is a plain wrapper on touch devices or reduced motion.
 *
 * Pass the same rounding as the child (e.g. `rounded-xl`) in className
 * so the highlight is clipped to the card's corners.
 */
export default function Tilt({
  children,
  className = "",
  max = 6,
}: {
  children: React.ReactNode;
  className?: string;
  /** Maximum tilt in degrees at the card's edge. */
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rich = useRichMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || !rich) return;
    ensureGsap();
    gsap.set(el, { transformPerspective: 900 });
    const rotX = gsap.quickTo(el, "rotationX", { duration: 0.5, ease: "power3" });
    const rotY = gsap.quickTo(el, "rotationY", { duration: 0.5, ease: "power3" });
    let pressed = false;

    function settle() {
      rotX(0);
      rotY(0);
      delete el!.dataset.tilting;
    }
    function onMove(e: PointerEvent) {
      if (pressed || e.buttons) return;
      const r = el!.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      rotY(nx * max * 2);
      rotX(-ny * max * 2);
      el!.style.setProperty("--glare-x", `${(nx + 0.5) * 100}%`);
      el!.style.setProperty("--glare-y", `${(ny + 0.5) * 100}%`);
      el!.dataset.tilting = "true";
    }
    function onDown() {
      pressed = true;
      settle();
    }
    function onUp() {
      pressed = false;
    }

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", settle);
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", settle);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      gsap.killTweensOf(el);
      gsap.set(el, { clearProps: "transform" });
    };
  }, [rich, max]);

  return (
    <div ref={ref} className={`tilt ${className}`}>
      {children}
      <span aria-hidden="true" className="tilt__glare" />
    </div>
  );
}
