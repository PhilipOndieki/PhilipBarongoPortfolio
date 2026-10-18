"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useIncomingTransition } from "@/hooks/useIncomingTransition";
import { useScrollScheduler } from "@/hooks/useScrollScheduler";
import { MEDIA_ANCHOR_ATTR, PROJECT_MEDIA_ATTR } from "@/lib/anchors";
import { MEDIA_ASPECT } from "@/lib/media";
import { morphStore, type DocRect } from "@/lib/morphStore";
import { cardMorph, clamp01, MQ, notificationCard, scrollEasings } from "@/lib/motion";
import type { ScrollFrame } from "@/lib/scrollScheduler";
import { revealStore } from "@/lib/revealStore";
import { stageStore } from "@/lib/stageStore";

interface CardMorphProps {
  readonly children: ReactNode;
  /** The project this frame shows (shared-element transition target). */
  readonly slug: string;
  /** Only the featured project morphs from the card. Others are a static frame. */
  readonly enabled: boolean;
  readonly className?: string;
}

interface MorphController {
  onFrame(frame: ScrollFrame): void;
  /** Measure and apply the current scroll at once, as a first frame (no rise). */
  syncNow(): void;
  destroy(): void;
}

interface LiftTiming {
  readonly duration: number;
  readonly easing: string;
}

const lerp = (from: number, to: number, t: number): number => from + (to - from) * t;

const toDocRect = (rect: DOMRect): DocRect => ({
  left: rect.left + window.scrollX,
  top: rect.top + window.scrollY,
  width: rect.width,
  height: rect.height,
});

/** Card-sized start rect when the card is not on this screen: right-aligned, top at the fold. */
function fallbackCardRect(final: DocRect): DocRect {
  const { width } = window.matchMedia(MQ.desktop).matches
    ? notificationCard.size.desktop
    : notificationCard.size.mobile;
  return {
    left: final.left + final.width - width,
    top: document.documentElement.clientHeight,
    width,
    height: width / MEDIA_ASPECT,
  };
}

/**
 * FLIP from the card's rest rect to the frame's own layout rect. Both rects are
 * in document coordinates, measured outside the scroll frame (mount, resize,
 * fonts, card updates, stage geometry). The frame's rect is taken in normal
 * flow (its stage's document top plus its place in the stage), so a pinned
 * stage never skews it. The morph ends (e = 1) as the stage pins under the
 * header. The scroll frame only does arithmetic and style writes.
 */
