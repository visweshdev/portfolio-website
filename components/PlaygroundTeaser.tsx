"use client";

import Link from "next/link";
import { games } from "@/data/games";
import SectionLabel from "@/components/SectionLabel";
import Reveal from "@/components/Reveal";
import GridBackground from "@/components/GridBackground";
import Magnetic from "@/components/Magnetic";
import { playSound } from "@/lib/sound";

export default function PlaygroundTeaser() {
  return (
    <section className="relative py-20 md:py-28 bg-bg overflow-hidden" aria-label="Playground">
      <GridBackground strong className="opacity-70" />
      <div className="page-pad relative">
        <Reveal>
          <SectionLabel index="05" title="PLAYGROUND" />
          <div className="flex flex-wrap items-end justify-between gap-4 mt-5">
            <h2 className="font-display text-4xl md:text-6xl leading-[1.02] max-w-xl">
              An actual arcade lives in here.
            </h2>
            <Magnetic>
              <Link
                href="/playground"
                onClick={() => playSound("pop")}
                data-cursor="open"
                className="label-mono border border-fg-faint rounded-full px-5 py-2.5 hover:border-accent hover:text-accent transition-colors whitespace-nowrap block"
              >
                ENTER PLAYGROUND ↗
              </Link>
            </Magnetic>
          </div>
          <p className="mt-4 max-w-md text-fg-muted">
            Six classics rebuilt from scratch and genuinely playable —
            keyboard on desktop, touch controls on mobile.
          </p>
        </Reveal>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.slice(0, 3).map((game, i) => (
            <Reveal key={game.id} delay={i * 0.05}>
              <Link
                href="/playground"
                onClick={() => playSound("pop")}
                data-cursor="open"
                className="group block border border-fg-faint/40 rounded-xl p-5 h-36 flex flex-col justify-between hover:border-accent/60 hover:bg-bg-raised/60 transition-colors"
              >
                <span className={`label-mono ${game.accent === "red" ? "text-accent-red" : "text-accent"}`}>ARCADE</span>
                <div>
                  <p className="font-display text-xl">{game.title}</p>
                  <p className="text-xs text-fg-muted mt-1">{game.tagline}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
