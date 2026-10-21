"use client";

/**
 * A tiny synthesized sound engine — no audio files, just oscillators.
 * Fits the retro-arcade aesthetic of the Playground games, keeps the
 * bundle at zero extra bytes of audio assets, and sidesteps any
 * copyright question around sourcing sound effects.
 *
 * Off by default (unsolicited sound on a portfolio site is obnoxious),
 * persisted to localStorage once a visitor turns it on. The
 * AudioContext itself is created lazily on first use, which also
 * satisfies browsers' autoplay policies (it's always triggered by a
 * real user gesture — a click, a game action).
 */

type SoundName = "click" | "pop" | "success" | "fail" | "score" | "whoosh";

const STORAGE_KEY = "portfolio-sound-enabled";
let ctx: AudioContext | null = null;
let enabled = false;
const listeners = new Set<() => void>();

function readInitialEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

enabled = readInitialEnabled();

function notify() {
  listeners.forEach((l) => l());
}

export function isSoundEnabled() {
  return enabled;
}

export function setSoundEnabled(next: boolean) {
  enabled = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
  } catch {
    /* ignore unavailable storage */
  }
  if (next) getContext()?.resume();
  notify();
}

export function subscribeSound(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

function tone(
  audioCtx: AudioContext,
  { freq, start, duration, type = "sine", gain = 0.08 }: { freq: number; start: number; duration: number; type?: OscillatorType; gain?: number }
) {
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(gain, start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(g).connect(audioCtx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

const RECIPES: Record<SoundName, (audioCtx: AudioContext) => void> = {
  click: (c) => tone(c, { freq: 720, start: c.currentTime, duration: 0.06, type: "square", gain: 0.05 }),
  pop: (c) => tone(c, { freq: 440, start: c.currentTime, duration: 0.09, type: "triangle", gain: 0.07 }),
  score: (c) => {
    tone(c, { freq: 660, start: c.currentTime, duration: 0.08, type: "square", gain: 0.06 });
    tone(c, { freq: 990, start: c.currentTime + 0.06, duration: 0.1, type: "square", gain: 0.06 });
  },
  success: (c) => {
    [523, 659, 784].forEach((freq, i) =>
      tone(c, { freq, start: c.currentTime + i * 0.08, duration: 0.14, type: "triangle", gain: 0.07 })
    );
  },
  fail: (c) => {
    tone(c, { freq: 220, start: c.currentTime, duration: 0.16, type: "sawtooth", gain: 0.06 });
    tone(c, { freq: 150, start: c.currentTime + 0.1, duration: 0.22, type: "sawtooth", gain: 0.06 });
  },
  whoosh: (c) => {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(180, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(560, c.currentTime + 0.3);
    g.gain.setValueAtTime(0.05, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.32);
    osc.connect(g).connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 0.34);
  },
};

export function playSound(name: SoundName) {
  if (!enabled) return;
  const audioCtx = getContext();
  if (!audioCtx) return;
  if (audioCtx.state === "suspended") audioCtx.resume();
  RECIPES[name](audioCtx);
}
