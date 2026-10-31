import Image from "next/image";
import Tape from "@/components/Tape";
import Sticker from "@/components/Sticker";
import DraggablePiece from "@/components/DraggablePiece";

/**
 * Scrapbook visual for ReMem: the real benchmark chart from the repo
 * printed and taped down, a terminal showing an outdated fact being
 * retired, a memory's ledger card, the lifecycle, and a note. Every
 * piece can be dragged (with a mouse).
 */
export default function ReMemCollage({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={`relative aspect-[6/5] w-full select-none ${className}`}>
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-lg bg-[#0a0a09]"
        style={{
          boxShadow: "inset 0 2px 14px rgba(0,0,0,0.55)",
          backgroundImage:
            "radial-gradient(rgba(245,245,240,0.05) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />

      {/* the results chart, printed out */}
      <DraggablePiece
        rotate={-3}
        className="absolute left-[4%] top-[5%] w-[56%]"
      >
        <Tape rotate={-10} className="!left-4 !-top-3" />
        <div className="bg-white p-1.5 shadow-2xl">
          <Image
            src="/projects/remem-results.png"
            alt="Bar chart: ReMem reaches 76.4% task success, against 62.6% for similarity-only retrieval"
            width={1080}
            height={435}
            sizes="(min-width: 1024px) 22vw, 55vw"
            className="w-full h-auto pointer-events-none"
            draggable={false}
          />
        </div>
      </DraggablePiece>

      {/* terminal: the replaced fact gets retired */}
      <DraggablePiece
        rotate={2}
        className="absolute right-[3%] top-[33%] w-[50%] rounded-md bg-bg-raised border border-fg-faint/40 p-3 shadow-2xl"
      >
        <p className="label-mono !text-[9px] mb-2">python basic_api.py</p>
        <pre className="font-mono text-[10px] leading-relaxed text-fg-muted overflow-hidden whitespace-pre-wrap">
          <span className="text-fg">
            {'>>> mem.search("where is our server?")'}
          </span>
          {"\n"}
          <span className="text-accent">{"  west-2"}</span>
          {"   ACTIVE\n"}
          <span className="line-through opacity-60">{"  east-1"}</span>
          {"   INVALIDATED"}
        </pre>
      </DraggablePiece>

      {/* one memory's ledger */}
      <DraggablePiece
        rotate={-2}
        className="absolute left-[4%] bottom-[5%] w-[40%]"
      >
        <div className="paper p-2.5 shadow-xl">
          <p className="label-mono !text-[9px] !text-[#6b6350]">
            MEMORY #142 · LEDGER
          </p>
          <div className="mt-2 grid grid-cols-3 gap-1 text-center font-mono text-[10px] text-[#211d14]">
            <span>
              shown
              <br />
              <b className="text-sm">14</b>
            </span>
            <span>
              helped
              <br />
              <b className="text-sm">0</b>
            </span>
            <span>
              hurt
              <br />
              <b className="text-sm">3</b>
            </span>
          </div>
          <p className="label-hand mt-1 text-sm">→ LOW_VALUE</p>
        </div>
      </DraggablePiece>

      {/* lifecycle */}
      <DraggablePiece
        rotate={-6}
        className="absolute right-[5%] top-[7%] drop-shadow-lg"
      >
        <Sticker tone="accent" rotate={0}>
          MCP SERVER
        </Sticker>
      </DraggablePiece>
      <DraggablePiece
        rotate={4}
        className="absolute left-[8%] top-[48%] drop-shadow-lg"
      >
        <Sticker tone="outline" rotate={0}>
          ACTIVE → LOW_VALUE
        </Sticker>
      </DraggablePiece>

      {/* handwritten note */}
      <DraggablePiece rotate={3} className="absolute right-[5%] bottom-[7%]">
        <Tape rotate={12} className="!right-2 !left-auto !-top-3" />
        <div className="paper px-4 py-2 shadow-xl">
          <p className="label-hand">learns what helps</p>
        </div>
      </DraggablePiece>

      <p className="label-mono !text-[9px] text-fg-subtle absolute -bottom-6 left-0 hidden md:block">
        (EVERYTHING HERE IS DRAGGABLE — GO AHEAD)
      </p>
    </div>
  );
}
