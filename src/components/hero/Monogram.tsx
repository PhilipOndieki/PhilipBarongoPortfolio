interface MonogramProps {
  readonly size?: number;
  readonly className?: string;
}

/** Geometric "PO" mark: thin white strokes, no fill. */
export function Monogram({ size = 26, className }: MonogramProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 26 26"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
      className={`block ${className ?? ""}`}
    >
      <path d="M4 21V5h5a4 4 0 0 1 0 8H4" />
      <ellipse cx="19" cy="13" rx="4.5" ry="8" />
    </svg>
  );
}
