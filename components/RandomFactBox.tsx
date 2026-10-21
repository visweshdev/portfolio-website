"use client";

import { useCallback, useRef, useState } from "react";
import { facts } from "@/data/facts";
import { ensureGsap } from "@/lib/gsapConfig";
import { playSound } from "@/lib/sound";

function pickNext(currentIndex: number) {
  if (facts.length <= 1) return 0;
  let next = currentIndex;
  while (next === currentIndex) {
    next = Math.floor(Math.random() * facts.length);
  }
  return next;
}

/** A small box that reveals a different real fact every time it's clicked. */
export default function RandomFactBox() {
  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(1);
  const textRef = useRef<HTMLParagraphElement>(null);

  const next = useCallback(() => {
    const nextIndex = pickNext(index);
    setIndex(nextIndex);
    setCount((c) => c + 1);
    playSound("pop");

    const el = textRef.current;
    if (!el) return;
    const gsapInstance = ensureGsap();
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    gsapInstance.fromTo(
      el,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
    );
  }, [index]);

  return (
    <button
      type="button"
      onClick={next}
      data-cursor="link"
      className="group w-full max-w-md text-left border border-fg-faint/30 rounded-2xl p-6 md:p-7 bg-bg hover:border-accent/50 transition-colors"
    >
      <div className="flex items-center justify-between">
        <p className="label-mono text-accent">RANDOM FACT</p>
        <p className="label-mono text-fg-faint">{String(count).padStart(2, "0")}</p>
      </div>
      <p ref={textRef} className="font-display text-xl md:text-2xl leading-snug mt-4 text-fg">
        {facts[index]}
      </p>
      <p className="label-mono mt-5 text-fg-faint group-hover:text-accent transition-colors inline-flex items-center gap-1.5">
        CLICK FOR ANOTHER <span aria-hidden="true">↻</span>
      </p>
    </button>
  );
}
