import type Lenis from "lenis";

/**
 * A module-level handle to the single Lenis instance SmoothScroll
 * creates. Lets other client components (e.g. the logo's "scroll to
 * top" behavior) drive the same smooth-scroll engine instead of
 * fighting it with a raw `window.scrollTo`.
 */
export const lenisInstance: { current: Lenis | null } = { current: null };

/**
 * Smooth-scrolls to the homepage section with this id (using Lenis when
 * it's active) and puts `#id` in the URL, so a refresh or a shared link
 * lands on the same section. The gap left for the fixed header comes
 * from the section's CSS `scroll-margin-top` (globals.css), which both
 * Lenis and scrollIntoView already honour — so no offset is added here.
 */
export function scrollToSection(id: string, smooth = true) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenisInstance.current) {
    lenisInstance.current.scrollTo(el, { duration: smooth ? 1.2 : 0 });
  } else {
    el.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
  }
  window.history.replaceState(window.history.state, "", `#${id}`);
}

/** Scrolls to the very top, using Lenis when it's active. */
export function scrollToTop(smooth = true) {
  if (lenisInstance.current) {
    lenisInstance.current.scrollTo(0, { duration: smooth ? 1 : 0 });
  } else {
    window.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
  }
}
