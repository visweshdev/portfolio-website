"use client";

import { useCallback, useEffect, useState } from "react";
import GameFrame from "@/components/games/GameFrame";
import { playSound } from "@/lib/sound";

const WORDS = [
  "REACT", "BUILD", "SPEED", "LIGHT", "MUSIC", "CLOUD", "PLANT", "SPACE",
  "QUICK", "BRAVE", "CHART", "DRIVE", "EARTH", "FRAME", "GRAPH", "HOUSE",
  "IMAGE", "LEMON", "MONEY", "NORTH", "OCEAN", "PAPER", "QUEEN", "RIVER",
  "STONE", "TIGER", "UNITY", "VIVID", "TRACK", "TOKEN",
];
const WORD_LEN = 5;
const MAX_GUESSES = 6;
const KEY_ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

type LetterState = "correct" | "present" | "absent" | "empty";

function evaluateGuess(guess: string, target: string): LetterState[] {
  const result: LetterState[] = Array(WORD_LEN).fill("absent");
  const targetLetters = target.split("");
  const used = Array(WORD_LEN).fill(false);

  for (let i = 0; i < WORD_LEN; i++) {
    if (guess[i] === targetLetters[i]) {
      result[i] = "correct";
      used[i] = true;
    }
  }
  for (let i = 0; i < WORD_LEN; i++) {
    if (result[i] === "correct") continue;
    const idx = targetLetters.findIndex((l, j) => l === guess[i] && !used[j]);
    if (idx !== -1) {
      result[i] = "present";
      used[idx] = true;
    }
  }
  return result;
}

const STATE_BG: Record<LetterState, string> = {
  correct: "#7fb56b",
  present: "#e8a33d",
  absent: "#3a3934",
  empty: "#181815",
};

function pickWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

export default function WordGuessGame() {
  const [target, setTarget] = useState(pickWord);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [current, setCurrent] = useState("");
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing");

  const reset = useCallback(() => {
    setTarget(pickWord());
    setGuesses([]);
    setCurrent("");
    setStatus("playing");
  }, []);

  const submit = useCallback(() => {
    if (current.length !== WORD_LEN || status !== "playing") return;
    const guess = current.toUpperCase();
    setGuesses((prev) => {
      const next = [...prev, guess];
      if (guess === target) {
        setStatus("won");
        playSound("success");
      } else if (next.length >= MAX_GUESSES) {
        setStatus("lost");
        playSound("fail");
      } else {
        playSound("click");
      }
      return next;
    });
    setCurrent("");
  }, [current, status, target]);

  const typeLetter = useCallback(
    (letter: string) => {
      if (status !== "playing") return;
      setCurrent((c) => {
        if (c.length >= WORD_LEN) return c;
        playSound("click");
        return c + letter;
      });
    },
    [status]
  );

  const backspace = useCallback(() => {
    if (status !== "playing") return;
    setCurrent((c) => {
      if (c.length === 0) return c;
      playSound("click");
      return c.slice(0, -1);
    });
  }, [status]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Enter") { e.preventDefault(); submit(); return; }
      if (e.key === "Backspace") { e.preventDefault(); backspace(); return; }
      if (/^[a-zA-Z]$/.test(e.key)) typeLetter(e.key.toUpperCase());
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [submit, backspace, typeLetter]);

  const rows = Array.from({ length: MAX_GUESSES }, (_, i) => guesses[i] ?? (i === guesses.length ? current : ""));

  return (
    <GameFrame
      title="WORD GUESS"
      status={status === "won" ? `SOLVED IN ${guesses.length}` : status === "lost" ? `IT WAS ${target}` : `GUESS ${guesses.length + 1} / ${MAX_GUESSES}`}
      onRestart={reset}
      controlsLegend="TYPE A 5-LETTER WORD · ENTER TO GUESS"
    >
      <div className="p-4 flex flex-col items-center gap-4">
        <div className="flex flex-col gap-1.5">
          {rows.map((word, r) => {
            const isSubmitted = r < guesses.length;
            const evaluation = isSubmitted ? evaluateGuess(word, target) : null;
            return (
              <div key={r} className="flex gap-1.5">
                {Array.from({ length: WORD_LEN }, (_, c) => (
                  <div
                    key={c}
                    className="h-11 w-11 rounded-md flex items-center justify-center font-display text-lg uppercase"
                    style={{
                      background: evaluation ? STATE_BG[evaluation[c]] : "#181815",
                      color: evaluation ? "#100c04" : "#f5f5f0",
                      border: !evaluation && word[c] ? "1px solid rgba(245,245,240,0.4)" : "1px solid transparent",
                    }}
                  >
                    {word[c] || ""}
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-1.5 w-full max-w-[320px]">
          {KEY_ROWS.map((row, i) => (
            <div key={row} className="flex justify-center gap-1">
              {i === 2 && (
                <button onClick={submit} data-cursor="link" className="label-mono !text-[9px] px-2 h-9 rounded bg-bg-raised border border-fg-faint/40">
                  ENTER
                </button>
              )}
              {row.split("").map((letter) => (
                <button
                  key={letter}
                  onClick={() => typeLetter(letter)}
                  data-cursor="link"
                  className="label-mono !text-[10px] h-9 w-7 rounded bg-bg-raised border border-fg-faint/40 hover:border-accent/60"
                >
                  {letter}
                </button>
              ))}
              {i === 2 && (
                <button onClick={backspace} data-cursor="link" className="label-mono !text-[9px] px-2 h-9 rounded bg-bg-raised border border-fg-faint/40">
                  DEL
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </GameFrame>
  );
}
