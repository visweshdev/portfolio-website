import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projects, getProject } from "@/data/projects";
import Sticker from "@/components/Sticker";
import Reveal from "@/components/Reveal";
import GridBackground from "@/components/GridBackground";
import PaperForgeCollage from "@/components/PaperForgeCollage";
import URLShortenerCollage from "@/components/URLShortenerCollage";
import SoundLink from "@/components/SoundLink";

const COLLAGES: Record<string, React.ComponentType<{ className?: string }>> = {
  paperforge: PaperForgeCollage,
  "url-shortener": URLShortenerCollage,
};

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: `${project.title} — Viswesh Kesarla`,
    description: project.summary,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const Collage = COLLAGES[project.slug];

  return (
    <div className="page-pad relative pt-32 md:pt-40 pb-24">
      <GridBackground strong className="opacity-40" />
      <div className="relative max-w-5xl mx-auto">
        <Reveal>
          <SoundLink href="/projects" data-cursor="link" className="label-mono text-fg-muted hover:text-fg transition-colors">
            ← ALL PROJECTS
          </SoundLink>
          <div className="flex items-baseline gap-3 label-mono mt-6 mb-4">
            <span className="text-accent">{project.index}</span>
            <span>{project.year}</span>
          </div>
          <h1 className="font-display text-[13vw] sm:text-7xl md:text-8xl leading-[0.94]">{project.title}</h1>
          <p className="label-mono mt-5 text-fg-muted">{project.tagline}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {project.stack.map((tech, i) => (
              <Sticker key={tech} rotate={i % 2 === 0 ? -3 : 3}>
                {tech}
              </Sticker>
            ))}
          </div>
        </Reveal>

        {Collage && (
          <Reveal delay={0.1} className="mt-16 md:mt-20 max-w-3xl">
            <Collage />
          </Reveal>
        )}

        <div className="mt-20 flex flex-col gap-14">
          <Reveal className="grid md:grid-cols-[160px_1fr] gap-x-10">
            <p className="label-mono text-accent">THE IDEA</p>
            <p className="text-lg md:text-xl leading-relaxed text-fg max-w-2xl">{project.idea}</p>
          </Reveal>

          <Reveal className="grid md:grid-cols-[160px_1fr] gap-x-10">
            <p className="label-mono text-accent">THE SYSTEM</p>
            <ul className="space-y-4 max-w-2xl">
              {project.system.map((point) => (
                <li key={point} className="flex gap-3 text-fg-muted leading-relaxed">
                  <span className="text-accent flex-none" aria-hidden="true">—</span>
                  {point}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal className="grid md:grid-cols-[160px_1fr] gap-x-10">
            <p className="label-mono text-accent">THE PROCESS</p>
            <ul className="space-y-4 max-w-2xl">
              {project.process.map((point) => (
                <li key={point} className="flex gap-3 text-fg-muted leading-relaxed">
                  <span className="text-accent flex-none" aria-hidden="true">—</span>
                  {point}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal className="grid md:grid-cols-[160px_1fr] gap-x-10">
            <p className="label-mono text-accent">THE RESULT</p>
            <p className="text-lg md:text-xl leading-relaxed text-fg max-w-2xl">{project.result}</p>
          </Reveal>
        </div>

        <Reveal className="mt-16">
          <p className="label-hand text-xl text-fg-muted">{project.handLabel}</p>
        </Reveal>
      </div>
    </div>
  );
}
