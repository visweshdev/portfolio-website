"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GameFrame from "@/components/games/GameFrame";
import { playSound } from "@/lib/sound";

const COLS = 7;
const ROWS = 6;
type Cell = 0 | 1 | 2;
type Board = Cell[][];

function emptyBoard(): Board {
  return Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(0));
}

function lowestEmptyRow(board: Board, col: number) {
  for (let r = ROWS - 1; r >= 0; r--) if (board[r][col] === 0) return r;
  return -1;
}

function checkWinner(board: Board): Cell {
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const v = board[r][c];
      if (v === 0) continue;
      for (const [dr, dc] of dirs) {
        let count = 1;
        for (let k = 1; k < 4; k++) {
          const nr = r + dr * k, nc = c + dc * k;
          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || board[nr][nc] !== v) break;
          count++;
        }
        if (count >= 4) return v;
      }
    }
  }
  return 0;
}

function validCols(board: Board) {
  const cols: number[] = [];
  for (let c = 0; c < COLS; c++) if (board[0][c] === 0) cols.push(c);
  return cols;
}

function wouldWin(board: Board, col: number, player: Cell) {
  const row = lowestEmptyRow(board, col);
  if (row === -1) return false;
  const trial = board.map((r) => [...r]);
  trial[row][col] = player;
  return checkWinner(trial) === player;
}

function pickAiColumn(board: Board): number {
  const cols = validCols(board);
  const winMove = cols.find((c) => wouldWin(board, c, 2));
  if (winMove !== undefined) return winMove;
  const blockMove = cols.find((c) => wouldWin(board, c, 1));
  if (blockMove !== undefined) return blockMove;
  const center = COLS >> 1;
  const weighted = cols.flatMap((c) => Array(Math.max(1, 3 - Math.abs(c - center))).fill(c));
  return weighted[Math.floor(Math.random() * weighted.length)];
}

export default function ConnectFourGame() {
  const [board, setBoard] = useState<Board>(emptyBoard);
  const [turn, setTurn] = useState<1 | 2>(1);
  const [winner, setWinner] = useState<Cell>(0);
  const [draw, setDraw] = useState(false);
  const aiTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    if (aiTimeout.current) clearTimeout(aiTimeout.current);
    setBoard(emptyBoard());
    setTurn(1);
    setWinner(0);
    setDraw(false);
  }, []);

  const drop = useCallback(
    (col: number, player: Cell) => {
      setBoard((prev) => {
        const row = lowestEmptyRow(prev, col);
        if (row === -1) return prev;
        const next = prev.map((r) => [...r]);
        next[row][col] = player;
        const win = checkWinner(next);
        playSound("pop");
        if (win) {
          setWinner(win);
          playSound(win === 1 ? "success" : "fail");
        } else if (validCols(next).length === 0) {
          setDraw(true);
        } else {
          setTurn(player === 1 ? 2 : 1);
        }
        return next;
      });
    },
    []
  );

  const playerMove = useCallback(
    (col: number) => {
      if (winner || draw || turn !== 1) return;
      drop(col, 1);
    },
    [winner, draw, turn, drop]
  );

  useEffect(() => {
    if (turn !== 2 || winner || draw) return;
    aiTimeout.current = setTimeout(() => {
      const col = pickAiColumn(board);
      if (col !== undefined) drop(col, 2);
    }, 550);
    return () => {
      if (aiTimeout.current) clearTimeout(aiTimeout.current);
    };
  }, [turn, winner, draw, board, drop]);

  const status = winner === 1 ? "YOU WIN" : winner === 2 ? "CPU WINS" : draw ? "DRAW" : turn === 1 ? "YOUR MOVE" : "CPU THINKING…";

  return (
    <GameFrame
      title="CONNECT FOUR"
      status={status}
      onRestart={reset}
      controlsLegend="CLICK OR TAP A COLUMN TO DROP"
    >
      <div className="p-3 md:p-4">
        <div className="grid grid-cols-7 gap-1.5 max-w-[320px] mx-auto bg-bg-raised rounded-lg p-2">
          {board.map((row, r) =>
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                type="button"
                data-cursor="link"
                onClick={() => playerMove(c)}
                aria-label={`Column ${c + 1}${cell ? `, occupied by ${cell === 1 ? "you" : "CPU"}` : ""}`}
                disabled={Boolean(winner) || draw}
                className="aspect-square rounded-full flex items-center justify-center bg-[#0d0d0c] hover:bg-[#161614] disabled:hover:bg-[#0d0d0c]"
              >
                {cell !== 0 && (
                  <span
                    className="block w-[80%] h-[80%] rounded-full"
                    style={{ background: cell === 1 ? "#e8a33d" : "#d1483f" }}
                  />
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </GameFrame>
  );
}
