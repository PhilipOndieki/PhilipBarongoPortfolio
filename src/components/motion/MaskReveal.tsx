"use client";

import { useRef, type ReactNode } from "react";
import { useInView } from "@/hooks/useInView";
import { useRevealGate } from "@/hooks/useRevealGate";
import { reveal } from "@/lib/motion";

interface MaskRevealProps {
  readonly children: ReactNode;
  readonly slug: string;
  /** Where the row's frame reveal runs (null: never). */
  readonly gateQuery: string | null;
  readonly id?: string;
  readonly className?: string;
}

/**
 * Flips `data-reveal` to "shown" once. Descendants with .reveal-line and
 * .reveal-chip animate from that attribute in CSS, so no per-line JavaScript
 * runs. (The row's divider is a scroll-linked DrawLine, not part of this.) The trigger is the row's frame reveal reaching
 * e = 0.7; where the reveal does not run, 35% visibility.
 */
export function MaskReveal({ children, slug, gateQuery, id, className = "" }: MaskRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const gate = useRevealGate(slug, gateQuery);
  const inView = useInView(ref, {
    threshold: reveal.visibleRatio,
    once: true,
    enabled: !gate.gated,
  });
  const shown = gate.gated ? gate.revealed : inView;

  return (
    <div ref={ref} id={id} className={className} data-reveal={shown ? "shown" : "hidden"}>
      {children}
    </div>
  );
}
