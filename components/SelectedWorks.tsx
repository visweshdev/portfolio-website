"use client";

import Link from "next/link";
import { projects } from "@/data/projects";
import SectionLabel from "@/components/SectionLabel";
import ProjectRow from "@/components/ProjectRow";
import Reveal from "@/components/Reveal";
import GridBackground from "@/components/GridBackground";
import Magnetic from "@/components/Magnetic";
import { playSound } from "@/lib/sound";

export default function SelectedWorks() {
  return (
    <section id="projects" className="relative py-20 md:py-28 bg-bg" aria-label="Selected projects">
      <GridBackground strong className="opacity-60" />
      <div className="page-pad relative">
        <Reveal>
          <SectionLabel index="02" title="SELECTED PROJECTS" />
          <h2 className="font-display text-4xl md:text-6xl mt-5 max-w-2xl leading-[1.02]">
            A few things I&apos;ve built end to end.
          </h2>
        </Reveal>

        <div className="mt-4">
          {projects.map((project, i) => (
            <ProjectRow key={project.slug} project={project} reversed={i % 2 === 1} />
          ))}
        </div>

        <Reveal className="pt-10 flex justify-center">
          <Magnetic>
            <Link
              href="/projects"
              onClick={() => playSound("click")}
              data-cursor="link"
              className="label-mono border border-fg-faint rounded-full px-6 py-3 hover:border-accent hover:text-accent transition-colors block"
            >
              VIEW ALL PROJECTS ↗
            </Link>
          </Magnetic>
        </Reveal>
      </div>
    </section>
  );
}
