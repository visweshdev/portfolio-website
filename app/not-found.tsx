import Link from "next/link";
import GridBackground from "@/components/GridBackground";
import SectionLabel from "@/components/SectionLabel";

export const metadata = {
  title: "Page not found — Viswesh Kesarla",
};

export default function NotFound() {
  return (
    <div className="page-pad relative min-h-[80svh] flex flex-col justify-center pt-32 md:pt-24 pb-24">
      <GridBackground strong className="opacity-50" />
      <div className="relative">
        <SectionLabel index="404" title="OFF TRACK" />
        <h1 className="font-display text-[16vw] sm:text-8xl md:text-9xl mt-5 leading-[0.9]">
          Wrong
          <br />
          turn.
        </h1>
        <p className="mt-6 max-w-md text-fg-muted leading-relaxed">
          Whatever you were looking for isn&apos;t at this address. Let&apos;s
          get you back on the line.
        </p>
        <Link
          href="/"
          data-cursor="link"
          className="inline-flex items-center gap-2 mt-8 label-mono border border-fg-faint rounded-full px-6 py-3 hover:border-accent hover:text-accent transition-colors"
        >
          BACK TO HOME
          <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </div>
  );
}
