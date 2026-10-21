type Props = {
  strong?: boolean;
  className?: string;
};

/**
 * A very low-contrast technical grid. Present under most sections at
 * whisper-level opacity; `strong` bumps it up around the work/playground
 * areas where the "technical foundation" should show through more.
 */
export default function GridBackground({ strong = false, className = "" }: Props) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${strong ? "bg-grid-strong" : "bg-grid"} ${className}`}
      style={{
        maskImage: "linear-gradient(to bottom, black, black, transparent)",
        WebkitMaskImage: "linear-gradient(to bottom, black, black, transparent)",
      }}
    />
  );
}
