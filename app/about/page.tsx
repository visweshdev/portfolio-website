import type { Metadata } from "next";
import SectionLabel from "@/components/SectionLabel";
import GridBackground from "@/components/GridBackground";
import Reveal from "@/components/Reveal";
import About from "@/components/About";
import Contact from "@/components/Contact";
import SplitHeading from "@/components/SplitHeading";

export const metadata: Metadata = {
  title: "About",
  description: "About Viswesh Kesarla — Computer Science student, AI builder, photographer.",
};

export default function AboutPage() {
  return (
    <div>
      <div className="page-pad relative pt-32 md:pt-40 pb-10">
        <GridBackground strong className="opacity-50" />
        <div className="relative">
          <Reveal>
            <SectionLabel index="05" title="ABOUT" />
            <SplitHeading as="h1" className="font-display text-[13vw] sm:text-7xl md:text-8xl mt-5 leading-[0.94]">
              Hi, I&apos;m
              <br />
              Viswesh.
            </SplitHeading>
          </Reveal>
        </div>
      </div>
      <About showHeading={false} />
      <Contact />
    </div>
  );
}
