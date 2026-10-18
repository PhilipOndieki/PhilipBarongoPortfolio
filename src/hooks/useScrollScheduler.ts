"use client";

import { useEffect, useRef } from "react";
import { subscribeToScroll, type ScrollSubscriber } from "@/lib/scrollScheduler";

/** Runs `callback` once per animation frame while the page scrolls and `enabled` is true. */
export function useScrollScheduler(callback: ScrollSubscriber, enabled = true): void {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;
    return subscribeToScroll((frame) => callbackRef.current(frame));
  }, [enabled]);
}
