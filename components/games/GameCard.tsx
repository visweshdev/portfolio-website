import type { GameMeta } from "@/data/games";

export default function GameCard({ game, onPlay }: { game: GameMeta; onPlay: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onPlay(game.id)}
      data-cursor="open"
      className="group text-left border border-fg-faint/40 rounded-xl p-5 h-44 flex flex-col justify-between hover:border-accent/70 hover:bg-bg-raised/60 transition-colors"
    >
      <span className={`label-mono ${game.accent === "red" ? "text-accent-red" : "text-accent"}`}>ARCADE</span>
      <div>
        <p className="font-display text-2xl">{game.title}</p>
        <p className="text-sm text-fg-muted mt-1">{game.tagline}</p>
        <p className="label-mono !text-[9px] mt-3 text-fg-faint">{game.controls}</p>
      </div>
      <span className="label-mono text-fg group-hover:text-accent transition-colors inline-flex items-center gap-1.5 self-start">
        PLAY <span aria-hidden="true">↗</span>
      </span>
    </button>
  );
}