function createMorph(
  slug: string,
  anchor: HTMLElement,
  lift: HTMLElement,
  frame: HTMLElement,
): MorphController {
  let final: DocRect | null = null;
  let cardRect: DocRect | null = null;
  let start = { scale: 1, dx: 0, dy: 0 };
  let dropOffset = 0;
  let shown = false;
  let firstFrame = true;
  let lastFrame: ScrollFrame | null = null;
  let destroyed = false;

  // The lift wrapper carries the handoff rise and the drop-out, so the FLIP
  // transform on the frame stays pure.
  let liftAnimation: Animation | null = null;
  let liftFrom = 0;
  let liftTo = 0;
  let liftOffset = 0;

  const setLift = (offset: number) => {
    liftOffset = offset;
    lift.style.transform = offset ? `translateY(${offset}px)` : "";
  };

  const currentLift = (): number => {
    if (!liftAnimation) return liftOffset;
    const progress = liftAnimation.effect?.getComputedTiming().progress;
    return progress === null || progress === undefined ? liftTo : lerp(liftFrom, liftTo, progress);
  };

  const moveLift = (to: number, timing: LiftTiming, done?: () => void) => {
    const from = currentLift();
    liftAnimation?.cancel();
    liftAnimation = null;
    if (Math.abs(from - to) < 0.5) {
      setLift(to);
      done?.();
      return;
    }
    const animation = lift.animate(
      [{ transform: `translateY(${from}px)` }, { transform: `translateY(${to}px)` }],
      { duration: timing.duration, easing: timing.easing, fill: "forwards" },
    );
    liftAnimation = animation;
    liftFrom = from;
    liftTo = to;
    animation.finished
      .then(() => {
        if (liftAnimation !== animation) return;
        setLift(to);
        animation.cancel();
        liftAnimation = null;
        done?.();
      })
      .catch(() => {
        // Replaced by a newer move.
      });
  };

  const apply = (scrollY: number) => {
    const stage = stageStore.get(slug);
    if (!final || !stage) return;
    const end = stage.docTop - stage.pinTop;
    const eased = scrollEasings[cardMorph.easing](end > 0 ? clamp01(scrollY / end) : 1);
    const scale = start.scale + (1 - start.scale) * eased;
    const dx = start.dx * (1 - eased);
    const dy = start.dy * (1 - eased);
    frame.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(${scale})`;
    frame.style.setProperty("--morph-s", String(scale));
    frame.style.setProperty(
      "--morph-r",
      `${lerp(cardMorph.startRadius, cardMorph.endRadius, eased) / scale}px`,
    );
    frame.style.setProperty("--morph-border-opacity", String(1 - eased));
    if (eased >= cardMorph.textRevealAt) revealStore.markRevealed(slug);
    const fullSize = eased >= cardMorph.videoActiveAt;
    revealStore.setFullSize(slug, fullSize);
    const state = fullSize ? "full" : "partial";
    if (frame.dataset.morph !== state) frame.dataset.morph = state;
  };

  const computeStart = () => {
    if (!final) return;
    cardRect = morphStore.getCard()?.rect ?? fallbackCardRect(final);
    start = {
      scale: cardRect.width / final.width,
      dx: cardRect.left - final.left,
      dy: cardRect.top - final.top,
    };
    dropOffset = cardRect.height + notificationCard.bottomOffset;
  };

  const reapply = () => apply(lastFrame ? lastFrame.scrollY : window.scrollY);

  const measure = () => {
    if (destroyed) return;
    const box = anchor.getBoundingClientRect();
    const stageElement = anchor.closest<HTMLElement>("[data-stage]");
    const stage = stageStore.get(slug);
    // In normal flow: the stage's document top plus the frame's place in it.
    final =
      stageElement && stage
        ? {
            ...toDocRect(box),
            top: stage.docTop + box.top - stageElement.getBoundingClientRect().top,
          }
        : toDocRect(box);
    morphStore.setFinalRect(final);
    computeStart();
    reapply();
  };

  const show = (animate: boolean) => {
    shown = true;
    // First takeover: start exactly where the card is, mid-bounce or not.
    let from = dropOffset;
    if (!morphStore.isRetired()) from = morphStore.retireCard() ?? dropOffset;
    frame.style.willChange = "transform";
    lift.style.visibility = "visible";
    if (!animate) {
      liftAnimation?.cancel();
      liftAnimation = null;
      setLift(0);
      return;
    }
    if (!liftAnimation) setLift(from);
    moveLift(0, cardMorph.rise);
  };

  const hide = () => {
    shown = false;
    moveLift(dropOffset, cardMorph.drop, () => {
      if (shown) return;
      lift.style.visibility = "";
      frame.style.willChange = "";
    });
  };

  const observer = new ResizeObserver(measure);
  observer.observe(anchor);
  observer.observe(document.body);
  void document.fonts?.ready.then(measure);

  const unsubscribeStage = stageStore.subscribeGeometry(measure);

  let knownCardRect = morphStore.getCard()?.rect;
  const unsubscribe = morphStore.subscribe(() => {
    const rect = morphStore.getCard()?.rect;
    if (rect === knownCardRect) return;
    knownCardRect = rect;
    computeStart();
    reapply();
  });

  const onFrame = (next: ScrollFrame) => {
    lastFrame = next;
    const wantShown = next.scrollY > cardMorph.handoffScrollY;
    if (wantShown && !shown) show(!firstFrame);
    else if (!wantShown && shown) hide();
    firstFrame = false;
    apply(next.scrollY);
  };

  return {
    onFrame,
    syncNow() {
      measure();
      firstFrame = true;
      onFrame({ scrollY: window.scrollY, viewportHeight: document.documentElement.clientHeight });
    },
    destroy() {
      destroyed = true;
      observer.disconnect();
      unsubscribe();
      unsubscribeStage();
      liftAnimation?.cancel();
      liftAnimation = null;
      lift.style.transform = "";
      lift.style.visibility = "";
      frame.style.transform = "";
      frame.style.willChange = "";
      frame.style.removeProperty("--morph-s");
      frame.style.removeProperty("--morph-r");
      frame.style.removeProperty("--morph-border-opacity");
      delete frame.dataset.morph;
    },
  };
}

/**
 * The project frame, as the same object as the preview card. At the top of
 * the page it is hidden and the card shows. On the first scroll it takes the
 * card's place (same spot, size, crop, radius and border), then grows and
 * travels into the row over 75% of a viewport height. Scrolling back reverses
 * it, and at the top it drops out. Without the morph it is a static frame.
 */
export function CardMorph({ children, slug, enabled, className = "" }: CardMorphProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const liftRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<MorphController | null>(null);
  const morphCapable = useMediaQuery(MQ.morph);
  const active = enabled && morphCapable;

  useEffect(() => {
    const anchor = anchorRef.current;
    const lift = liftRef.current;
    const frame = frameRef.current;
    if (!active || !anchor || !lift || !frame) return;
    const controller = createMorph(slug, anchor, lift, frame);
    controllerRef.current = controller;
    return () => {
      controller.destroy();
      controllerRef.current = null;
    };
  }, [active, slug]);

  const onFrame = useCallback((frame: ScrollFrame) => controllerRef.current?.onFrame(frame), []);
  useScrollScheduler(onFrame, active);

  useIncomingTransition(slug, frameRef, () => controllerRef.current?.syncNow());

  return (
    <div
      ref={anchorRef}
      className={`morph-anchor ${className}`}
      data-morph={enabled ? "" : undefined}
      {...{ [MEDIA_ANCHOR_ATTR]: "" }}
    >
      <div ref={liftRef} className="morph-lift">
        <div ref={frameRef} className="morph-frame" {...{ [PROJECT_MEDIA_ATTR]: slug }}>
          {children}
          <span aria-hidden="true" className="morph-border" />
        </div>
      </div>
    </div>
  );
}
