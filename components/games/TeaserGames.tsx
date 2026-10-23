"use client";

import { useState } from "react";
import { games } from "@/data/games";
import Reveal from "@/components/Reveal";
import Tilt from "@/components/Tilt";
import ArcadeModal from "@/components/games/ArcadeModal";
import { playSound } from "@/lib/sound";

/** The homepage's three game cards — clicking one opens that game right here, in the arcade cabinet. */
export default function TeaserGames() {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  return (
    <>
      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.slice(0, 3).map((game, i) => (
          <Reveal key={game.id} delay={i * 0.05}>
            <Tilt className="rounded-xl">
              <button
                type="button"
                onClick={() => {
                  playSound("pop");
                  setActiveGame(game.id);
                }}
                data-cursor="open"
                aria-label={`Play ${game.title}`}
                className="group w-full text-left border border-fg-faint/40 rounded-xl p-5 h-36 flex flex-col justify-between bg-bg/60 hover:border-accent/60 hover:bg-bg-raised/60 transition-colors"
              >
                <span className={`label-mono ${game.accent === "red" ? "text-accent-red" : "text-accent"}`}>ARCADE</span>
                <div>
                  <p className="font-display text-xl">{game.title}</p>
                  <p className="text-xs text-fg-muted mt-1">{game.tagline}</p>
                </div>
              </button>
            </Tilt>
          </Reveal>
        ))}
      </div>

      {activeGame && <ArcadeModal gameId={activeGame} onClose={() => setActiveGame(null)} />}
    </>
  );
}
