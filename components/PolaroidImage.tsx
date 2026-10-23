"use client";

import Image from "next/image";
import { useState } from "react";
import { CATEGORY_LABEL, type Photo } from "@/data/photography";
import { CameraIcon } from "@/components/icons";
import PhotoLightbox from "@/components/PhotoLightbox";
import { playSound } from "@/lib/sound";

/**
 * Renders a photograph inside a paper/polaroid frame. Clicking a real
 * photo opens it full-screen in a lightbox. While `src` is null this
 * renders an explicit, clearly-labeled placeholder — never a stand-in
 * stock photo — so it's obvious which slots still need a real image
 * dropped into /public/photography/.
 *
 * `sizes` should reflect how wide THIS particular photo actually
 * renders in its grid position — the asymmetric layout means the
 * "feature" photo is much wider than the small supporting ones, and a
 * single flat `sizes` value would tell the browser to fetch a
 * too-small (blurry) image for the big one. Callers pass the accurate
 * value per grid span; this default is a safe, generous fallback.
 */
export default function PolaroidImage({
  photo,
  className = "",
  sizes = "(max-width: 640px) 90vw, 45vw",
}: {
  photo: Photo;
  className?: string;
  sizes?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <figure
      className={`paper p-3 pb-5 w-full transition-transform duration-500 ease-out hover:-translate-y-2 hover:scale-[1.02] ${className}`}
      style={{ transform: `rotate(${photo.rotation}deg)` }}
    >
      {photo.src ? (
        <button
          type="button"
          onClick={() => {
            playSound("pop");
            setOpen(true);
          }}
          data-cursor="view"
          aria-label={`View photo: ${photo.caption}`}
          className="relative block aspect-[4/5] w-full overflow-hidden bg-[#d8cfb8]"
        >
          <Image src={photo.src} alt={photo.caption} fill quality={95} sizes={sizes} className="object-cover" />
        </button>
      ) : (
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#d8cfb8]">
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[#8a8064]">
            <CameraIcon className="w-9 h-auto opacity-60" />
            <span className="label-mono !text-[9px] !text-[#6b6350]">PLACEHOLDER — IMAGE PENDING</span>
          </div>
        </div>
      )}
      <figcaption className="mt-2.5 flex items-end justify-between gap-2">
        <span className="label-hand text-base">{photo.caption}</span>
        <span className="label-mono !text-[9px] !text-[#6b6350] whitespace-nowrap">
          {CATEGORY_LABEL[photo.category]} · {photo.year}
        </span>
      </figcaption>

      {open && <PhotoLightbox photo={photo} onClose={() => setOpen(false)} />}
    </figure>
  );
}
