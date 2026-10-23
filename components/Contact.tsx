"use client";

import { useEffect, useRef, useState } from "react";
import { contact } from "@/data/nav";
import SectionLabel from "@/components/SectionLabel";
import Reveal from "@/components/Reveal";
import Magnetic from "@/components/Magnetic";
import { playSound } from "@/lib/sound";
import SplitHeading from "@/components/SplitHeading";

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emailRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  // A `mailto:` link does nothing for visitors without a mail client
  // set up, so the address is also shown as text with a copy button.
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(contact.email);
    } catch {
      // Clipboard blocked (insecure context, permissions, unfocused
      // document) — select the address instead so Ctrl/⌘+C copies it.
      const el = emailRef.current;
      const selection = window.getSelection();
      if (el && selection) {
        const range = document.createRange();
        range.selectNodeContents(el);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      return;
    }
    playSound("success");
    setCopied(true);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section id="contact" className="page-pad relative py-24 md:py-36 bg-bg/75" aria-label="Contact">
      <Reveal>
        <SectionLabel index="06" title="CONTACT" />
        <SplitHeading as="h2" className="font-display leading-[0.92] tracking-tight mt-6 text-[15vw] sm:text-[11vw] md:text-[8vw]">
          LET&apos;S
          <br />
          BUILD
          <br />
          SOMETHING.
        </SplitHeading>
      </Reveal>

      <Reveal delay={0.1} className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3">
        <p ref={emailRef} className="font-display text-2xl md:text-3xl text-fg break-all">
          {contact.email}
        </p>
        <button
          type="button"
          onClick={copyEmail}
          data-cursor="link"
          className="label-mono !text-[11px] border border-fg-faint rounded-full px-4 py-2 hover:border-accent hover:text-accent transition-colors"
        >
          {copied ? "COPIED ✓" : "COPY EMAIL"}
        </button>
        <span className="sr-only" aria-live="polite">
          {copied ? "Email address copied to clipboard" : ""}
        </span>
      </Reveal>

      <Reveal delay={0.15} className="mt-10 flex flex-col sm:flex-row gap-6 sm:gap-10">
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
