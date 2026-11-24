"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";
import { SESSION_START } from "@/lib/sessionStart";

function getServerSnapshot() {
  return 0;
}

/**
 * Milliseconds elapsed since SESSION_START (i.e. since this visitor
 * entered the site), ticking every 250ms while `active`.
 *
 * useSyncExternalStore requires getSnapshot to return a CACHED,
 * stable value — it's called defensively on every render to check for
 * tearing, so if it computed a fresh `performance.now()` each time
 * (always different), React would see "the store changed" on every
 * single render and spin forever. The snapshot is only updated inside
 * the interval tick, and getSnapshot just reads that cached ref.
 */
export function useElapsedSinceStart(active: boolean): number {
  const cached = useRef(0);
  const subscribe = useCallback((callback: () => void) => {
    if (!active) return () => {};
    let timer: ReturnType<typeof setInterval> | undefined;
    const tick = () => {
      cached.current = performance.now() - SESSION_START;
      callback();
    };
    const sync = () => {
      clearInterval(timer);
      if (document.hidden) return;
      tick();
      timer = setInterval(tick, 250);
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [active]);
  const getSnapshot = useCallback(() => cached.current, []);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
