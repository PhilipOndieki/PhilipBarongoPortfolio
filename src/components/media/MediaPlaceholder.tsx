interface MediaPlaceholderProps {
  readonly name: string;
  readonly label: string;
  readonly className?: string;
}

/**
 * Stand-in for a project with no media yet. Fills its frame (same size,
 * radius and background as real media). Inside the morphing frame the text
 * and 1px border are counter-scaled (--morph-s), so they stay the same size
 * while the box grows, and the card and frame match exactly at the handoff.
 */
export function MediaPlaceholder({ name, label, className = "" }: MediaPlaceholderProps) {
  return (
    <div className={`media-placeholder ${className}`}>
      <div className="media-placeholder-text">
        <p className="text-[15px] leading-[1.4] text-muted">{name}</p>
        <p className="mt-2 text-[13px] leading-[1.4] text-placeholder-fg">{label}</p>
      </div>
    </div>
  );
}
