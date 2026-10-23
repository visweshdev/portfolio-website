"use client";

import { useEffect, useRef } from "react";
import { ensureGsap, motionAllowed, ScrollTrigger } from "@/lib/gsapConfig";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/_#";

/**
 * A mono label that "decodes" as it scrolls into view — scrambling
 * through random characters before settling, like a telemetry readout.
 * Screen readers get the real text from a visually hidden copy; the
 * animated one is aria-hidden so its in-between gibberish is never read.
 */
export default function ScrambleLabel({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !motionAllowed()) return;
    const g = ensureGsap();
    const tween = g.to(el, {
      duration: 1.1,
      paused: true,
      scrambleText: { text, chars: CHARS, revealDelay: 0.3, speed: 0.6 },
    });
    const trigger = ScrollTrigger.create({ trigger: el, start: "top 92%", once: true, onEnter: () => void tween.play() });
    return () => {
      trigger.kill();
      tween.kill();
      el.textContent = text;
    };
  }, [text]);

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span ref={ref} aria-hidden="true">
        {text}
      </span>
    </span>
  );
}
