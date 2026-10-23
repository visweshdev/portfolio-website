import SectionLabel from "@/components/SectionLabel";
import Reveal from "@/components/Reveal";
import GridBackground from "@/components/GridBackground";
import Magnetic from "@/components/Magnetic";
import SoundLink from "@/components/SoundLink";
import TeaserGames from "@/components/games/TeaserGames";
import SplitHeading from "@/components/SplitHeading";

export default function PlaygroundTeaser() {
  return (
    <section id="playground" className="relative py-20 md:py-28 bg-bg/75 overflow-hidden" aria-label="Playground">
      <GridBackground strong className="opacity-70" />
      <div className="page-pad relative">
        <Reveal>
          <SectionLabel index="04" title="PLAYGROUND" />
          <div className="flex flex-wrap items-end justify-between gap-4 mt-5">
            <SplitHeading as="h2" className="font-display text-4xl md:text-6xl leading-[1.02] max-w-xl">
              An actual arcade lives in here.
            </SplitHeading>
            <Magnetic>
              <SoundLink
                href="/playground"
                sound="pop"
                data-cursor="open"
                className="label-mono border border-fg-faint rounded-full px-5 py-2.5 hover:border-accent hover:text-accent transition-colors whitespace-nowrap block"
              >
                ENTER PLAYGROUND ↗
              </SoundLink>
            </Magnetic>
          </div>
          <p className="mt-4 max-w-md text-fg-muted">
            Six classics rebuilt from scratch and genuinely playable —
            keyboard on desktop, touch controls on mobile.
          </p>
        </Reveal>

        <TeaserGames />
      </div>
    </section>
  );
}
