"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

/**
 * requestAnimationFrame loop with a delta-time callback. Automatically
 * skips ticks while the tab is hidden (keeps the arcade "browser
 * optimized" — no wasted work in background tabs) and always cancels
 * cleanly on unmount or when `running` goes false.
 */
export function useGameLoop(callback: (dt: number) => void, running: boolean) {
  const cbRef = useRef(callback);
  useLayoutEffect(() => {
    cbRef.current = callback;
  });

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();

    function frame(now: number) {
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      if (!document.hidden) {
        cbRef.current(dt);
      }
      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [running]);
}
