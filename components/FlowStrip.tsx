"use client";

import { useEffect, useRef } from "react";
import { ensureGsap, gsap, motionAllowed, ScrollTrigger } from "@/lib/gsapConfig";

type Step = { label: string; note?: string };

/**
 * A left-to-right chain of small mono boxes joined by arrows — the
 * "pipeline" readout used for the Wipro RAG system and each project's
 * stages. Wraps naturally on narrow screens.
 *
 * As you scroll past it, a glowing packet of data hops from box to box
 * and each stage lights up once the packet reaches it. With `pin`, on
 * large screens the whole section holds still while that plays (only
 * if the section fits on screen — never pins something you can't see
 * all of). Static under reduced motion.
 */
export default function FlowStrip({
  steps,
  className = "",
  pin = false,
  loop = false,
}: {
  steps: (string | Step)[];
  className?: string;
  pin?: boolean;
  /** Instead of the scroll-driven packet: a glow runs through the stages on a loop while visible. */
  loop?: boolean;
}) {
  const ref = useRef<HTMLOListElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const items = steps.map((s) => (typeof s === "string" ? { label: s } : s));

  useEffect(() => {
    const ol = ref.current;
    const dot = dotRef.current;
    if (!ol || !dot || !motionAllowed()) return;
    const g = ensureGsap();
    const boxes = Array.from(ol.querySelectorAll<HTMLElement>("[data-step]"));
    const arrows = Array.from(ol.querySelectorAll<HTMLElement>("[data-arrow]"));
    if (boxes.length === 0) return;

    // centre of a box relative to the list — function-based tween values
    // re-read this on every ScrollTrigger refresh (resize, rewrap)
    const at = (el: HTMLElement, axis: "x" | "y") => {
      const o = ol.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      return axis === "x" ? r.left - o.left + r.width / 2 : r.top - o.top + r.height / 2;
    };

    if (loop) {
      // A pulse of light runs stage to stage, like a query flowing through
      // the pipeline, then pauses and goes again. Plays only on screen.
      const tl = g.timeline({ repeat: -1, repeatDelay: 0.8, paused: true });
      boxes.forEach((box, i) => {
        tl.to(box, {
          borderColor: "rgba(232,163,61,0.9)",
          color: "#f5f5f0",
          backgroundColor: "rgba(232,163,61,0.1)",
          boxShadow: "0 0 18px -2px rgba(232,163,61,0.45)",
          duration: 0.22,
          ease: "power2.out",
        }, i === 0 ? 0 : "-=0.35"); // next stage lights as the last one fades
        if (arrows[i]) tl.to(arrows[i], { color: "#e8a33d", x: 3, duration: 0.18 }, ">-0.05");
        tl.to(box, { clearProps: "borderColor,color,backgroundColor,boxShadow", duration: 0.5 }, ">0.05");
        if (arrows[i]) tl.to(arrows[i], { clearProps: "color,transform", duration: 0.3 }, "<");
      });
      const trigger = ScrollTrigger.create({
        trigger: ol,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (self.isActive ? tl.play() : tl.pause()),
      });
      return () => {
        trigger.kill();
        tl.kill();
        g.set([...boxes, ...arrows], { clearProps: "all" });
      };
    }

    const mm = gsap.matchMedia();
    mm.add({ large: "(min-width: 1024px)" }, (ctx) => {
      const section = pin && ctx.conditions?.large ? ol.closest("section") : null;
      const pinIt = !!section && section.offsetHeight <= window.innerHeight;

      const tl = g.timeline({
        scrollTrigger: pinIt
          ? { trigger: section, start: "top top", end: "+=90%", pin: true, scrub: 0.6, invalidateOnRefresh: true }
          : { trigger: ol, start: "top 82%", end: "bottom 38%", scrub: 0.6, invalidateOnRefresh: true },
      });

      tl.set(dot, { x: () => at(boxes[0], "x"), y: () => at(boxes[0], "y"), opacity: 1 }, 0);
      boxes.forEach((box, i) => {
        if (i > 0) {
          tl.to(arrows[i - 1], { color: "#e8a33d", duration: 0.3 });
          tl.to(dot, { x: () => at(box, "x"), y: () => at(box, "y"), duration: 1, ease: "power1.inOut" }, "<");
        }
        tl.to(
          box,
          { borderColor: "rgba(232,163,61,0.8)", color: "#f5f5f0", backgroundColor: "rgba(232,163,61,0.08)", duration: 0.4 },
          i === 0 ? 0 : ">-0.2"
        );
      });
    });

    return () => mm.revert();
  }, [pin, loop, items.length]);

  return (
    <ol ref={ref} className={`relative flex flex-wrap items-center gap-x-2 gap-y-3 ${className}`}>
      {items.map((step, i) => (
        <li key={step.label} className="flex items-center gap-2">
          <span data-step="" className="font-mono text-[11px] md:text-xs px-2.5 py-1.5 rounded border border-fg-faint/40 text-fg-muted">
            {step.label}
            {step.note && <span className="block text-[9px] md:text-[10px] text-fg-subtle mt-0.5">{step.note}</span>}
          </span>
          {i < items.length - 1 && (
            <span data-arrow="" className="text-fg-subtle" aria-hidden="true">
              →
            </span>
          )}
        </li>
      ))}
      {/* the travelling data packet */}
      <span
        ref={dotRef}
        hidden={loop}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 -ml-[5px] -mt-[5px] h-2.5 w-2.5 rounded-full bg-accent opacity-0 shadow-[0_0_12px_3px_rgba(232,163,61,0.6)]"
      />
    </ol>
  );
}
