"use client";

type Dir = "up" | "down" | "left" | "right";

type Props = {
  onDir?: (dir: Dir) => void;
  onAction?: () => void;
  actionLabel?: string;
  showUp?: boolean;
};

const BTN =
  "flex items-center justify-center h-12 w-12 rounded-lg border border-fg-faint/50 bg-bg-raised text-fg active:bg-accent active:text-[#160f02] active:border-accent transition-colors";

/** A minimal on-screen D-pad + single action button for touch devices. */
export default function TouchDpad({ onDir, onAction, actionLabel = "GO", showUp = true }: Props) {
  function press(dir: Dir) {
    return (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      onDir?.(dir);
    };
  }

  return (
    <div className="flex items-center justify-between gap-6">
      <div className="grid grid-cols-3 grid-rows-2 gap-2 w-fit">
        <span />
        {showUp ? (
          <button aria-label="Up" className={BTN} onTouchStart={press("up")} onMouseDown={press("up")}>
            ▲
          </button>
        ) : (
          <span />
        )}
        <span />
        <button aria-label="Left" className={BTN} onTouchStart={press("left")} onMouseDown={press("left")}>
          ◀
        </button>
        <button aria-label="Down" className={BTN} onTouchStart={press("down")} onMouseDown={press("down")}>
          ▼
        </button>
        <button aria-label="Right" className={BTN} onTouchStart={press("right")} onMouseDown={press("right")}>
          ▶
        </button>
      </div>
      {onAction && (
        <button
          aria-label={actionLabel}
          className={`${BTN} !w-20 !h-20 rounded-full label-mono !text-[11px]`}
          onTouchStart={(e) => {
            e.preventDefault();
            onAction();
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            onAction();
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
