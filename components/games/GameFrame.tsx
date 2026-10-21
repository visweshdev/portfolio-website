"use client";

import { playSound } from "@/lib/sound";

type Props = {
  title: string;
  status: string;
  onRestart: () => void;
  children: React.ReactNode;
  controlsLegend: string;
  touchControls?: React.ReactNode;
};

/**
 * Shared "arcade cabinet" chrome around every game: title, live status
 * (score/lives/etc.), a restart button, and a slot for on-screen touch
 * controls. Keeps every game's actual canvas/logic free of UI concerns.
 */
export default function GameFrame({
  title,
  status,
  onRestart,
  children,
  controlsLegend,
  touchControls,
}: Props) {
  return (
    <div className="w-full max-w-md mx-auto select-none">
      <div className="flex items-center justify-between mb-3">
        <p className="font-display text-xl">{title}</p>
        <p className="label-mono text-accent">{status}</p>
      </div>

      <div className="rounded-xl border border-fg-faint/40 bg-bg-raised p-3 md:p-4">
        <div className="w-full overflow-hidden rounded-md bg-[#0d0d0c]">{children}</div>
      </div>

      {touchControls && <div className="mt-4">{touchControls}</div>}

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="label-mono !text-[10px]">{controlsLegend}</p>
        <button
          type="button"
          onClick={() => {
            playSound("click");
            onRestart();
          }}
          data-cursor="link"
          className="label-mono !text-[10px] border border-fg-faint rounded-full px-4 py-2 hover:border-accent hover:text-accent transition-colors"
        >
          RESTART
        </button>
      </div>
    </div>
  );
}
