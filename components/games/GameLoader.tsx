"use client";

import dynamic from "next/dynamic";

const LOADING = (
  <div className="w-full max-w-md mx-auto aspect-[4/5] flex items-center justify-center">
    <p className="label-mono text-fg-faint">LOADING GAME…</p>
  </div>
);

// Each game is its own chunk — only the one the visitor opens is ever
// downloaded, so the Playground page itself stays light.
const GAME_COMPONENTS: Record<string, ReturnType<typeof dynamic>> = {
  "2048": dynamic(() => import("@/components/games/TwentyFortyEightGame"), { ssr: false, loading: () => LOADING }),
  flappy: dynamic(() => import("@/components/games/FlappyGame"), { ssr: false, loading: () => LOADING }),
  "word-guess": dynamic(() => import("@/components/games/WordGuessGame"), { ssr: false, loading: () => LOADING }),
  "memory-match": dynamic(() => import("@/components/games/MemoryMatchGame"), { ssr: false, loading: () => LOADING }),
  "connect-four": dynamic(() => import("@/components/games/ConnectFourGame"), { ssr: false, loading: () => LOADING }),
  "reaction-time": dynamic(() => import("@/components/games/ReactionTimeGame"), { ssr: false, loading: () => LOADING }),
};

export default function GameLoader({ id }: { id: string }) {
  const Game = GAME_COMPONENTS[id];
  if (!Game) return null;
  return <Game />;
}
