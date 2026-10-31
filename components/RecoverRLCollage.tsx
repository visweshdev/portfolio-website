import Tape from "@/components/Tape";
import Sticker from "@/components/Sticker";
import DraggablePiece from "@/components/DraggablePiece";

// How confident the learned policy is in each recovery, for one failure.
const ACTIONS: [string, number][] = [
  ["retry", 18],
  ["inspect", 31],
  ["refresh schema", 86],
  ["replan", 42],
  ["escalate", 12],
];

/**
 * Scrapbook visual for RecoverRL: a failing tool call, the policy's
 * scores for each recovery action, the chosen action, a verified
 * completion, and a note. Every piece can be dragged (with a mouse).
 */
export default function RecoverRLCollage({
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

      {/* the failure */}
      <DraggablePiece
        rotate={-3}
        className="absolute left-[4%] top-[6%] w-[54%] rounded-md bg-bg-raised border border-accent-red/50 p-3 shadow-2xl"
      >
        <p className="label-mono !text-[9px] mb-2 !text-accent-red">
          trace · step 4 of 7
        </p>
        <pre className="font-mono text-[10px] leading-relaxed text-fg-muted overflow-hidden whitespace-pre-wrap">
          <span className="text-fg">{"call  crm.update_contact(...)"}</span>
          {"\n"}
          <span className="text-accent-red">
            {"ToolError: 422 unknown field"}
          </span>
          {"\n"}
          <span className="text-accent-red">{"  'phone_number'"}</span>
        </pre>
      </DraggablePiece>

      {/* the policy's scores */}
      <DraggablePiece
        rotate={2}
        className="absolute right-[4%] top-[14%] w-[42%]"
      >
        <div className="paper p-3 shadow-2xl">
          <p className="label-mono !text-[9px] !text-[#6b6350]">
            RECOVERY POLICY
          </p>
          <div className="mt-2 space-y-1.5">
            {ACTIONS.map(([name, score]) => {
              const best = name === "refresh schema";
              return (
                <div
                  key={name}
                  className="flex items-center gap-2 font-mono text-[9px] text-[#211d14]"
                >
                  <span className="w-[42%] shrink-0 truncate">{name}</span>
                  <span className="h-[6px] rounded-full bg-[#211d14]/10 flex-1 overflow-hidden">
                    <span
                      className={`block h-full rounded-full ${best ? "bg-accent" : "bg-[#211d14]/35"}`}
                      style={{ width: `${score}%` }}
                    />
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </DraggablePiece>

      {/* chosen action → verified */}
      <DraggablePiece
        rotate={-1}
        className="absolute left-[10%] bottom-[12%] w-[46%] rounded-md bg-bg-raised border border-fg-faint/40 p-3 shadow-2xl"
      >
        <p className="label-mono !text-[9px] mb-2">policy.select(features)</p>
        <pre className="font-mono text-[10px] leading-relaxed text-fg-muted overflow-hidden whitespace-pre-wrap">
          <span className="text-accent">{"→ refresh_schema"}</span>
          {"\n"}
          {"retry step 4 …"}
          {"\n"}
          <span className="text-fg">{"✓ task verified"}</span>
        </pre>
      </DraggablePiece>

      <DraggablePiece
        rotate={-7}
        className="absolute left-[46%] top-[45%] drop-shadow-lg"
      >
        <Sticker tone="red" rotate={0}>
          IN DEVELOPMENT
        </Sticker>
      </DraggablePiece>

      {/* handwritten note */}
      <DraggablePiece rotate={3} className="absolute right-[8%] bottom-[6%]">
        <Tape rotate={-12} className="!left-2 !-top-3" />
        <div className="paper px-4 py-2 shadow-xl">
          <p className="label-hand">don&apos;t just retry — pick the fix</p>
        </div>
      </DraggablePiece>

      <p className="label-mono !text-[9px] text-fg-subtle absolute -bottom-6 left-0 hidden md:block">
        (EVERYTHING HERE IS DRAGGABLE — GO AHEAD)
      </p>
    </div>
  );
}
