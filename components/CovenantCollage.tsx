import Tape from "@/components/Tape";
import Sticker from "@/components/Sticker";
import DraggablePiece from "@/components/DraggablePiece";

// Plain-English rule → the checker Covenant binds it to.
const RULES: [string, string][] = [
  ["don't change public APIs", "api_surface"],
  ["never force push", "refused"],
  ["run tests before committing", "step_order"],
];

/**
 * Scrapbook visual for Covenant: the plain-English rules and the checks
 * they compile to, a terminal where the agent's destructive SQL gets
 * blocked and explained, the benchmark result, and a note. Every piece
 * can be dragged (with a mouse).
 */
export default function CovenantCollage({ className = "" }: { className?: string }) {
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

      {/* the rules, written in plain English and compiled to checks */}
      <DraggablePiece rotate={-3} className="absolute left-[4%] top-[6%] w-[52%]">
        <Tape rotate={-10} className="!left-4 !-top-3" />
        <div className="paper p-3 shadow-2xl">
          <p className="label-mono !text-[9px] !text-[#6b6350]">COVENANT.YAML</p>
          <ul className="mt-2 space-y-1.5">
            {RULES.map(([rule, check]) => (
              <li key={rule} className="font-mono text-[9px] leading-snug text-[#211d14]">
                <span className="label-hand !text-[13px] block leading-none">&ldquo;{rule}&rdquo;</span>
                <span className="opacity-60">→ {check}</span>
              </li>
            ))}
          </ul>
        </div>
      </DraggablePiece>

      {/* the agent tries something destructive; Covenant blocks it */}
      <DraggablePiece
        rotate={2}
        className="absolute right-[3%] top-[30%] w-[54%] rounded-md bg-bg-raised border border-accent-red/50 p-3 shadow-2xl"
      >
        <p className="label-mono !text-[9px] mb-2">$ covenant explain</p>
        <pre className="font-mono text-[10px] leading-relaxed text-fg-muted overflow-hidden whitespace-pre-wrap">
          <span className="text-fg">{'psql -c "DROP TABLE users"'}</span>
          {"\n"}
          <span className="text-accent-red">{"✕ BLOCKED · rule C3"}</span>
          {"\n"}
          {"never run destructive SQL"}
        </pre>
      </DraggablePiece>

      {/* the result */}
      <DraggablePiece rotate={-2} className="absolute left-[6%] bottom-[8%] w-[38%]">
        <div className="paper p-2.5 shadow-xl">
          <p className="label-mono !text-[9px] !text-[#6b6350]">VIOLATIONS / TASK</p>
          <p className="font-display text-2xl leading-none mt-1 text-[#211d14]">
            1.17 <span className="opacity-50">→</span> 0
          </p>
          <p className="font-mono text-[9px] mt-1 text-[#211d14]/70">task success 100%</p>
        </div>
      </DraggablePiece>

      <DraggablePiece rotate={-6} className="absolute right-[6%] top-[7%] drop-shadow-lg">
        <Sticker tone="accent" rotate={0}>
          ON PYPI
        </Sticker>
      </DraggablePiece>

      {/* handwritten note */}
      <DraggablePiece rotate={3} className="absolute right-[6%] bottom-[7%]">
        <Tape rotate={12} className="!right-2 !left-auto !-top-3" />
        <div className="paper px-4 py-2 shadow-xl">
          <p className="label-hand">outcomes, not tool calls</p>
        </div>
      </DraggablePiece>

      <p className="label-mono !text-[9px] text-fg-subtle absolute -bottom-6 left-0 hidden md:block">
        (EVERYTHING HERE IS DRAGGABLE — GO AHEAD)
      </p>
    </div>
  );
}
