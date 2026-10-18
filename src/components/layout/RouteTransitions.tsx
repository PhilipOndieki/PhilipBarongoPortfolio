"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  installPopstateRelay,
  resolveUnclaimedHomeTransition,
  restoreHomeScroll,
  setCurrentPath,
} from "@/lib/viewTransition";

/**
 * Lives in the root layout. It installs the popstate relay (before the App
 * Router's own listener, as a descendant effect runs first), tracks the
 * current path, and on the homepage makes sure scroll restoration and any
 * waiting transition complete even when no row frame claims them.
 */
export function RouteTransitions() {
  const pathname = usePathname();

  useEffect(() => installPopstateRelay(), []);

  useEffect(() => {
    setCurrentPath(pathname);
    if (pathname !== "/") return;
    // A row frame for the project claims the transition itself; this only
    // covers a return with no such frame. A task, not an animation frame:
    // none run while a transition waits.
    const id = window.setTimeout(() => {
      restoreHomeScroll();
      resolveUnclaimedHomeTransition();
    }, 0);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return null;
}
