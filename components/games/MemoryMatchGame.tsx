"use client";

import { useCallback, useState } from "react";
import GameFrame from "@/components/games/GameFrame";
import { playSound } from "@/lib/sound";
import {
  CameraIcon, F1SilhouetteIcon, CodeBracketsIcon, TerminalCursorIcon,
  NodeIcon, FocusReticleIcon, TrackLineIcon, DotIcon,
} from "@/components/icons";

const ICONS = [CameraIcon, F1SilhouetteIcon, CodeBracketsIcon, TerminalCursorIcon, NodeIcon, FocusReticleIcon, TrackLineIcon, DotIcon];

type Card = { id: number; iconIndex: number; matched: boolean };

function shuffledDeck(): Card[] {
  const pairs = ICONS.flatMap((_, i) => [i, i]);
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  return pairs.map((iconIndex, id) => ({ id, iconIndex, matched: false }));
}

export default function MemoryMatchGame() {
  const [deck, setDeck] = useState<Card[]>(shuffledDeck);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);

  const won = deck.every((c) => c.matched);

  const reset = useCallback(() => {
    setDeck(shuffledDeck());
    setFlipped([]);
    setMoves(0);
    setLocked(false);
  }, []);

  const flip = useCallback(
    (id: number) => {
      if (locked || flipped.includes(id) || deck[id].matched || flipped.length === 2) return;
      const next = [...flipped, id];
      setFlipped(next);
      playSound("pop");

      if (next.length === 2) {
        setLocked(true);
        setMoves((m) => m + 1);
        const [a, b] = next;
        if (deck[a].iconIndex === deck[b].iconIndex) {
          setTimeout(() => {
            setDeck((prev) => {
              const updated = prev.map((c) => (c.id === a || c.id === b ? { ...c, matched: true } : c));
              playSound(updated.every((c) => c.matched) ? "success" : "score");
              return updated;
            });
            setFlipped([]);
            setLocked(false);
          }, 400);
        } else {
          setTimeout(() => {
            setFlipped([]);
            setLocked(false);
            playSound("fail");
          }, 800);
        }
      }
    },
    [locked, flipped, deck]
  );

  return (
    <GameFrame
      title="MEMORY MATCH"
      status={won ? `SOLVED IN ${moves}` : `MOVES ${moves}`}
      onRestart={reset}
      controlsLegend="FLIP TWO CARDS TO FIND A PAIR"
    >
      <div className="p-4">
        <div className="grid grid-cols-4 gap-2 max-w-[320px] mx-auto">
          {deck.map((card) => {
            const isFlipped = flipped.includes(card.id) || card.matched;
            const Icon = ICONS[card.iconIndex];
            return (
              <button
                key={card.id}
                type="button"
                data-cursor="link"
                onClick={() => flip(card.id)}
                aria-label={isFlipped ? "Revealed card" : "Hidden card"}
                className={`aspect-square rounded-md flex items-center justify-center transition-colors ${
                  card.matched ? "bg-accent/20 border border-accent/50" : isFlipped ? "bg-bg-raised border border-fg-faint/50" : "bg-[#232320] hover:bg-[#2b2b27]"
                }`}
              >
                {isFlipped ? <Icon className="w-6 h-6 text-fg" /> : <span className="label-mono text-fg-faint">?</span>}
              </button>
            );
          })}
        </div>
      </div>
    </GameFrame>
  );
}
