"use client";

import { useEffect, useState, type RefObject } from "react";

export interface InViewOptions {
  readonly rootMargin?: string;
  readonly threshold?: number;
  /** Stop observing after the first time the element is in view. */
  readonly once?: boolean;
  readonly enabled?: boolean;
  /** Value before the observer reports. */
  readonly initial?: boolean;
}

/** Whether an element intersects the viewport, from one IntersectionObserver. */
export function useInView<T extends Element>(
  ref: RefObject<T | null>,
  {
    rootMargin = "0px",
    threshold = 0,
    once = false,
    enabled = true,
    initial = false,
  }: InViewOptions = {},
): boolean {
  const [inView, setInView] = useState(initial);

  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        // isIntersecting alone is true at any overlap; with a threshold, the
        // visible share must also reach it.
        const visible =
          entry.isIntersecting && (threshold === 0 || entry.intersectionRatio >= threshold - 0.001);
        setInView(visible);
        if (once && visible) observer.disconnect();
      },
      { rootMargin, threshold },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, rootMargin, threshold, once, enabled]);

  return inView;
}
