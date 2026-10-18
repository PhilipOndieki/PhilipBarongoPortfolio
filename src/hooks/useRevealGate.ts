"use client";

import { useCallback, useSyncExternalStore } from "react";
import { revealStore } from "@/lib/revealStore";
import { useMediaQuery } from "./useMediaQuery";

export interface RevealGate {
  /** The row's reveal is running, so its text, link and video wait for it. */
  readonly gated: boolean;
  /** Text and divider may show (e >= 0.7), or the row is not gated. */
  readonly revealed: boolean;
  /** Link and video are active (e >= 0.98), or the row is not gated. */
  readonly fullSize: boolean;
}

/**
 * A row's reveal gates. `motionQuery` is where its reveal runs (null: never
 * gated); outside it, the frame is static and everything is active.
 */
export function useRevealGate(slug: string, motionQuery: string | null): RevealGate {
  const runs = useMediaQuery(motionQuery ?? "not all");
  const revealedSnapshot = useCallback(() => revealStore.isRevealed(slug), [slug]);
  const fullSizeSnapshot = useCallback(() => revealStore.isFullSize(slug), [slug]);
  const revealed = useSyncExternalStore(revealStore.subscribe, revealedSnapshot, () => false);
  const fullSize = useSyncExternalStore(revealStore.subscribe, fullSizeSnapshot, () => false);
  const gated = motionQuery !== null && runs;
  return { gated, revealed: !gated || revealed, fullSize: !gated || fullSize };
}
