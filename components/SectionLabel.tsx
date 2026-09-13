type Props = {
  index: string;
  title: string;
  className?: string;
};

/** Consistent "02 / SELECTED WORKS" heading marker used before each section. */
export default function SectionLabel({ index, title, className = "" }: Props) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="label-mono text-accent">{index}</span>
      <span className="h-px w-8 bg-fg-faint" aria-hidden="true" />
      <span className="label-mono">{title}</span>
    </div>
  );
}
