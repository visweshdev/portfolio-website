import { ViewTransition } from "react";

/**
 * Next.js remounts `template.tsx` on every navigation (unlike layout,
 * which persists), so wrapping it in a <ViewTransition> gives every
 * route change an exit + enter: the `page-wipe` animation in
 * globals.css. Navigations are React transitions, so this needs no
 * router wrapper. Browsers without the View Transitions API simply
 * navigate instantly; reduced motion zeroes the animation.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page-wipe" exit="page-wipe" default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
