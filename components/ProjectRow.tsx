import type { Project } from "@/data/projects";
import Sticker from "@/components/Sticker";
import Reveal from "@/components/Reveal";
import SoundLink from "@/components/SoundLink";
import ProjectLinks from "@/components/ProjectLinks";
import { COLLAGES } from "@/components/collages";
import Tilt from "@/components/Tilt";
import HoverDistort from "@/components/HoverDistort";
import FlowStrip from "@/components/FlowStrip";
import CollageFrame from "@/components/CollageFrame";

export default function ProjectRow({ project, reversed = false }: { project: Project; reversed?: boolean }) {
  const Collage = COLLAGES[project.slug];
  const href = `/projects/${project.slug}`;

  // Not one big <Link> any more — the repo/demo buttons are links of
  // their own, and anchors can't nest. The collage and the title both
  // lead to the detail page; `group` keeps the hover state shared.
  return (
    <Reveal className="border-t border-fg-faint/25 py-14 md:py-20">
      <div className="group grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div className={`project-collage w-full max-w-2xl lg:max-w-none ${reversed ? "lg:order-2" : ""}`}>
          <Tilt className="rounded-2xl">
            <SoundLink
              href={href}
              sound="pop"
              data-cursor="open"
              tabIndex={-1}
              aria-hidden="true"
              className="block border border-fg-faint/25 rounded-2xl bg-bg-raised/60 p-6 md:p-8 shadow-none transition-[border-color,box-shadow] duration-500 group-hover:border-accent/40 group-hover:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.6)]"
            >
              <HoverDistort>
                {Collage ? (
                  <CollageFrame>
                    <Collage />
                  </CollageFrame>
                ) : (
                  // no scrapbook visual yet — show the project's pipeline instead
                  <div className="aspect-[6/5] w-full flex flex-col justify-center gap-6">
                    <p className="label-mono text-accent">PIPELINE</p>
                    <FlowStrip steps={project.stages} />
                  </div>
                )}
              </HoverDistort>
            </SoundLink>
          </Tilt>
        </div>

        <div className={reversed ? "lg:order-1" : ""}>
          <div className="flex items-baseline gap-3 label-mono mb-4">
            <span className="text-accent">{project.index}</span>
            <span>{project.year}</span>
            {project.status === "in-development" && (
              <span className="label-mono !text-[10px] !text-accent border border-accent/60 rounded-full px-2.5 py-0.5">
                IN DEVELOPMENT
              </span>
            )}
          </div>
          <h3 className="font-display text-[10vw] sm:text-6xl lg:text-5xl xl:text-6xl leading-[0.95] tracking-tight text-fg group-hover:text-accent transition-colors">
            <SoundLink href={href} sound="pop" data-cursor="open">
              {project.title}
            </SoundLink>
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
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
            <SoundLink
              href={href}
              sound="pop"
              data-cursor="open"
              className="inline-flex items-center gap-2 label-mono text-fg hover:text-accent transition-colors"
            >
              VIEW PROJECT
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">↗</span>
            </SoundLink>
            <ProjectLinks links={project.links} />
          </div>
        </div>
      </div>
    </Reveal>
  );
}
