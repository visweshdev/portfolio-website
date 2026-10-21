"use client";

import { useEffect } from "react";
import GameLoader from "@/components/games/GameLoader";
import { playSound } from "@/lib/sound";

export default function ArcadeModal({ gameId, onClose }: { gameId: string; onClose: () => void }) {
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    playSound("whoosh");
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  function closeWithSound() {
    playSound("click");
    onClose();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] bg-bg/95 backdrop-blur-sm flex flex-col items-center justify-center px-4 py-20 overflow-y-auto"
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
      <GameLoader id={gameId} />
    </div>
  );
}
