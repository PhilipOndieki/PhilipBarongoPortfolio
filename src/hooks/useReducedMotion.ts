"use client";

import { MQ } from "@/lib/motion";
import { useMediaQuery } from "./useMediaQuery";

/** True when the user asks the system for reduced motion. */
export function useReducedMotion(): boolean {
  return useMediaQuery(MQ.reducedMotion);
}
