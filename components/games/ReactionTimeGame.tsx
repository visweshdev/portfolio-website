"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GameFrame from "@/components/games/GameFrame";
import { useBestScore } from "@/lib/useBestScore";
import { playSound } from "@/lib/sound";

type Phase = "idle" | "waiting" | "go" | "result" | "tooSoon";

export default function ReactionTimeGame() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [lastMs, setLastMs] = useState<number | null>(null);
  const [best, reportBest] = useBestScore("portfolio-reaction-best", false);
  const goAt = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const start = useCallback(() => {
    setPhase("waiting");
    const delay = 900 + Math.random() * 2600;
    timeoutRef.current = setTimeout(() => {
      goAt.current = performance.now();
      setPhase("go");
      playSound("whoosh");
    }, delay);
  }, []);

  const handleClick = useCallback(() => {
    if (phase === "idle" || phase === "result" || phase === "tooSoon") {
      start();
      return;
    }
    if (phase === "waiting") {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setPhase("tooSoon");
      playSound("fail");
      return;
    }
    if (phase === "go") {
      const ms = Math.round(performance.now() - goAt.current);
      setLastMs(ms);
      setPhase("result");
      reportBest(ms);
      playSound("success");
    }
  }, [phase, start, reportBest]);

  const reset = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setPhase("idle");
    setLastMs(null);
  }, []);

  const bg = phase === "go" ? "#7fb56b" : phase === "tooSoon" ? "#d1483f" : "#181815";
  const label =
    phase === "idle" ? "CLICK TO START" :
    phase === "waiting" ? "WAIT FOR GREEN…" :
    phase === "go" ? "CLICK NOW!" :
    phase === "tooSoon" ? "TOO SOON — CLICK TO RETRY" :
    `${lastMs} MS — CLICK TO GO AGAIN`;

  return (
    <GameFrame
      title="REACTION TIME"
      status={best !== null ? `BEST ${best} MS` : "NO RUNS YET"}
      onRestart={reset}
      controlsLegend="CLICK WHEN THE PANEL TURNS GREEN"
    >
      <button
        type="button"
        onClick={handleClick}
        data-cursor="link"
        className="w-full aspect-[4/3] flex items-center justify-center transition-colors duration-150"
        style={{ background: bg }}
      >
        <span className="font-display text-xl md:text-2xl text-fg text-center px-6">{label}</span>
      </button>
    </GameFrame>
  );
}
