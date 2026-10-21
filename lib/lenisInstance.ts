import type Lenis from "lenis";

/**
 * A module-level handle to the single Lenis instance SmoothScroll
 * creates. Lets other client components (e.g. the logo's "scroll to
 * top" behavior) drive the same smooth-scroll engine instead of
 * fighting it with a raw `window.scrollTo`.
 */
export const lenisInstance: { current: Lenis | null } = { current: null };

/** Scrolls to the very top, using Lenis when it's active. */
export function scrollToTop(smooth = true) {
  if (lenisInstance.current) {
    lenisInstance.current.scrollTo(0, { duration: smooth ? 1 : 0 });
  } else {
    window.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
  }
}
