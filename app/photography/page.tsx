import type { Metadata } from "next";
import { photography } from "@/data/photography";
import PolaroidImage from "@/components/PolaroidImage";
import SectionLabel from "@/components/SectionLabel";
import GridBackground from "@/components/GridBackground";
import Reveal from "@/components/Reveal";
import { photoSlot } from "@/lib/photoGrid";
import PhotoWallSection from "@/components/PhotoWallSection";
import SplitHeading from "@/components/SplitHeading";

export const metadata: Metadata = {
  title: "Photography",
  description: "Photography by Viswesh Kesarla — frames outside the terminal.",
};

export default function PhotographyPage() {
  return (
    <div className="page-pad relative pt-32 md:pt-40 pb-24">
      <GridBackground strong className="opacity-50" />
      <Reveal>
        <SectionLabel index="02" title="PHOTOGRAPHY" />
        <SplitHeading as="h1" className="font-display text-[13vw] sm:text-7xl md:text-8xl mt-5 leading-[0.94]">
          Through the
          <br />
          lens.
        </SplitHeading>
        <p className="mt-6 max-w-md text-fg-muted leading-relaxed">
          A growing collection, shot first and sorted later. More lands here
          as it gets taken.
        </p>
      </Reveal>

      <PhotoWallSection photos={photography} />

      {/* the print grid — replaced by the 3D wall above where that runs (see PhotoWallSection) */}
      <div className="photo-grid mt-16 grid grid-cols-12 gap-6 md:gap-10">
        {photography.map((photo, i) => {
          const { span, sizes } = photoSlot(i);
          return (
            <Reveal key={photo.id} delay={(i % 3) * 0.08} className={span}>
              <PolaroidImage photo={photo} sizes={sizes} />
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
