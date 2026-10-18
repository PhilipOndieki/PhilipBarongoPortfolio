"use client";

import { useRef, type CSSProperties } from "react";
import { Container } from "@/components/layout/Container";
import { HERO_NAME_ID, projectAnchorId } from "@/lib/anchors";
import { rise } from "@/lib/motion";
import type { HeroContent, Project, StripContent } from "@/types";
import { NotificationCard } from "./NotificationCard";
import { Strip } from "./Strip";

interface HeroProps {
  readonly content: HeroContent;
  readonly strip: StripContent;
  /** The project the preview card points to, if any. */
  readonly featured?: Project;
  readonly cardLabel: string;
  /** Placeholder line when the featured project has no media yet. */
  readonly placeholderLabel: string;
}

const delay = (position: number): CSSProperties => ({
  animationDelay: `${position * rise.stagger}ms`,
});

/**
 * The first screen. It fills the viewport (header space included), so the
 * project row always starts below the fold, and clips the hidden preview card.
 */
export function Hero({ content, strip, featured, cardLabel, placeholderLabel }: HeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={heroRef}
      className="relative min-h-svh overflow-clip pt-[calc(var(--header-h)+env(safe-area-inset-top))]"
    >
      <Container className="pt-[120px] md:pt-[clamp(140px,30vh,260px)]">
        <div className="grid grid-cols-1 gap-y-6 md:grid-cols-[var(--col-left)_minmax(0,1fr)]">
          <div className="animate-rise text-[15px] leading-[1.6]" style={delay(rise.order.intro)}>
            <p id={HERO_NAME_ID} className="text-fg">
              {content.name}
            </p>
            <p className="text-muted">{content.role}</p>
          </div>

          <div className="min-w-0">
            <h1
              className="animate-rise text-[26px] leading-[1.15] font-medium tracking-[-0.02em] text-fg md:text-[32px]"
              style={delay(rise.order.headline)}
            >
              {content.headline}
            </h1>
            <p
              className="animate-rise mt-[6px] text-[15px] leading-[1.6] text-muted"
              style={delay(rise.order.subtext)}
            >
              {content.subtext}
            </p>
            <Strip
              ref={stripRef}
              content={strip}
              className="animate-rise mt-[95px]"
              style={delay(rise.order.strip)}
            />
          </div>
        </div>
      </Container>

      {featured ? (
        <NotificationCard
          media={featured.media}
          name={featured.name}
          placeholderLabel={placeholderLabel}
          label={`${cardLabel}: ${featured.name}`}
          targetId={projectAnchorId(featured.slug)}
          heroRef={heroRef}
          stripRef={stripRef}
        />
      ) : null}
    </div>
  );
}
