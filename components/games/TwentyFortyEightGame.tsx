"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GameFrame from "@/components/games/GameFrame";
import TouchDpad from "@/components/games/TouchDpad";
import { useBestScore } from "@/lib/useBestScore";
import { playSound } from "@/lib/sound";

const SIZE = 4;
type Board = number[][];

function emptyBoard(): Board {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

function emptyCells(board: Board) {
  const cells: [number, number][] = [];
  board.forEach((row, r) => row.forEach((v, c) => { if (v === 0) cells.push([r, c]); }));
  return cells;
}

function addRandomTile(board: Board) {
  const cells = emptyCells(board);
  if (cells.length === 0) return board;
  const [r, c] = cells[Math.floor(Math.random() * cells.length)];
  board[r][c] = Math.random() < 0.9 ? 2 : 4;
  return board;
}

function compactRow(row: number[]) {
  const nums = row.filter((v) => v !== 0);
  let gained = 0;
  for (let i = 0; i < nums.length - 1; i++) {
    if (nums[i] === nums[i + 1]) {
      nums[i] *= 2;
      gained += nums[i];
      nums.splice(i + 1, 1);
    }
  }
  while (nums.length < SIZE) nums.push(0);
  return { row: nums, gained };
}

function transpose(board: Board): Board {
  return board[0].map((_, c) => board.map((row) => row[c]));
}

function moveLeft(board: Board) {
  let moved = false;
  let gained = 0;
  const next = board.map((row) => {
    const { row: newRow, gained: g } = compactRow(row);
    gained += g;
    if (newRow.some((v, i) => v !== row[i])) moved = true;
    return newRow;
  });
  return { board: next, moved, gained };
}

function moveRight(board: Board) {
  const reversed = board.map((row) => [...row].reverse());
  const { board: moved, moved: didMove, gained } = moveLeft(reversed);
  return { board: moved.map((row) => [...row].reverse()), moved: didMove, gained };
}

function moveUp(board: Board) {
  const t = transpose(board);
  const { board: moved, moved: didMove, gained } = moveLeft(t);
  return { board: transpose(moved), moved: didMove, gained };
}

function moveDown(board: Board) {
  const t = transpose(board);
  const { board: moved, moved: didMove, gained } = moveRight(t);
  return { board: transpose(moved), moved: didMove, gained };
}

function canMove(board: Board) {
  if (emptyCells(board).length > 0) return true;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const v = board[r][c];
      if (c < SIZE - 1 && board[r][c + 1] === v) return true;
      if (r < SIZE - 1 && board[r + 1][c] === v) return true;
    }
  }
  return false;
}

const TILE_COLORS: Record<number, string> = {
  2: "#e7e2d3", 4: "#ddd4b8", 8: "#e8a33d", 16: "#e0954a",
  32: "#d1483f", 64: "#c23a3a", 128: "#7fa8e0", 256: "#6f93cf",
  512: "#8fd08f", 1024: "#c79be0", 2048: "#f5f5f0",
};

function freshBoard() {
  return addRandomTile(addRandomTile(emptyBoard()));
}

export default function TwentyFortyEightGame() {
  const [board, setBoard] = useState<Board>(freshBoard);
  const [score, setScore] = useState(0);
  const [best, reportBest] = useBestScore("portfolio-2048-best", true);
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing");
  const wonAnnounced = useRef(false);
  const scoreRef = useRef(0);

  const reset = useCallback(() => {
    setBoard(freshBoard());
    setScore(0);
    scoreRef.current = 0;
    setStatus("playing");
    wonAnnounced.current = false;
  }, []);

  const applyMove = useCallback(
    (mover: (b: Board) => { board: Board; moved: boolean; gained: number }) => {
      if (status === "lost") return;
      setBoard((prev) => {
        const { board: moved, moved: didMove, gained } = mover(prev);
        if (!didMove) return prev;
        const withTile = addRandomTile(cloneBoard(moved));
        if (gained) {
          scoreRef.current += gained;
          setScore(scoreRef.current);
          reportBest(scoreRef.current);
          playSound("pop");
        }
        if (!wonAnnounced.current && withTile.some((row) => row.some((v) => v >= 2048))) {
          wonAnnounced.current = true;
          setStatus("won");
          playSound("success");
        } else if (!canMove(withTile)) {
          setStatus("lost");
          playSound("fail");
        }
        return withTile;
      });
    },
    [status, reportBest]
  );

  const handleDir = useCallback(
    (dir: "up" | "down" | "left" | "right") => {
      const movers = { up: moveUp, down: moveDown, left: moveLeft, right: moveRight };
      applyMove(movers[dir]);
    },
    [applyMove]
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const map: Record<string, "up" | "down" | "left" | "right"> = {
        ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
      };
      const dir = map[e.key];
      if (dir) {
        e.preventDefault();
        handleDir(dir);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleDir]);

  useEffect(() => {
    let sx = 0, sy = 0;
    function onStart(e: TouchEvent) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }
    function onEnd(e: TouchEvent) {
      const dx = e.changedTouches[0].clientX - sx;
      const dy = e.changedTouches[0].clientY - sy;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
      if (Math.abs(dx) > Math.abs(dy)) handleDir(dx > 0 ? "right" : "left");
      else handleDir(dy > 0 ? "down" : "up");
    }
    const el = document.getElementById("game-2048-board");
    el?.addEventListener("touchstart", onStart, { passive: true });
    el?.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      el?.removeEventListener("touchstart", onStart);
      el?.removeEventListener("touchend", onEnd);
    };
  }, [handleDir]);

  return (
    <GameFrame
      title="2048"
      status={status === "won" ? `2048! · ${score}` : status === "lost" ? `NO MOVES · ${score}` : `${score} · BEST ${best ?? 0}`}
      onRestart={reset}
      controlsLegend="ARROWS OR SWIPE TO SLIDE"
      touchControls={<TouchDpad onDir={handleDir} showUp />}
    >
      <div id="game-2048-board" className="p-3 md:p-4">
        <div className="grid grid-cols-4 gap-2 max-w-[320px] mx-auto">
          {board.map((row, r) =>
            row.map((v, c) => (
              <div
                key={`${r}-${c}`}
                className="aspect-square rounded-md flex items-center justify-center font-display text-lg md:text-xl transition-colors"
                style={{
                  background: v ? TILE_COLORS[v] || "#f5f5f0" : "#181815",
                  color: v && v <= 4 ? "#2a2416" : "#100c04",
                }}
              >
                {v || ""}
              </div>
            ))
          )}
        </div>
      </div>
    </GameFrame>
  );
}
