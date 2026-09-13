import type { Metadata } from "next";
import { projects } from "@/data/projects";
import ProjectRow from "@/components/ProjectRow";
import SectionLabel from "@/components/SectionLabel";
import GridBackground from "@/components/GridBackground";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Projects — Viswesh Kesarla",
  description: "Selected software and AI projects by Viswesh Kesarla.",
};

export default function ProjectsPage() {
  const stackTally = Array.from(new Set(projects.flatMap((p) => p.stack)));

  return (
    <div className="page-pad relative pt-32 md:pt-40 pb-20">
      <GridBackground strong className="opacity-50" />
      <div className="relative">
        <Reveal>
          <SectionLabel index="02" title="PROJECTS" />
          <h1 className="font-display text-[13vw] sm:text-7xl md:text-8xl mt-5 leading-[0.94]">
            Things I&apos;ve
            <br />
            built.
          </h1>
          <p className="mt-6 max-w-md text-fg-muted leading-relaxed">
            A short list, on purpose — projects picked because they made me
            solve something genuinely difficult, not because they fill space.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-3 border-y border-fg-faint/25 py-5">
          <p className="label-mono">
            <span className="text-accent">{String(projects.length).padStart(2, "0")}</span> PROJECTS SHIPPED
          </p>
          <p className="label-mono text-fg-faint hidden sm:block" aria-hidden="true">/</p>
          <p className="label-mono text-fg-muted">{stackTally.join(" · ")}</p>
        </Reveal>

        <div className="mt-6">
          {projects.map((project, i) => (
            <ProjectRow key={project.slug} project={project} reversed={i % 2 === 1} />
          ))}
        </div>
      </div>
    </div>
  );
}
