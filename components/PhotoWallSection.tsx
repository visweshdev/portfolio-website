"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { preload } from "react-dom";
import { CATEGORY_LABEL, photoWallSource, type Photo } from "@/data/photography";
import PhotoLightbox from "@/components/PhotoLightbox";
import { INTRO_DONE_EVENT, SCENE_READY_EVENT } from "@/lib/intro";
import { playSound } from "@/lib/sound";
import { useRichMotion } from "@/lib/useRichMotion";

// three.js only loads for visitors who'll actually see the wall.
const PhotoWall = dynamic(() => import("@/components/three/PhotoWall"), { ssr: false, loading: () => null });

function preloadPrints(photos: Photo[]) {
  for (const photo of photos) {
    const src = photoWallSource(photo);
    if (src) preload(src, { as: "image", crossOrigin: "anonymous" });
  }
}

/**
 * The 3D photo wall (homepage photography section and /photography) — for mouse/trackpad visitors
 * without reduced motion it *replaces* the print grid rather than
 * duplicating it. Which of the two shows is decided in CSS before first
 * paint (`.photo-wall` / `.photo-grid` in globals.css, using the same
 * conditions as useRichMotion), so neither flashes in and then vanishes.
 *
 * The 3D canvas itself can't be reached by keyboard or screen reader, so
 * the section also carries a list of plain buttons — visually hidden
 * until focused — that open the same lightbox.
 */
export default function PhotoWallSection({ photos }: { photos: Photo[] }) {
  const rich = useRichMotion();
  const [open, setOpen] = useState<Photo | null>(null);
  const [loadWall, setLoadWall] = useState(false);
  const wallRef = useRef<HTMLDivElement>(null);
  const withImages = useMemo(() => photos.filter((photo) => photo.src), [photos]);

  useEffect(() => {
    const wall = wallRef.current;
    if (!rich || !wall) return;

    // Give the prints facing the visitor a head start once the hero has
    // painted. The offscreen wall still allocates no WebGL context.
    const center = Math.floor(withImages.length / 2);
    const warmCenter = () => preloadPrints(withImages.slice(Math.max(0, center - 1), center + 2));
    let warmTimer: number | undefined;
    if (document.documentElement.classList.contains("intro")) {
      window.addEventListener(SCENE_READY_EVENT, warmCenter, { once: true });
      window.addEventListener(INTRO_DONE_EVENT, warmCenter, { once: true });
    } else {
      warmTimer = window.setTimeout(warmCenter, 300);
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      preloadPrints(withImages);
      setLoadWall(true);
      observer.disconnect();
    }, { rootMargin: "1400px 0px" });
    observer.observe(wall);
    return () => {
      observer.disconnect();
      window.clearTimeout(warmTimer);
      window.removeEventListener(SCENE_READY_EVENT, warmCenter);
      window.removeEventListener(INTRO_DONE_EVENT, warmCenter);
    };
  }, [rich, withImages]);

  return (
    <div role="region" aria-label="Photo wall" className="photo-wall mt-12">
      <p className="label-mono text-fg-subtle mb-3">DRAG TO LOOK ALONG THE WALL · CLICK A PRINT TO OPEN IT</p>
      {/* fixed height reserved up front, so nothing below jumps when the 3D chunk arrives */}
      <div ref={wallRef} className="h-[70svh] min-h-[420px] rounded-2xl border border-fg-faint/25 bg-bg-raised/40 overflow-hidden">
        {rich && loadWall && <PhotoWall photos={withImages} onOpen={setOpen} paused={open !== null} />}
      </div>

      <ul className="mt-4 flex flex-wrap gap-2">
        {withImages.map((photo) => (
          <li key={photo.id}>
            <button
              type="button"
              onClick={() => {
                playSound("pop");
                setOpen(photo);
              }}
              className="sr-only focus:not-sr-only label-mono !text-[11px] border border-fg-faint rounded-full px-4 py-2 hover:border-accent hover:text-accent"
            >
              View photo: {photo.caption} ({CATEGORY_LABEL[photo.category]}, {photo.year})
            </button>
          </li>
        ))}
      </ul>

      {open && <PhotoLightbox photo={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
