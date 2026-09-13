"use client";

import { useSoundEnabled } from "@/lib/useSound";
import { setSoundEnabled, playSound } from "@/lib/sound";

/** A small speaker on/off control for the site's synthesized sound effects. */
export default function SoundToggle({ className = "" }: { className?: string }) {
  const on = useSoundEnabled();

  function toggle() {
    const next = !on;
    setSoundEnabled(next);
    if (next) playSound("click");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      data-cursor="link"
      aria-pressed={on}
      aria-label={on ? "Mute sound effects" : "Enable sound effects"}
      title={on ? "Sound on" : "Sound off"}
      className={`label-mono !text-[11px] border border-fg-faint rounded-full h-8 w-8 flex items-center justify-center hover:border-accent hover:text-accent transition-colors ${className}`}
    >
      {on ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 9v6h4l5 5V4L8 9H4z" fill="currentColor" />
          <path d="M16.5 8.5a5 5 0 0 1 0 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M19 6a9 9 0 0 1 0 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 9v6h4l5 5V4L8 9H4z" fill="currentColor" />
          <path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
}
