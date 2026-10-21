"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

// The server can't know the visitor's OS/browser preference, so it
// always renders the "full motion" default — useSyncExternalStore
// reconciles that with the real client value after hydration without
// a mismatch warning, unlike a useState+useEffect version of this.
function getServerSnapshot() {
  return false;
}

/**
 * Tracks the user's prefers-reduced-motion setting reactively.
 * Components should use this to disable parallax, cursor-follow,
 * and non-essential Three.js/GSAP motion.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
