"use client";

import { contact } from "@/data/nav";
import SectionLabel from "@/components/SectionLabel";
import Reveal from "@/components/Reveal";
import Magnetic from "@/components/Magnetic";
import { playSound } from "@/lib/sound";

export default function Contact() {
  return (
    <section id="contact" className="page-pad relative py-24 md:py-36 bg-bg" aria-label="Contact">
      <Reveal>
        <SectionLabel index="07" title="CONTACT" />
        <h2 className="font-display leading-[0.92] tracking-tight mt-6 text-[15vw] sm:text-[11vw] md:text-[8vw]">
          LET&apos;S
          <br />
          BUILD
          <br />
          SOMETHING.
        </h2>
      </Reveal>

      <Reveal delay={0.15} className="mt-12 flex flex-col sm:flex-row gap-6 sm:gap-10">
        <Magnetic strength={0.25}>
          <a
            href={`mailto:${contact.email}`}
            onClick={() => playSound("pop")}
            data-cursor="link"
            className="label-mono !text-sm text-fg hover:text-accent transition-colors underline underline-offset-4 decoration-fg-faint block"
          >
            EMAIL ↗
          </a>
        </Magnetic>
        <Magnetic strength={0.25}>
          <a
            href={contact.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playSound("pop")}
            data-cursor="link"
            className="label-mono !text-sm text-fg hover:text-accent transition-colors underline underline-offset-4 decoration-fg-faint block"
          >
            LINKEDIN ↗
          </a>
        </Magnetic>
        <Magnetic strength={0.25}>
          <a
            href={contact.github}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playSound("pop")}
            data-cursor="link"
            className="label-mono !text-sm text-fg hover:text-accent transition-colors underline underline-offset-4 decoration-fg-faint block"
          >
            GITHUB ↗
          </a>
        </Magnetic>
      </Reveal>
    </section>
  );
}
