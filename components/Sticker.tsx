type Props = {
  children: React.ReactNode;
  rotate?: number;
  tone?: "accent" | "red" | "paper" | "outline";
  className?: string;
  style?: React.CSSProperties;
};

const TONE_CLASSES: Record<NonNullable<Props["tone"]>, string> = {
  accent: "bg-accent text-[#160f02]",
  red: "bg-accent-red text-[#160f02]",
  paper: "paper",
  outline: "border border-fg-faint text-fg-muted bg-bg/60 backdrop-blur-sm",
};

/** Small pill/sticker label — a technology tag or short annotation. */
export default function Sticker({
  children,
  rotate = -3,
  tone = "outline",
  className = "",
  style,
}: Props) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full label-mono !text-[10px] shadow-sm select-none ${TONE_CLASSES[tone]} ${className}`}
      style={{ transform: `rotate(${rotate}deg)`, ...style }}
    >
      {children}
    </span>
  );
}
