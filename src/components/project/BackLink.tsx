"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import { BACK_LINK_ID } from "@/lib/anchors";
import { cameFromHome, goHome } from "@/lib/viewTransition";

interface BackLinkProps {
  readonly label: string;
  /** The project this page shows (the transition's shared element). */
  readonly slug: string;
}

/**
 * Back to the homepage. After a row click in this tab it goes back in
 * history, so the homepage returns at the row (with the reverse transition).
 * Otherwise it opens the homepage at the top.
 */
export function BackLink({ label, slug }: BackLinkProps) {
  const router = useRouter();

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    if (cameFromHome()) router.back();
    else goHome(slug, () => router.push("/"));
  };

  return (
    <Link
      id={BACK_LINK_ID}
      href="/"
      onClick={onClick}
      className="inline-flex h-11 min-w-11 touch-manipulation items-center gap-1.5 text-[15px] leading-none text-fg transition-opacity duration-200 hover:opacity-60"
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M11 6H1.5M5.5 2 1.5 6l4 4" />
      </svg>
      {label}
    </Link>
  );
}
