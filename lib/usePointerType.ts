"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(pointer: fine)";

function subscribe(callback: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

// Server default: assume no fine pointer, so nothing SSRs as
// mouse-only-dependent. Reconciled with the real value post-hydration
// via useSyncExternalStore, without a hydration-mismatch warning.
function getServerSnapshot() {
  return false;
}

/**
 * True when the primary input is a fine pointer (mouse/trackpad).
 * Used to gate the custom cursor and hover-only parallax effects off
 * on touch devices, where they'd otherwise misbehave.
 */
export function useFinePointer(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
