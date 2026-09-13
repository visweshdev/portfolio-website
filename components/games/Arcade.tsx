"use client";

import { useState } from "react";
import { games } from "@/data/games";
import GameCard from "@/components/games/GameCard";
import ArcadeModal from "@/components/games/ArcadeModal";
import Reveal from "@/components/Reveal";

export default function Arcade() {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  return (
    <div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game, i) => (
          <Reveal key={game.id} delay={(i % 3) * 0.05}>
            <GameCard game={game} onPlay={setActiveGame} />
          </Reveal>
        ))}
      </div>

      {activeGame && <ArcadeModal gameId={activeGame} onClose={() => setActiveGame(null)} />}
    </div>
  );
}
