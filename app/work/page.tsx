import type { Metadata } from "next";
import SectionLabel from "@/components/SectionLabel";
import GridBackground from "@/components/GridBackground";
import Reveal from "@/components/Reveal";
import Experience from "@/components/Experience";

export const metadata: Metadata = {
  title: "Work — Viswesh Kesarla",
  description: "Work experience of Viswesh Kesarla.",
};

export default function WorkPage() {
  return (
    <div>
      <div className="page-pad relative pt-32 md:pt-40 pb-10">
        <GridBackground strong className="opacity-50" />
        <div className="relative">
          <Reveal>
            <SectionLabel index="04" title="WORK" />
            <h1 className="font-display text-[13vw] sm:text-7xl md:text-8xl mt-5 leading-[0.94]">
              Where I&apos;ve
              <br />
              worked.
            </h1>
          </Reveal>
        </div>
      </div>
      <Experience showHeading={false} />
    </div>
  );
}
