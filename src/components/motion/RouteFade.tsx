"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { consumeFallbackFade } from "@/lib/viewTransition";

interface RouteFadeProps {
  readonly children: ReactNode;
  readonly className?: string;
}

/**
 * The page's <main>. When it was reached by a fallback navigation (no view
 * transitions, or reduced motion), it fades in once.
 */
export function RouteFade({ children, className = "" }: RouteFadeProps) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (consumeFallbackFade()) ref.current?.classList.add("route-fade-in");
  }, []);

  return (
    <main ref={ref} className={className}>
      {children}
    </main>
  );
}
