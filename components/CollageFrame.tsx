"use client";

import { useEffect, useRef, useState } from "react";

// The collages are laid out in percentages, but their labels and code use
// fixed small type, so below this width the pieces start to crowd. Under
// it the whole collage is drawn at this width and scaled down as one,
// like shrinking a photo, instead of squashing the layout.
const MIN_WIDTH = 330;

/**
 * Wraps a project collage so it stays readable on any screen. Pieces read
 * `data-collage-scale` to keep drags under the finger when it's scaled.
 */
export default function CollageFrame({ children }: { children: React.ReactNode }) {
  const outer = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = outer.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      setScale(w > 0 && w < MIN_WIDTH ? w / MIN_WIDTH : 1);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (scale === 1) {
    return (
      <div ref={outer} data-collage-scale="1">
        {children}
      </div>
    );
  }
  return (
    // the outer box keeps the collage's 6:5 footprint at the real width
    <div ref={outer} className="relative aspect-[6/5] w-full">
      <div
        data-collage-scale={scale}
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: MIN_WIDTH, transform: `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}
