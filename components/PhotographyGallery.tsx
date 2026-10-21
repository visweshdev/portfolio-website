"use client";

import Link from "next/link";
import { photography } from "@/data/photography";
import PolaroidImage from "@/components/PolaroidImage";
import SectionLabel from "@/components/SectionLabel";
import GridBackground from "@/components/GridBackground";
import Reveal from "@/components/Reveal";
import Magnetic from "@/components/Magnetic";
import { playSound } from "@/lib/sound";

// Asymmetric editorial spans — one clear feature frame, the rest
// supporting it at different weights. Mobile always stacks to full width.
const SPANS = [
  "col-span-12 sm:col-span-7",
  "col-span-12 sm:col-span-5 sm:mt-16",
  "col-span-6 sm:col-span-4",
  "col-span-6 sm:col-span-4 sm:mt-10",
  "col-span-12 sm:col-span-4",
];

// How wide each of the above spans actually renders — kept in step so
// next/image fetches a resolution that matches the real display size
// instead of guessing one flat value for every photo.
const SIZES = [
  "(max-width: 640px) 100vw, 55vw",
  "(max-width: 640px) 100vw, 42vw",
  "(max-width: 640px) 50vw, 33vw",
  "(max-width: 640px) 50vw, 33vw",
  "(max-width: 640px) 100vw, 33vw",
];

export default function PhotographyGallery() {
  const photos = photography.slice(0, 5);

  return (
    <section id="photography" className="relative py-24 md:py-32 bg-bg" aria-label="Photography">
      <GridBackground strong className="opacity-50" />
      <div className="page-pad relative">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <SectionLabel index="03" title="THROUGH THE LENS" />
              <h2 className="font-display text-5xl md:text-7xl mt-5 leading-[0.98] max-w-2xl">
                The other half of how I look at things.
              </h2>
            </div>
            <Magnetic>
              <Link
                href="/photography"
                onClick={() => playSound("click")}
                data-cursor="link"
                className="label-mono border border-fg-faint rounded-full px-5 py-2.5 hover:border-accent hover:text-accent transition-colors whitespace-nowrap block"
              >
                ALL PHOTOGRAPHY ↗
              </Link>
            </Magnetic>
          </div>
          <p className="mt-4 max-w-md text-fg-muted leading-relaxed">
            Race days, campus mornings, skies that showed off — shot first,
            sorted later.
          </p>
        </Reveal>

        <div className="mt-16 grid grid-cols-12 gap-6 md:gap-10">
          {photos.map((photo, i) => (
            <Reveal key={photo.id} delay={i * 0.06} className={SPANS[i] ?? "col-span-6"}>
              <PolaroidImage photo={photo} sizes={SIZES[i]} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
