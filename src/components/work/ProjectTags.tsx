import type { CSSProperties } from "react";

interface ProjectTagsProps {
  readonly tags: readonly string[];
  /** Chips appear with the row's masked reveal (homepage). Off on project pages. */
  readonly reveal?: boolean;
  readonly className?: string;
}

export function ProjectTags({ tags, reveal = true, className = "" }: ProjectTagsProps) {
  return (
    <ul className={`flex flex-wrap gap-1 ${className}`}>
      {tags.map((tag, index) => (
        <li
          key={tag}
          className={`${reveal ? "reveal-chip " : ""}rounded-[3px] bg-chip px-[7px] py-[3px] text-[10px] leading-[1.4] font-medium text-chip-fg`}
          style={{ "--i": index } as CSSProperties}
        >
          {tag}
        </li>
      ))}
    </ul>
  );
}
