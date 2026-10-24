"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Monogram } from "@/components/hero/Monogram";
import { TypingText } from "@/components/motion/TypingText";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { HERO_NAME_ID } from "@/lib/anchors";
import { typing } from "@/lib/motion";
import type { HeaderContent } from "@/types";
import { Container } from "./Container";

interface HeaderProps {
  readonly content: HeaderContent;
  /** Id of the element whose passing under the header types the name in. */
  readonly triggerId?: string;
}

/** Minimum space between the typed name and the links on the right. */
const NAME_GAP = 16;

export function Header({ content, triggerId = HERO_NAME_ID }: HeaderProps) {
  const headerRef = useRef<HTMLElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const fullNameRef = useRef<HTMLSpanElement>(null);

  const [headerHeight, setHeaderHeight] = useState(0);
  const [fitsFullName, setFitsFullName] = useState(false);
  const [pastHeroName, setPastHeroName] = useState(false);
  const [nameEmpty, setNameEmpty] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const reducedMotion = useReducedMotion();

  // Show "Admin" only to the signed-in admin. Visitors without a Supabase
  // session cookie never call the server.
  useEffect(() => {
    if (!document.cookie.split("; ").some((c) => c.startsWith("sb-"))) return;
    let live = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => (res.ok ? (res.json() as Promise<{ admin?: boolean }>) : null))
      .then((json) => {
        if (live && json?.admin) setIsAdmin(true);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  // Measure the header, and whether the full name fits beside the links.
  useEffect(() => {
    const header = headerRef.current;
    const row = rowRef.current;
    const actions = actionsRef.current;
    const fullName = fullNameRef.current;
    if (!header || !row || !actions || !fullName) return;

    const measure = () => {
      const available =
        actions.getBoundingClientRect().left - row.getBoundingClientRect().left - NAME_GAP;
      setHeaderHeight(header.offsetHeight);
      setFitsFullName(fullName.offsetWidth <= available);
    };

    const observer = new ResizeObserver(measure);
    observer.observe(header);
    observer.observe(row);
    observer.observe(actions);
    return () => observer.disconnect();
  }, []);

  // The name types in once the hero name has passed under the header.
  useEffect(() => {
    const trigger = document.getElementById(triggerId);
    if (!trigger || headerHeight === 0) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        const rootTop = entry.rootBounds?.top ?? headerHeight;
        setPastHeroName(!entry.isIntersecting && entry.boundingClientRect.top < rootTop);
      },
      { rootMargin: `-${headerHeight}px 0px 0px 0px` },
    );
    observer.observe(trigger);
    return () => observer.disconnect();
  }, [headerHeight, triggerId]);

  const showMonogram = !pastHeroName && nameEmpty;

  return (
    <header
      ref={headerRef}
      className="fixed inset-x-0 top-0 z-50 bg-ink pt-[env(safe-area-inset-top)]"
    >
      <Container>
        <div
          ref={rowRef}
          className="flex h-[var(--header-h)] items-center justify-between border-b border-divider"
        >
          <Link
            href="/"
            aria-label={content.homeLabel}
            className="relative inline-flex h-11 min-w-11 touch-manipulation items-center text-[15px] text-fg"
          >
            <span
              className="monogram-fade absolute top-1/2 left-0 -translate-y-1/2"
              style={{ opacity: showMonogram ? 1 : 0 }}
            >
              <Monogram />
            </span>
            <TypingText
              text={fitsFullName ? content.headerName : content.headerNameShort}
              active={pastHeroName}
              startDelay={typing.monogramFade}
              instant={reducedMotion}
              onEmptyChange={setNameEmpty}
            />
            {/* Measures the full name for the fit check. */}
            <span
              ref={fullNameRef}
              aria-hidden="true"
              className="pointer-events-none invisible absolute top-0 left-0 whitespace-nowrap"
            >
              {content.headerName}
            </span>
          </Link>
          <div ref={actionsRef} className="-mr-3 flex items-center">
            {isAdmin && (
              <Link
                href="/admin/leads"
                className="inline-flex h-11 touch-manipulation items-center px-3 text-[15px] leading-none text-fg transition-opacity duration-200 hover:opacity-60"
              >
                Admin
              </Link>
            )}
            <a
              href={content.contact.href}
              data-track="contact"
              className="inline-flex h-11 touch-manipulation items-center px-3 text-[15px] leading-none text-fg transition-opacity duration-200 hover:opacity-60"
            >
              {content.contact.label}
            </a>
          </div>
        </div>
      </Container>
    </header>
  );
}
