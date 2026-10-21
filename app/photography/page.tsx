import type { Metadata } from "next";
import { photography } from "@/data/photography";
import PolaroidImage from "@/components/PolaroidImage";
import SectionLabel from "@/components/SectionLabel";
import GridBackground from "@/components/GridBackground";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Photography — Viswesh Kesarla",
  description: "Photography by Viswesh Kesarla — frames outside the terminal.",
};

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
// instead of guessing one flat value for every photo. Anything past
// the 5th photo falls back to the "col-span-6" default's width.
const SIZES = [
  "(max-width: 640px) 100vw, 55vw",
  "(max-width: 640px) 100vw, 42vw",
  "(max-width: 640px) 50vw, 33vw",
  "(max-width: 640px) 50vw, 33vw",
  "(max-width: 640px) 100vw, 33vw",
];
const FALLBACK_SIZES = "(max-width: 640px) 50vw, 45vw";

export default function PhotographyPage() {
  return (
    <div className="page-pad relative pt-32 md:pt-40 pb-24">
      <GridBackground strong className="opacity-50" />
      <Reveal>
        <SectionLabel index="03" title="PHOTOGRAPHY" />
        <h1 className="font-display text-[13vw] sm:text-7xl md:text-8xl mt-5 leading-[0.94]">
          Through the
          <br />
          lens.
        </h1>
        <p className="mt-6 max-w-md text-fg-muted leading-relaxed">
          A growing collection, shot first and sorted later. More lands here
          as it gets taken.
        </p>
      </Reveal>

      <div className="mt-16 grid grid-cols-12 gap-6 md:gap-10">
        {photography.map((photo, i) => (
          <Reveal key={photo.id} delay={(i % 3) * 0.08} className={SPANS[i] ?? "col-span-6"}>
            <PolaroidImage photo={photo} sizes={SIZES[i] ?? FALLBACK_SIZES} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
