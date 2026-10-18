"use client";

import { useEffect, useRef, type RefObject } from "react";
import {
  afterRouteTransition,
  clearSharedElement,
  incomingTransition,
  isFrameAtFullSize,
  isReturningHome,
  nameSharedElement,
  resolveRouteTransition,
  restoreHomeScroll,
} from "@/lib/viewTransition";

/**
 * A homepage row frame coming back from its project page: one task after
 * mount (so the router's own traversal handling has run), put the page back at
 * the row, bring the frame to its state for that scroll (`sync`), and hand it
 * to the waiting transition if it is at full size. A task, not an animation
 * frame: while a view transition waits for the new page, none run.
 */
export function useIncomingTransition(
  slug: string,
  frameRef: RefObject<HTMLElement | null>,
  sync: () => void,
): void {
  const syncRef = useRef(sync);

  useEffect(() => {
    syncRef.current = sync;
  });

  useEffect(() => {
    const frame = frameRef.current;
    const incoming = incomingTransition();
    const target = incoming?.direction === "toHome" && incoming.slug === slug;
    if (!frame || (!target && !isReturningHome())) return;
    // A deferred row (content-visibility: auto) may still be skipped when the
    // new page is captured: render it for the length of the transition.
    const row = target ? frame.closest<HTMLElement>(".work-row-deferred") : null;
    if (row) row.style.contentVisibility = "visible";
    const release = () => row?.style.removeProperty("content-visibility");
    const id = window.setTimeout(() => {
      restoreHomeScroll();
      syncRef.current();
      if (!target) return;
      if (isFrameAtFullSize(frame)) nameSharedElement(frame, slug);
      afterRouteTransition(() => {
        clearSharedElement(frame);
        release();
      });
      resolveRouteTransition("toHome");
    }, 0);
    return () => {
      window.clearTimeout(id);
      release();
    };
  }, [slug, frameRef]);
}
