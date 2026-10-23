"use client";

import { useEffect, useRef } from "react";
import { useRichMotion } from "@/lib/useRichMotion";

const MAX_WARP = 26; // px of ripple displacement at full strength
const MAX_SPLIT = 5; // px of red/blue channel separation at full strength

/**
 * Ripples and colour-splits its content while the cursor moves over it,
 * in proportion to how fast the cursor moves — still cursor, still image.
 * Drives the shared `#hover-distort` SVG filter (HoverDistortFilter.tsx),
 * applying it only while there's energy to show, so idle elements pay
 * no filter cost. Inert on touch devices and under reduced motion.
 */
export default function HoverDistort({
  as: Tag = "div",
  className = "",
  children,
}: {
  as?: "div" | "span";
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const rich = useRichMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || !rich) return;
    const map = document.getElementById("hover-distort-map");
    const red = document.getElementById("hover-distort-r");
    const blue = document.getElementById("hover-distort-b");
    const noise = document.getElementById("hover-distort-noise");
    if (!map || !red || !blue || !noise) return;

    let energy = 0;
    let raf = 0;
    let last: { x: number; y: number; t: number } | null = null;

    function render() {
      energy *= 0.9;
      if (energy < 0.01) {
        energy = 0;
        el!.style.filter = "";
        raf = 0;
        return;
      }
      el!.style.filter = "url(#hover-distort)";
      map!.setAttribute("scale", String(energy * MAX_WARP));
      red!.setAttribute("dx", String(energy * MAX_SPLIT));
      blue!.setAttribute("dx", String(-energy * MAX_SPLIT));
      // let the ripple pattern drift so it reads as liquid, not a fixed warp
      const t = performance.now() / 1000;
      noise!.setAttribute("baseFrequency", `${0.008 + Math.sin(t) * 0.002} ${0.03 + Math.cos(t * 0.8) * 0.006}`);
      raf = requestAnimationFrame(render);
    }

    function onMove(e: PointerEvent) {
      // dragging a collage piece inside shouldn't warp the whole board
      if (e.buttons) return;
      const now = performance.now();
      if (last) {
        const dt = Math.max(now - last.t, 1);
        const speed = Math.hypot(e.clientX - last.x, e.clientY - last.y) / dt; // px per ms
        energy = Math.min(1, energy + speed * 0.12);
      }
      last = { x: e.clientX, y: e.clientY, t: now };
      if (!raf) raf = requestAnimationFrame(render);
    }
    function onLeave() {
      last = null;
    }

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
      el.style.filter = "";
    };
  }, [rich]);

  return (
    <Tag ref={ref as never} className={className}>
      {children}
    </Tag>
  );
}
