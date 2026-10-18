"use client";

import { useEffect, useState, type RefObject } from "react";

/** Top of `element` inside `container`, from layout offsets (transforms ignored). */
function offsetWithin(element: HTMLElement, container: HTMLElement): number {
  let top = 0;
  let node: HTMLElement | null = element;
  while (node && node !== container) {
    top += node.offsetTop;
    node = node.offsetParent instanceof HTMLElement ? node.offsetParent : null;
  }
  if (node === container) return top;
  return element.getBoundingClientRect().top - container.getBoundingClientRect().top;
}

/**
 * Free vertical space, in px, between the bottom of `fromRef` and the fold
 * (the bottom of `containerRef` or of the viewport at scroll 0, whichever is
 * higher). Null until measured. Re-measures when either element resizes.
 */
export function useFreeSpace(
  fromRef: RefObject<HTMLElement | null>,
  containerRef: RefObject<HTMLElement | null>,
): number | null {
  const [space, setSpace] = useState<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    const container = containerRef.current;
    if (!from || !container) return;

    const measure = () => {
      const containerTop = container.getBoundingClientRect().top + window.scrollY;
      const fold = Math.min(
        container.offsetHeight,
        document.documentElement.clientHeight - containerTop,
      );
      const fromBottom = offsetWithin(from, container) + from.offsetHeight;
      // Layout offsets are rounded to whole pixels; keep 1px so callers never overlap.
      setSpace(Math.floor(fold - fromBottom) - 1);
    };

    // ResizeObserver reports once on observe, so this also measures on mount.
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(from);
    return () => observer.disconnect();
  }, [fromRef, containerRef]);

  return space;
}
