"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { useRevealGate } from "@/hooks/useRevealGate";
import { openProject } from "@/lib/viewTransition";

interface ProjectLinkProps {
  readonly slug: string;
  readonly href: string;
  readonly children: ReactNode;
  readonly ariaLabel?: string;
  readonly className?: string;
  readonly style?: CSSProperties;
  /**
   * The row's media frame: where its reveal runs (null: never). While it
   * runs, the link is clickable only once the frame is at full size.
   */
  readonly gateQuery?: string | null;
}

/**
 * A link from the homepage row to its project page. A plain click opens the
 * page through a view transition; modified clicks (new tab, etc.) are left to
 * the browser.
 */
export function ProjectLink({
  slug,
  href,
  children,
  ariaLabel,
  className = "",
  style,
  gateQuery = null,
}: ProjectLinkProps) {
  const router = useRouter();
  const { fullSize } = useRevealGate(slug, gateQuery);
  const inert = !fullSize;

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    openProject(slug, () => router.push(href));
  };

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      onClick={onClick}
      className={`cursor-pointer touch-manipulation ${className}`}
      style={inert ? { ...style, pointerEvents: "none" } : style}
    >
      {children}
    </Link>
  );
}
