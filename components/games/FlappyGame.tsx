"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GameFrame from "@/components/games/GameFrame";
import { setupCanvas } from "@/lib/canvas";
import { useGameLoop } from "@/lib/useGameLoop";
import { useBestScore } from "@/lib/useBestScore";
import { playSound } from "@/lib/sound";

const W = 320;
const H = 420;
const BIRD_X = 70;
const BIRD_R = 10;
const GRAVITY = 620;
const FLAP_VELOCITY = -230;
const PIPE_W = 46;
const GAP = 130;
const PIPE_SPEED = 130;
const PIPE_INTERVAL = 1.5;

type Pipe = { x: number; gapY: number; passed: boolean };

export default function FlappyGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [score, setScore] = useState(0);
  const [best, reportBest] = useBestScore("portfolio-flappy-best", true);
  const [status, setStatus] = useState<"ready" | "playing" | "dead">("ready");
  const [running, setRunning] = useState(true);

  const s = useRef({
    birdY: H / 2,
    vy: 0,
    pipes: [] as Pipe[],
    spawnAcc: 0,
    score: 0,
  });

  const reset = useCallback(() => {
    s.current = { birdY: H / 2, vy: 0, pipes: [], spawnAcc: 0, score: 0 };
    setScore(0);
    setStatus("ready");
    setRunning(true);
  }, []);

  useEffect(() => {
    if (canvasRef.current) ctxRef.current = setupCanvas(canvasRef.current, W, H);
  }, []);

  const flap = useCallback(() => {
    setStatus((prev) => {
      if (prev === "dead") return prev;
      s.current.vy = FLAP_VELOCITY;
      playSound("click");
      return "playing";
    });
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === " " || e.key === "ArrowUp") {
        e.preventDefault();
        flap();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flap]);

  const die = useCallback(() => {
    setStatus("dead");
    setRunning(false);
    reportBest(s.current.score);
    playSound("fail");
  }, [reportBest]);

  useGameLoop((dt) => {
    const ctx = ctxRef.current;
    const st = s.current;
    if (!ctx) return;

    if (status === "playing") {
      st.vy += GRAVITY * dt;
      st.birdY += st.vy * dt;

      st.spawnAcc += dt;
      if (st.spawnAcc >= PIPE_INTERVAL) {
        st.spawnAcc = 0;
        const gapY = 60 + Math.random() * (H - 180);
        st.pipes.push({ x: W + PIPE_W, gapY, passed: false });
      }
      st.pipes.forEach((p) => (p.x -= PIPE_SPEED * dt));
      st.pipes = st.pipes.filter((p) => p.x > -PIPE_W);

      for (const p of st.pipes) {
        if (!p.passed && p.x + PIPE_W < BIRD_X) {
          p.passed = true;
          st.score += 1;
          setScore(st.score);
          playSound("score");
        }
        const withinX = BIRD_X + BIRD_R > p.x && BIRD_X - BIRD_R < p.x + PIPE_W;
        const hitsGap = st.birdY - BIRD_R < p.gapY - GAP / 2 || st.birdY + BIRD_R > p.gapY + GAP / 2;
        if (withinX && hitsGap) die();
      }

      if (st.birdY + BIRD_R > H || st.birdY - BIRD_R < 0) die();
    }

    ctx.fillStyle = "#0d0d0c";
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "#e8a33d";
    for (const p of st.pipes) {
      ctx.fillRect(p.x, 0, PIPE_W, p.gapY - GAP / 2);
      ctx.fillRect(p.x, p.gapY + GAP / 2, PIPE_W, H - (p.gapY + GAP / 2));
    }

    ctx.fillStyle = "#f5f5f0";
    ctx.beginPath();
    ctx.arc(BIRD_X, st.birdY, BIRD_R, 0, Math.PI * 2);
    ctx.fill();
  }, running);

  return (
    <GameFrame
      title="FLAPPY FLYER"
      status={status === "dead" ? `GAME OVER · ${score}` : `${score} · BEST ${best ?? 0}`}
      onRestart={reset}
      controlsLegend="SPACE / TAP / CLICK TO FLAP"
    >
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "auto", aspectRatio: `${W}/${H}`, display: "block", touchAction: "none" }}
        onMouseDown={flap}
        onTouchStart={(e) => { e.preventDefault(); flap(); }}
      />
    </GameFrame>
  );
}
