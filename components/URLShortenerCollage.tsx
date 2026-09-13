import Sticker from "@/components/Sticker";
import DraggablePiece from "@/components/DraggablePiece";

const FLOW = ["URL", "HASH", "DATABASE", "REDIRECT"];

/**
 * A compact technical-artifact visual for the URL Shortener project —
 * a small flow card plus its build/deploy stickers. Draggable, like the
 * PaperForge collage, for a consistent "physical desk" feel.
 */
export default function URLShortenerCollage({ className = "" }: { className?: string }) {
  return (
    <div className={`relative aspect-[6/5] w-full select-none ${className}`}>
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-lg bg-[#0a0a09]"
        style={{
          boxShadow: "inset 0 2px 14px rgba(0,0,0,0.55)",
          backgroundImage: "radial-gradient(rgba(245,245,240,0.05) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />

      <DraggablePiece rotate={-2} className="paper absolute left-[6%] top-[8%] w-[70%] p-5 shadow-2xl">
        <p className="label-mono !text-[9px] !text-[#6b6350] mb-4">REQUEST FLOW</p>
        <div className="flex flex-col gap-2.5">
          {FLOW.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-[#211d14]/50 w-4">{`0${i + 1}`}</span>
              <span className="font-display text-lg leading-none text-[#211d14]">{step}</span>
              {i < FLOW.length - 1 && (
                <span className="ml-auto font-mono text-[#211d14]/40">↓</span>
              )}
            </div>
          ))}
        </div>
      </DraggablePiece>

      <DraggablePiece rotate={5} className="absolute right-[4%] top-[14%] drop-shadow-lg">
        <Sticker tone="outline" rotate={0}>DJANGO</Sticker>
      </DraggablePiece>
      <DraggablePiece rotate={-4} className="absolute right-[0%] top-[32%] drop-shadow-lg">
        <Sticker tone="outline" rotate={0}>DOCKER</Sticker>
      </DraggablePiece>
      <DraggablePiece rotate={3} className="absolute right-[6%] top-[50%] drop-shadow-lg">
        <Sticker tone="accent" rotate={0}>CI/CD</Sticker>
      </DraggablePiece>

      <DraggablePiece rotate={2} className="absolute left-[10%] bottom-[6%]">
        <p className="label-hand" style={{ color: "var(--color-fg)" }}>short link, real pipeline</p>
      </DraggablePiece>
    </div>
  );
}
