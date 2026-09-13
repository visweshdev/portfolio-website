type Props = {
  rotate?: number;
  className?: string;
  style?: React.CSSProperties;
};

/** A small strip of "tape" used to pin collage elements down. */
export default function Tape({ rotate = -4, className = "", style }: Props) {
  return (
    <span
      aria-hidden="true"
      className={`tape ${className}`}
      style={{ transform: `rotate(${rotate}deg)`, ...style }}
    />
  );
}
