"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Renders the public footer everywhere except the private /admin pages. */
export function SiteFooterGate({ children }: { readonly children: ReactNode }) {
  const pathname = usePathname();
  return pathname.startsWith("/admin") ? null : children;
}
