"use client";

import { useEffect, useRef } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { registerDrawLine } from "@/lib/drawLines";
import { MQ } from "@/lib/motion";

interface DrawLineProps {
  /**
   * Position in a split divider (0 for the left segment). Segment n starts
   * n * drawLine.splitOffset later, so the segments read as one stroke.
   */
  readonly segment?: number;
  /** Where that offset applies (where the segments sit side by side). Everywhere by default. */
  readonly segmentQuery?: string | null;
  readonly className?: string;
}

/**
 * A 1px divider that draws from left to right as it scrolls into view and
 * un-draws on the way back (scaleX, transform only). The scroll work lives in
 * src/lib/drawLines.ts. With reduced motion, or without JavaScript, the line
 * is fully drawn. A <div> with aria-hidden, so screen readers skip it.
 */
export function DrawLine({ segment = 0, segmentQuery = null, className = "" }: DrawLineProps) {
  const ref = useRef<HTMLDivElement>(null);
  const motionOK = useMediaQuery(MQ.motionOK);

  useEffect(() => {
    const element = ref.current;
    if (!motionOK || !element) return;
    return registerDrawLine(element, { segment, segmentQuery });
  }, [motionOK, segment, segmentQuery]);

  return <div ref={ref} aria-hidden="true" className={`draw-line ${className}`} />;
}
