import Image from "next/image";
import type { Photo } from "@/data/photography";
import { CameraIcon } from "@/components/icons";

const CATEGORY_LABEL: Record<Photo["category"], string> = {
  street: "STREET",
  motorsport: "MOTORSPORT",
  study: "CAMPUS",
  travel: "TRAVEL",
};

/**
 * Renders a photograph inside a paper/polaroid frame. While `src` is
 * null this renders an explicit, clearly-labeled placeholder — never
 * a stand-in stock photo — so it's obvious which slots still need a
 * real image dropped into /public/photography/.
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
  return (
    <figure
      data-cursor="view"
      className={`paper p-3 pb-5 w-full transition-transform duration-500 ease-out hover:-translate-y-2 hover:scale-[1.02] ${className}`}
      style={{ transform: `rotate(${photo.rotation}deg)` }}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#d8cfb8]">
        {photo.src ? (
          <Image
            src={photo.src}
            alt={photo.caption}
            fill
            quality={95}
            sizes={sizes}
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[#8a8064]">
            <CameraIcon className="w-9 h-auto opacity-60" />
            <span className="label-mono !text-[9px] !text-[#8a8064]">PLACEHOLDER — IMAGE PENDING</span>
          </div>
        )}
      </div>
      <figcaption className="mt-2.5 flex items-end justify-between gap-2">
        <span className="label-hand text-base">{photo.caption}</span>
        <span className="label-mono !text-[9px] !text-[#6b6350] whitespace-nowrap">
          {CATEGORY_LABEL[photo.category]} · {photo.year}
        </span>
      </figcaption>
    </figure>
  );
}
