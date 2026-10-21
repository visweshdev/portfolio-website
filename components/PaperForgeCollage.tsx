import Tape from "@/components/Tape";
import Sticker from "@/components/Sticker";
import DraggablePiece from "@/components/DraggablePiece";

/**
 * A digital-scrapbook visual for PaperForge AI: a research paper,
 * a chunking/embedding diagram, a handwritten annotation, and a
 * Python code fragment, arranged like objects on a desk rather than
 * a boring architecture diagram. Every piece can be picked up and
 * dragged — this is the "physical desk," not a static illustration.
 */
export default function PaperForgeCollage({ className = "" }: { className?: string }) {
  return (
    <div className={`relative aspect-[6/5] w-full select-none ${className}`}>
      {/* the "board" the pieces sit on — grounds them with depth */}
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-lg bg-[#0a0a09]"
        style={{
          boxShadow: "inset 0 2px 14px rgba(0,0,0,0.55)",
          backgroundImage: "radial-gradient(rgba(245,245,240,0.05) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />

      {/* research paper sheet */}
      <DraggablePiece
        rotate={-4}
        className="paper torn-edge absolute left-[4%] top-[6%] w-[46%] p-4 shadow-2xl"
      >
        <p className="label-mono !text-[9px] !text-[#6b6350]">RESEARCH PAPER</p>
        <div className="mt-3 space-y-1.5">
          {[100, 92, 96, 60, 88, 70].map((w, i) => (
            <div key={i} className="h-[3px] bg-[#211d14]/25 rounded-full" style={{ width: `${w}%` }} />
          ))}
        </div>
        <p className="label-hand mt-3 text-sm">methodology, §3.2</p>
      </DraggablePiece>

      {/* vector / embedding cluster */}
      <DraggablePiece rotate={0} className="absolute left-[30%] top-[36%] w-[30%]">
        <svg viewBox="0 0 120 100" className="w-full text-accent drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]" aria-hidden="true">
          <g stroke="currentColor" strokeWidth="0.6" opacity="0.5">
            <line x1="20" y1="20" x2="55" y2="45" />
            <line x1="55" y1="45" x2="95" y2="25" />
            <line x1="55" y1="45" x2="70" y2="80" />
            <line x1="20" y1="20" x2="70" y2="80" />
          </g>
          {[[20, 20], [55, 45], [95, 25], [70, 80], [30, 70]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i === 1 ? 4.5 : 3} fill="currentColor" opacity={i === 1 ? 1 : 0.75} />
          ))}
        </svg>
      </DraggablePiece>

      {/* RAG sticker */}
      <DraggablePiece rotate={-8} className="absolute left-[6%] bottom-[10%] drop-shadow-lg">
        <Sticker tone="accent" rotate={0}>RAG PIPELINE</Sticker>
      </DraggablePiece>

      {/* code snippet card */}
      <DraggablePiece
        rotate={3}
        className="absolute right-[3%] top-[10%] w-[48%] rounded-md bg-bg-raised border border-fg-faint/40 p-3 shadow-2xl"
      >
        <p className="label-mono !text-[9px] mb-2">retrieval.py</p>
        <pre className="font-mono text-[10px] leading-relaxed text-fg-muted overflow-hidden">
{`def retrieve(query, k=5):
    vec = embed(query)
    return faiss_index.search(
        vec, k
    )`}
        </pre>
      </DraggablePiece>

      {/* handwritten annotation, taped */}
      <DraggablePiece rotate={-3} className="absolute right-[10%] bottom-[16%]">
        <Tape rotate={-14} className="!left-2 !-top-3" />
        <div className="paper px-4 py-2 shadow-xl">
          <p className="label-hand">chunk → embed → retrieve → generate</p>
        </div>
      </DraggablePiece>

      {/* python function card */}
      <DraggablePiece
        rotate={2}
        className="absolute left-[16%] bottom-[-4%] w-[42%] rounded-md bg-bg-raised border border-fg-faint/40 p-3 shadow-2xl"
      >
        <p className="label-mono !text-[9px] mb-2">methodology_parser.py</p>
        <pre className="font-mono text-[10px] leading-relaxed text-fg-muted overflow-hidden">
{`class MethodParser:
    def to_python(self, eq):
        return compile_fn(eq)`}
        </pre>
      </DraggablePiece>

      <p className="label-mono !text-[9px] text-fg-faint absolute -bottom-6 left-0 hidden md:block">
        (EVERYTHING HERE IS DRAGGABLE — GO AHEAD)
      </p>
    </div>
  );
}
