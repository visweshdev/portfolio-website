"use client";

import { useEffect, useRef } from "react";
import { ensureGsap, gsap, motionAllowed } from "@/lib/gsapConfig";

/**
 * Lays its children out side by side and, on large mouse/trackpad
 * screens, pins the row while vertical scrolling slides it sideways.
 * Everywhere else (phones, tablets, reduced motion — or if the row
 * would be too tall to fit on screen while pinned) it's a normal
 * vertical stack, exactly as server-rendered.
 */
export default function HorizontalRail({ children }: { children: React.ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track || !motionAllowed()) return;
    const g = ensureGsap();
    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px) and (pointer: fine)", () => {
      track.classList.add("is-rail");
      // never pin something taller than the screen — you'd lose part of it
      if (wrap.offsetHeight > window.innerHeight * 0.96) {
        track.classList.remove("is-rail");
        return;
      }
      const distance = () => Math.max(track.scrollWidth - wrap.clientWidth, 0);
      g.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: wrap,
          start: "center center",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });
      return () => track.classList.remove("is-rail");
    });

    return () => mm.revert();
  }, []);

  return (
    <div ref={wrapRef} className="h-rail">
      <div ref={trackRef} className="h-rail__track">
        {children}
      </div>
    </div>
  );
}
