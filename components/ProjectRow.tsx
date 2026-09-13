"use client";

import Link from "next/link";
import type { Project } from "@/data/projects";
import Sticker from "@/components/Sticker";
import Reveal from "@/components/Reveal";
import PaperForgeCollage from "@/components/PaperForgeCollage";
import URLShortenerCollage from "@/components/URLShortenerCollage";
import { playSound } from "@/lib/sound";

const COLLAGES: Record<string, React.ComponentType<{ className?: string }>> = {
  paperforge: PaperForgeCollage,
  "url-shortener": URLShortenerCollage,
};

export default function ProjectRow({ project, reversed = false }: { project: Project; reversed?: boolean }) {
  const Collage = COLLAGES[project.slug];

  return (
    <Reveal className="border-t border-fg-faint/25 py-14 md:py-20">
      <Link
        href={`/projects/${project.slug}`}
        onClick={() => playSound("pop")}
        data-cursor="open"
        className="group grid md:grid-cols-2 gap-10 md:gap-16 items-center"
      >
        <div className={reversed ? "md:order-2" : ""}>
          <div className="border border-fg-faint/25 rounded-2xl bg-bg-raised/60 p-6 md:p-8 shadow-none transition-all duration-500 group-hover:border-accent/40 group-hover:-translate-y-1.5 group-hover:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.6)]">
            {Collage && <Collage />}
          </div>
        </div>

        <div className={reversed ? "md:order-1" : ""}>
          <div className="flex items-baseline gap-3 label-mono mb-4">
            <span className="text-accent">{project.index}</span>
            <span>{project.year}</span>
          </div>
          <h3 className="font-display text-[10vw] sm:text-6xl md:text-5xl lg:text-6xl leading-[0.95] tracking-tight text-fg group-hover:text-accent transition-colors">
            {project.title}
          </h3>
          <p className="label-mono mt-4 text-fg-muted">{project.tagline}</p>
          <p className="mt-5 max-w-md text-fg-muted leading-relaxed">{project.summary}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {project.stack.map((tech, i) => (
              <Sticker key={tech} rotate={i % 2 === 0 ? -3 : 3}>
                {tech}
              </Sticker>
            ))}
          </div>
          <span className="inline-flex items-center gap-2 mt-7 label-mono text-fg group-hover:text-accent transition-colors">
            VIEW PROJECT
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">↗</span>
          </span>
        </div>
      </Link>
    </Reveal>
  );
}
