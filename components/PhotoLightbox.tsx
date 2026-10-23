"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { CATEGORY_LABEL, type Photo } from "@/data/photography";
import { playSound } from "@/lib/sound";
import { useModal } from "@/lib/useModal";

/** Full-screen view of a single photo. Closes on Escape, backdrop click or the close button. */
export default function PhotoLightbox({ photo, onClose }: { photo: Photo; onClose: () => void }) {
  const dialogRef = useModal<HTMLDivElement>(onClose);

  function closeWithSound() {
    playSound("click");
    onClose();
  }

  // Portaled to <body>: the polaroid that opens this is rotated, and a
  // transformed ancestor would turn `position: fixed` into "fixed to
  // the polaroid" instead of the viewport.
  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={photo.caption}
      tabIndex={-1}
      data-lenis-prevent
      className="fixed inset-0 z-[100] bg-bg/95 backdrop-blur-sm flex flex-col items-center justify-center px-4 py-16 outline-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeWithSound();
      }}
    >
      <button
        type="button"
        onClick={closeWithSound}
        data-cursor="link"
        aria-label="Close photo"
        className="fixed top-5 right-5 label-mono border border-fg-faint rounded-full px-4 py-2 hover:border-accent hover:text-accent transition-colors z-10"
      >
        CLOSE ✕
      </button>

      {photo.src && (
        <div className="relative w-full max-w-5xl h-[75svh]" onClick={closeWithSound}>
          <Image src={photo.src} alt={photo.caption} fill quality={95} sizes="(max-width: 1024px) 100vw, 1024px" className="object-contain" />
        </div>
      )}
      <p className="mt-5 flex flex-wrap items-baseline justify-center gap-x-4 gap-y-1 text-center">
        <span className="font-hand text-2xl text-fg">{photo.caption}</span>
        <span className="label-mono">{CATEGORY_LABEL[photo.category]} · {photo.year}</span>
      </p>
    </div>,
    document.body
  );
}
