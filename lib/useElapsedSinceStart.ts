"use client";

import { useRef, useSyncExternalStore } from "react";
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

  return useSyncExternalStore(
    (callback) => {
      if (!active) return () => {};
      const id = setInterval(() => {
        cached.current = performance.now() - SESSION_START;
        callback();
      }, 250);
      return () => clearInterval(id);
    },
    () => cached.current,
    getServerSnapshot
  );
}
