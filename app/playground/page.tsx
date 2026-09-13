import type { Metadata } from "next";
import SectionLabel from "@/components/SectionLabel";
import GridBackground from "@/components/GridBackground";
import Reveal from "@/components/Reveal";
import Arcade from "@/components/games/Arcade";

export const metadata: Metadata = {
  title: "Playground — Viswesh Kesarla",
  description: "A small in-browser arcade by Viswesh Kesarla.",
};

export default function PlaygroundPage() {
  return (
    <div className="page-pad relative pt-32 md:pt-40 pb-24">
      <GridBackground strong className="opacity-60" />
      <div className="relative">
        <Reveal>
          <SectionLabel index="05" title="PLAYGROUND" />
          <h1 className="font-display text-[13vw] sm:text-7xl md:text-8xl mt-5 leading-[0.94]">
            Half-finished
            <br />
            ideas.
          </h1>
          <p className="mt-6 max-w-md text-fg-muted leading-relaxed">
            This is the loose end of the site — small AI demos, creative-coding
            sketches, and motorsport-inspired visual studies get dropped in
            here as they happen, no polish required.
          </p>
        </Reveal>

        <Reveal className="mt-20" delay={0.05}>
          <p className="label-mono text-accent mb-2">A SMALL ARCADE</p>
          <h2 className="font-display text-3xl md:text-4xl max-w-lg leading-[1.05]">
            A few classics, rebuilt from scratch, playable right here.
          </h2>
          <p className="mt-3 max-w-md text-fg-muted text-sm leading-relaxed">
            Keyboard on desktop, on-screen controls on touch — no downloads,
            no plugins. Pick one.
          </p>
        </Reveal>

        <div className="mt-8">
          <Arcade />
        </div>
      </div>
    </div>
  );
}
