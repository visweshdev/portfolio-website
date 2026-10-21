import { experience } from "@/data/experience";
import SectionLabel from "@/components/SectionLabel";
import Reveal from "@/components/Reveal";
import Sticker from "@/components/Sticker";
import Tape from "@/components/Tape";
import AnimatedNumber from "@/components/AnimatedNumber";

export default function Experience({ showHeading = true }: { showHeading?: boolean }) {
  return (
    <section className="relative py-20 md:py-28 bg-bg-raised overflow-hidden" aria-label="Work experience">
      <div className="page-pad grid lg:grid-cols-[1fr_1fr] gap-14 lg:gap-20">
        <Reveal>
          {showHeading && <SectionLabel index="04" title="WORK EXPERIENCE" />}
          <h2 className={`font-display text-4xl md:text-6xl leading-[1.02] ${showHeading ? "mt-5" : ""}`}>
            {experience.company}
          </h2>
          <p className="label-mono mt-4">{experience.role}</p>
          <p className="label-mono">{experience.period}</p>
          <p className="label-mono">{experience.location}</p>
          <p className="mt-6 max-w-md text-fg-muted leading-relaxed">{experience.summary}</p>

          <ul className="mt-6 space-y-2">
            {experience.focusAreas.map((area) => (
              <li key={area} className="flex gap-3 text-sm text-fg-muted">
                <span className="text-accent" aria-hidden="true">—</span>
                {area}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap gap-2">
            {experience.stack.map((tech, i) => (
              <Sticker key={tech} rotate={i % 2 === 0 ? -3 : 3}>
                {tech}
              </Sticker>
            ))}
          </div>
        </Reveal>

        {/* lab-note pipeline card — a small pinned note on a dark board,
            not a full cream panel */}
        <Reveal delay={0.1}>
          <div className="relative border border-fg-faint/30 rounded-2xl p-6 md:p-8 bg-bg">
            <div className="absolute -top-3 left-8 rotate-[-3deg]">
              <Tape rotate={-10} className="!left-1 !-top-2" />
              <div className="paper px-4 py-1.5">
                <p className="label-hand !text-base">lab note</p>
              </div>
            </div>

            <p className="label-mono mt-4 mb-1">RAG PIPELINE</p>
            <div className="flex gap-6 mt-5 mb-6">
              {experience.metrics.map((m) => (
                <div key={m.label}>
                  <p className="font-display text-3xl md:text-4xl text-fg">
                    <AnimatedNumber value={m.value} />
                  </p>
                  <p className="label-mono !text-[9px]">{m.label}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-3">
              {experience.pipeline.map((step, i) => (
                <span key={step} className="flex items-center gap-2">
                  <span className="font-mono text-[11px] md:text-xs px-2.5 py-1.5 rounded border border-fg-faint/40 text-fg-muted">
                    {step}
                  </span>
                  {i < experience.pipeline.length - 1 && (
                    <span className="text-fg-faint" aria-hidden="true">→</span>
                  )}
                </span>
              ))}
            </div>
            <p className="label-mono mt-6 text-fg-faint !text-[10px]">
              STILL TUNING: RETRIEVAL, PROMPTS, HALLUCINATION RATE
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
