"use client";

import { useRef, type CSSProperties, type RefObject } from "react";
import { useInView } from "@/hooks/useInView";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import type { StripContent } from "@/types";

interface StripProps {
  readonly content: StripContent;
  readonly className?: string;
  readonly style?: CSSProperties;
  /** Lets the hero measure the space under the strip. */
  readonly ref?: RefObject<HTMLDivElement | null>;
}

interface TileProps {
  readonly label: string;
  readonly hidden?: boolean;
}

function Tile({ label, hidden = false }: TileProps) {
  return (
    <li
      aria-hidden={hidden || undefined}
      // Spacing lives on each tile (not `gap`) so the track is exactly two
      // identical halves and translateX(-50%) loops without a jump.
      className="mr-[10px] flex h-[72px] min-w-[118px] shrink-0 items-center justify-center rounded-[6px] bg-tile px-8 text-[14px] font-medium tracking-[0.01em] whitespace-nowrap text-tile-fg md:h-[98px]"
    >
      {label}
    </li>
  );
}

/** Marquee of selected work. Paused off screen, in hidden tabs and on hover. */
export function Strip({ content, className = "", style, ref: externalRef }: StripProps) {
  const ownRef = useRef<HTMLDivElement>(null);
  const ref = externalRef ?? ownRef;
  const inView = useInView(ref, { initial: true });
  const pageVisible = usePageVisibility();

  return (
    <div
      ref={ref}
      className={`marquee overflow-hidden ${className}`}
      style={style}
      data-paused={inView && pageVisible ? undefined : ""}
    >
      <ul aria-label={content.label} className="marquee-track flex w-max animate-marquee">
        {content.items.map((item) => (
          <Tile key={item} label={item} />
        ))}
        {content.items.map((item) => (
          <Tile key={`${item}-copy`} label={item} hidden />
        ))}
      </ul>
    </div>
  );
}
