"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import GameLoader from "@/components/games/GameLoader";
import ArcadeCabinet from "@/components/games/ArcadeCabinet";
import { games } from "@/data/games";
import { playSound } from "@/lib/sound";
import { useModal } from "@/lib/useModal";

export default function ArcadeModal({ gameId, onClose }: { gameId: string; onClose: () => void }) {
  const dialogRef = useModal<HTMLDivElement>(onClose);
  const title = games.find((g) => g.id === gameId)?.title ?? "Game";

  useEffect(() => {
    playSound("whoosh");
  }, []);

  function closeWithSound() {
    playSound("click");
    onClose();
  }

  // Portaled to <body> so no transformed ancestor (the page-transition
  // wrapper, a Reveal) can turn `position: fixed` into "fixed to it".
  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      tabIndex={-1}
      data-lenis-prevent
      className="fixed inset-0 z-[100] bg-bg/95 backdrop-blur-sm flex flex-col items-center px-4 py-12 overflow-y-auto outline-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeWithSound();
      }}
    >
      <button
        type="button"
        onClick={closeWithSound}
        data-cursor="link"
        aria-label="Close game"
        className="fixed top-5 right-5 label-mono border border-fg-faint rounded-full px-4 py-2 hover:border-accent hover:text-accent transition-colors z-10"
      >
        CLOSE ✕
      </button>
      <ArcadeCabinet title={title}>
        <GameLoader id={gameId} />
      </ArcadeCabinet>
    </div>,
    document.body
  );
}
