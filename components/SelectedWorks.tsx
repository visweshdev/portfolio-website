import { projects } from "@/data/projects";
import SectionLabel from "@/components/SectionLabel";
import ProjectRow from "@/components/ProjectRow";
import Reveal from "@/components/Reveal";
import GridBackground from "@/components/GridBackground";
import Magnetic from "@/components/Magnetic";
import SoundLink from "@/components/SoundLink";
import HorizontalRail from "@/components/HorizontalRail";
import SplitHeading from "@/components/SplitHeading";

export default function SelectedWorks() {
  return (
    <section id="projects" className="relative py-20 md:py-28 bg-bg/75" aria-label="Selected projects">
      <GridBackground strong className="opacity-60" />
      <div className="page-pad relative">
        <Reveal>
          <SectionLabel index="01" title="SELECTED PROJECTS" />
          <SplitHeading as="h2" className="font-display text-4xl md:text-6xl mt-5 max-w-2xl leading-[1.02]">
            A few things I&apos;ve built end to end.
          </SplitHeading>
        </Reveal>

        <div className="mt-4">
          <HorizontalRail>
            {projects.map((project, i) => (
              <ProjectRow key={project.slug} project={project} reversed={i % 2 === 1} />
            ))}
          </HorizontalRail>
        </div>

        <Reveal className="pt-10 flex justify-center">
          <Magnetic>
            <SoundLink
              href="/projects"
              data-cursor="link"
              className="label-mono border border-fg-faint rounded-full px-6 py-3 hover:border-accent hover:text-accent transition-colors block"
            >
              VIEW ALL PROJECTS ↗
            </SoundLink>
          </Magnetic>
        </Reveal>
      </div>
    </section>
  );
}
