"use client";

import { useSyncExternalStore } from "react";
import { chooseMediaSize } from "@/lib/media";
import type { MediaSize } from "@/types";

const noSubscribe = () => () => {};

/** The rendition chosen once on load; null during SSR and hydration. */
export function useMediaSize(): MediaSize | null {
  return useSyncExternalStore(noSubscribe, chooseMediaSize, () => null);
}
