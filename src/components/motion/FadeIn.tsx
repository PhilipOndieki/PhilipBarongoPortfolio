"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { useInView } from "@/hooks/useInView";
import { projectPage } from "@/lib/motion";

interface FadeInProps {
  readonly children: ReactNode;
  /** Position in its column, for the stagger. */
  readonly index?: number;
  /** Duration, start opacity and stagger: `projectPage` or `about` in src/lib/motion.ts. */
  readonly timing?: "project" | "about";
  readonly className?: string;
}

/**
 * Fades a block from 20% to full once, when 20% of it is visible. A black
 * cover over the block fades out (opacity only), which on the pure black page
 * looks the same as the block at 20% opacity, while the text keeps its real
 * contrast for assistive tech and audits. No blur.
 */
export function FadeIn({ children, index = 0, timing = "project", className = "" }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shown = useInView(ref, { threshold: projectPage.textRevealRatio, once: true });

  return (
    <div
      ref={ref}
      className={`fade-in ${className}`}
      data-shown={shown ? "" : undefined}
      data-timing={timing}
      style={{ "--i": index } as CSSProperties}
    >
      {children}
    </div>
  );
}
