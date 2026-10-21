import { education, skillLabels } from "@/data/skills";
import SectionLabel from "@/components/SectionLabel";
import Reveal from "@/components/Reveal";
import Sticker from "@/components/Sticker";
import Tape from "@/components/Tape";
import RandomFactBox from "@/components/RandomFactBox";

export default function About({ showHeading = true }: { showHeading?: boolean }) {
  return (
    <section id="about" className="relative py-20 md:py-28 bg-bg-raised" aria-label="About">
      <div className="page-pad grid lg:grid-cols-[1.1fr_1fr] gap-14 lg:gap-20">
        <Reveal>
          {showHeading && (
            <>
              <SectionLabel index="06" title="ABOUT" />
              <h2 className="font-display text-4xl md:text-6xl mt-5 leading-[1.02] max-w-lg">
                Systems, stories, speed.
              </h2>
            </>
          )}
          <div className="flex flex-wrap gap-2 mt-6">
            <Sticker tone="accent" rotate={-2}>SYSTEMS</Sticker>
            <Sticker tone="outline" rotate={1}>STORIES</Sticker>
            <Sticker tone="red" rotate={-1}>SPEED</Sticker>
          </div>
          <p className="mt-6 max-w-md text-fg-muted leading-relaxed">
            I&apos;m Viswesh — a Computer Science student who ends up spending
            most of his time in the gap between an idea and a system that
            actually runs.
          </p>
          <p className="mt-4 max-w-md text-fg-muted leading-relaxed">
            I enjoy building with LLMs, RAG, backend technologies and emerging
            developer tools. Right now that means retrieval pipelines,
            evaluation, and getting language models to output things that
            compile.
          </p>
          <p className="mt-4 max-w-md text-fg-muted leading-relaxed">
            Outside of code, I&apos;m usually taking photographs or watching a
            race — the same instinct, really: paying attention to timing,
            framing, and what happens right at the edge.
          </p>
          <p className="label-mono mt-6 text-fg-faint">CURRENTLY EXPLORING · OPEN TO INTERNSHIPS &amp; COLLABORATIONS</p>

          <div className="mt-10">
            <RandomFactBox />
          </div>

          <div className="mt-8 flex flex-wrap gap-2 max-w-md">
            {skillLabels.map((label, i) => (
              <Sticker key={label} rotate={(i % 3) - 1} tone={i % 5 === 0 ? "accent" : "outline"}>
                {label}
              </Sticker>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative border border-fg-faint/30 rounded-2xl p-6 md:p-8 bg-bg">
            <div className="absolute -top-3 left-8 rotate-[2deg]">
              <Tape rotate={8} className="!left-1 !-top-2" />
              <div className="paper px-4 py-1.5">
                <p className="label-hand !text-base">education</p>
              </div>
            </div>

            <p className="label-mono mt-4">{education.school}</p>
            <h3 className="font-display text-2xl md:text-3xl mt-2 text-fg">{education.degree}</h3>
            <div className="flex gap-8 mt-5">
              <div>
                <p className="font-display text-2xl text-fg">{education.period}</p>
                <p className="label-mono !text-[9px]">DURATION</p>
              </div>
              <div>
                <p className="font-display text-2xl text-fg">{education.gpa}</p>
                <p className="label-mono !text-[9px]">GPA</p>
              </div>
            </div>
            <p className="label-mono !text-[9px] mt-6 mb-2 text-fg-faint">RELEVANT COURSEWORK</p>
            <ul className="space-y-1.5">
              {education.coursework.map((course) => (
                <li key={course} className="text-sm text-fg-muted flex gap-2">
                  <span className="text-accent" aria-hidden="true">—</span>
                  {course}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
