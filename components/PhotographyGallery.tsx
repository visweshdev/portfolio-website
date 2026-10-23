import { photography } from "@/data/photography";
import PolaroidImage from "@/components/PolaroidImage";
import SectionLabel from "@/components/SectionLabel";
import GridBackground from "@/components/GridBackground";
import Reveal from "@/components/Reveal";
import Magnetic from "@/components/Magnetic";
import SoundLink from "@/components/SoundLink";
import { photoSlot } from "@/lib/photoGrid";
import SplitHeading from "@/components/SplitHeading";
import PhotoWallSection from "@/components/PhotoWallSection";

export default function PhotographyGallery() {
  const photos = photography.slice(0, 5);

  return (
    <section id="photography" className="relative py-24 md:py-32 bg-bg/75" aria-label="Photography">
      <GridBackground strong className="opacity-50" />
      <div className="page-pad relative">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <SectionLabel index="02" title="THROUGH THE LENS" />
              <SplitHeading as="h2" className="font-display text-5xl md:text-7xl mt-5 leading-[0.98] max-w-2xl">
                The other half of how I look at things.
              </SplitHeading>
            </div>
            <Magnetic>
              <SoundLink
                href="/photography"
                data-cursor="link"
                className="label-mono border border-fg-faint rounded-full px-5 py-2.5 hover:border-accent hover:text-accent transition-colors whitespace-nowrap block"
              >
                ALL PHOTOGRAPHY ↗
              </SoundLink>
            </Magnetic>
          </div>
          <p className="mt-4 max-w-md text-fg-muted leading-relaxed">
            Race days, campus mornings, skies that showed off — shot first,
            sorted later.
          </p>
        </Reveal>

        {/* the 3D wall — on mouse/trackpad screens with full motion it
            replaces the print grid below (see PhotoWallSection) */}
        <PhotoWallSection photos={photos} />

        <div className="photo-grid mt-16 grid grid-cols-12 gap-6 md:gap-10">
          {photos.map((photo, i) => {
            const { span, sizes } = photoSlot(i);
            return (
              <Reveal key={photo.id} delay={i * 0.06} className={span}>
                <PolaroidImage photo={photo} sizes={sizes} />
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
