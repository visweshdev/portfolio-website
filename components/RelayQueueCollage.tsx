import Image from "next/image";
import DraggablePiece from "@/components/DraggablePiece";
import Sticker from "@/components/Sticker";
import Tape from "@/components/Tape";

export default function RelayQueueCollage({ className = "" }: { className?: string }) {
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

      <DraggablePiece rotate={-4} className="absolute left-[7%] top-[9%] w-[70%]">
        <Tape rotate={-10} className="!left-5 !-top-3" />
        <div className="bg-white p-1.5 shadow-2xl">
          <Image
            src="/projects/relayqueue-dashboard.png"
            alt="RelayQueue dashboard showing job statuses, queues, and attempt counts"
            width={1440}
            height={1000}
            sizes="(min-width: 1024px) 540px, 70vw"
            className="h-auto w-full pointer-events-none"
            draggable={false}
          />
        </div>
      </DraggablePiece>

      <DraggablePiece rotate={6} className="absolute right-[5%] top-[10%] drop-shadow-lg">
        <Sticker tone="accent" rotate={0}>v0.1.0</Sticker>
      </DraggablePiece>

      <DraggablePiece
        rotate={3}
        className="absolute right-[5%] top-[53%] rounded-md border border-accent/50 bg-bg-raised px-3 py-2 shadow-xl"
      >
        <p className="label-mono !text-[9px]">JOB SUBMISSION</p>
        <p className="font-display text-2xl leading-none mt-1 text-fg">
          35 ms <span className="text-sm text-accent">p95</span>
        </p>
        <p className="font-mono text-[9px] mt-1 text-fg-muted">100 requests/sec · local test</p>
      </DraggablePiece>

      <DraggablePiece rotate={-3} className="absolute bottom-[7%] left-[6%]">
        <Tape rotate={-12} className="!left-3 !-top-3" />
        <div className="paper px-4 py-2 shadow-xl">
          <p className="label-hand">lease expires → job retries</p>
        </div>
      </DraggablePiece>
    </div>
  );
}
