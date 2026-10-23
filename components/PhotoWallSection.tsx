"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { CATEGORY_LABEL, type Photo } from "@/data/photography";
import PhotoLightbox from "@/components/PhotoLightbox";
import { playSound } from "@/lib/sound";
import { useRichMotion } from "@/lib/useRichMotion";

// three.js only loads for visitors who'll actually see the wall.
const PhotoWall = dynamic(() => import("@/components/three/PhotoWall"), { ssr: false, loading: () => null });

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
  const withImages = photos.filter((p) => p.src);

  return (
    <div role="region" aria-label="Photo wall" className="photo-wall mt-12">
      <p className="label-mono text-fg-subtle mb-3">DRAG TO LOOK ALONG THE WALL · CLICK A PRINT TO OPEN IT</p>
      {/* fixed height reserved up front, so nothing below jumps when the 3D chunk arrives */}
      <div className="h-[70svh] min-h-[420px] rounded-2xl border border-fg-faint/25 bg-bg-raised/40 overflow-hidden">
        {rich && <PhotoWall photos={photos} onOpen={setOpen} />}
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
