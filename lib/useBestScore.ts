"use client";

import { useCallback, useState } from "react";

function readBest(key: string): number | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = window.localStorage.getItem(key);
    return saved ? Number(saved) : null;
  } catch {
    return null;
  }
}

/**
 * A numeric "best score" persisted to localStorage for this viewer —
 * shared by the arcade games that track a high score or fastest time.
 * `higherIsBetter` is false for things like reaction time, where a
 * lower number wins.
 */
export function useBestScore(key: string, higherIsBetter: boolean) {
  const [best, setBest] = useState<number | null>(() => readBest(key));

  const report = useCallback(
    (value: number) => {
      setBest((prev) => {
        const improved = prev === null || (higherIsBetter ? value > prev : value < prev);
        if (!improved) return prev;
        try {
          window.localStorage.setItem(key, String(value));
        } catch {
          /* ignore unavailable storage */
        }
        return value;
      });
    },
    [key, higherIsBetter]
  );

  return [best, report] as const;
}
