"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import { MediaPlaceholder } from "@/components/media/MediaPlaceholder";
import { Poster } from "@/components/media/Poster";
import { useFreeSpace } from "@/hooks/useFreeSpace";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { MEDIA_ASPECT } from "@/lib/media";
import { morphStore } from "@/lib/morphStore";
import {
  cardEnterKeyframes,
  cardHiddenTransform,
  MQ,
  notificationCard as card,
} from "@/lib/motion";
import type { ProjectMedia } from "@/types";

interface NotificationCardProps {
  /** The featured project's media (its cover only, never video), or null for the placeholder. */
  readonly media: ProjectMedia | null;
  readonly name: string;
  readonly placeholderLabel: string;
  readonly label: string;
  /** Id of the project row the card scrolls to. */
  readonly targetId: string;
  readonly heroRef: RefObject<HTMLElement | null>;
  readonly stripRef: RefObject<HTMLElement | null>;
}

/** The card is small: the two smaller covers are enough. */
const CARD_COVER_WIDTHS = ["720", "1280"] as const;

interface Size {
  readonly width: number;
  readonly height: number;
}

type HoldReason = "hover" | "focus";

interface CardCycle {
  pause(): void;
  resume(): void;
  holdStart(reason: HoldReason): void;
  holdEnd(reason: HoldReason): void;
  destroy(): void;
}

/** The preferred size if it fits under the strip, a smaller one, or null for no card. */
function fitCardSize(freeSpace: number, preferred: Size): Size | null {
  const room = freeSpace - card.bottomOffset - card.stripGap;
  if (room >= preferred.height) return preferred;
  if (room < card.size.min.height) return null;
  // Shrink at the media aspect, so the card stays a small copy of the frame.
  const height = Math.floor(room);
  return { width: Math.max(card.size.min.width, height * MEDIA_ASPECT), height };
}

/** Current translateY of an element, in px. */
function readTranslateY(element: HTMLElement): number {
  const transform = getComputedStyle(element).transform;
  return transform === "none" ? 0 : new DOMMatrixReadOnly(transform).m42;
}

/**
 * The enter / hold / exit / pause loop, driven by the Web Animations API on
 * transform only. Every move starts from the card's current transform, so a
 * change of plan never snaps. The timer pauses with the tab.
 */
function createCardCycle(
  element: HTMLElement,
  cycles: { count: number },
  onDone: () => void,
): CardCycle {
  type Phase = "waiting" | "entering" | "holding" | "exiting" | "done";
  let phase: Phase = "waiting";
  let paused = false;
  let animation: Animation | null = null;
  let timer: number | undefined;
  let timerTask: (() => void) | null = null;
  let timerRemaining = 0;
  let timerDue = 0;
  const holds = new Set<HoldReason>();

  const setShown = (shown: boolean) => {
    element.inert = !shown;
    if (shown) element.removeAttribute("aria-hidden");
    else element.setAttribute("aria-hidden", "true");
  };

  const startTimer = () => {
    if (!timerTask || paused) return;
    const task = timerTask;
    timerDue = performance.now() + timerRemaining;
    timer = window.setTimeout(() => {
      timer = undefined;
      timerTask = null;
      task();
    }, timerRemaining);
  };

  const clearTimer = () => {
    window.clearTimeout(timer);
    timer = undefined;
    timerTask = null;
  };

  const schedule = (task: () => void, delay: number) => {
    clearTimer();
    timerTask = task;
    timerRemaining = Math.max(0, delay);
    startTimer();
  };

  const animate = (keyframes: Keyframe[], options: KeyframeAnimationOptions, then: () => void) => {
    animation?.cancel();
    const current = element.animate(keyframes, { ...options, fill: "forwards" });
    animation = current;
    if (paused) current.pause();
    current.finished
      .then(() => {
        if (animation !== current) return;
        current.commitStyles();
        current.cancel();
        animation = null;
        then();
      })
      .catch(() => {
        // Cancelled by a newer move.
      });
  };

  const fromCurrent = (to: string): Keyframe[] => [
    { transform: getComputedStyle(element).transform },
    { transform: to },
  ];

  const finish = () => {
    phase = "done";
    clearTimer();
    onDone();
  };

  const exit = () => {
    phase = "exiting";
    animate(
      fromCurrent(cardHiddenTransform),
      { duration: card.exit.duration, easing: card.exit.easing },
      () => {
        setShown(false);
        if (cycles.count >= card.maxCycles) {
          finish();
          return;
        }
        phase = "waiting";
        schedule(enter, card.pause);
      },
    );
  };

  const hold = () => {
    phase = "holding";
    if (holds.size === 0) schedule(exit, card.hold);
  };

  function enter() {
    cycles.count += 1;
    phase = "entering";
    setShown(true);
    animate(
      cardEnterKeyframes(window.matchMedia(MQ.desktop).matches),
      { duration: card.enter.duration },
      hold,
    );
  }

  schedule(enter, card.startDelay - performance.now());

  return {
    pause() {
      if (paused) return;
      paused = true;
      if (timer !== undefined) {
        window.clearTimeout(timer);
        timer = undefined;
        timerRemaining = Math.max(0, timerDue - performance.now());
      }
      animation?.pause();
    },
    resume() {
      if (!paused) return;
      paused = false;
      startTimer();
      animation?.play();
    },
    holdStart(reason) {
      holds.add(reason);
      if (phase === "holding") clearTimer();
      if (phase === "exiting") {
        phase = "entering";
        animate(
          fromCurrent("translateY(0)"),
          { duration: card.exit.duration, easing: card.returnEasing },
          hold,
        );
      }
    },
    holdEnd(reason) {
      holds.delete(reason);
      if (holds.size === 0 && phase === "holding") schedule(exit, card.hoverResumeDelay);
    },
    destroy() {
      clearTimer();
      animation?.cancel();
      animation = null;
    },
  };
}

/**
 * A small preview of the featured project: the same object as the project
 * frame, at the card's size. It hides below the fold, bounces up under the
 * strip, holds, then drops away, up to 10 times. It publishes its rest rect to
 * the morph store; on the first scroll the frame takes its place and the card
 * is retired for this page view. A click scrolls to the project row.
 */
export function NotificationCard({
  media,
  name,
  placeholderLabel,
  label,
  targetId,
  heroRef,
  stripRef,
}: NotificationCardProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const cycleRef = useRef<CardCycle | null>(null);
  const cyclesRef = useRef({ count: 0 });
  const [finished, setFinished] = useState(false);

  const retired = useSyncExternalStore(morphStore.subscribe, morphStore.isRetired, () => false);
  const morphCapable = useMediaQuery(MQ.morph);
  const desktop = useMediaQuery(MQ.desktop);
  const finePointer = useMediaQuery(MQ.finePointer);
  const pageVisible = usePageVisibility();
  const freeSpace = useFreeSpace(stripRef, heroRef);

  const size =
    freeSpace === null
      ? null
      : fitCardSize(freeSpace, desktop ? card.size.desktop : card.size.mobile);
  // Rendered (and measurable) whenever it fits; it cycles only until retired.
  const present = morphCapable && size !== null;
  const cycling = present && !finished && !retired;

  // Publish the rest rect and a handle for the takeover. Measured on mount and
  // resize, never inside a scroll frame.
  useEffect(() => {
    const element = buttonRef.current;
    const hero = heroRef.current;
    if (!present || !element || !hero) return;

    const retire = () => {
      element.style.visibility = "hidden";
      element.inert = true;
      element.setAttribute("aria-hidden", "true");
      cycleRef.current?.destroy();
      cycleRef.current = null;
    };

    const measure = () => {
      const box = element.getBoundingClientRect();
      morphStore.setCard({
        rect: {
          left: box.left + window.scrollX,
          top: box.top - readTranslateY(element) + window.scrollY,
          width: box.width,
          height: box.height,
        },
        readOffset: () => readTranslateY(element),
        retire,
      });
    };

    const observer = new ResizeObserver(measure);
    observer.observe(hero);
    observer.observe(element);
    return () => {
      observer.disconnect();
      morphStore.setCard(null);
    };
  }, [present, heroRef]);

  useEffect(() => {
    const element = buttonRef.current;
    if (!cycling || !element) return;
    const cycle = createCardCycle(element, cyclesRef.current, () => setFinished(true));
    cycleRef.current = cycle;
    return () => {
      cycle.destroy();
      cycleRef.current = null;
    };
  }, [cycling]);

  useEffect(() => {
    if (pageVisible) cycleRef.current?.resume();
    else cycleRef.current?.pause();
  }, [pageVisible, cycling]);

  // The smooth scroll itself hands the card over to the frame.
  const scrollToProject = () => {
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!present) return null;

  return (
    <button
      ref={buttonRef}
      type="button"
      data-align={card.align}
      aria-label={label}
      aria-hidden="true"
      inert
      onClick={scrollToProject}
      onPointerEnter={finePointer ? () => cycleRef.current?.holdStart("hover") : undefined}
      onPointerLeave={finePointer ? () => cycleRef.current?.holdEnd("hover") : undefined}
      onFocus={() => cycleRef.current?.holdStart("focus")}
      onBlur={() => cycleRef.current?.holdEnd("focus")}
      className="notification-card absolute block cursor-pointer touch-manipulation overflow-hidden bg-tile"
      style={{
        width: size.width,
        height: size.height,
        bottom: card.bottomOffset,
        transform: cardHiddenTransform,
        visibility: retired ? "hidden" : undefined,
      }}
    >
      {media ? (
        <Poster
          media={media}
          widths={CARD_COVER_WIDTHS}
          sizes={`${card.size.desktop.width}px`}
          loading="eager"
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <MediaPlaceholder name={name} label={placeholderLabel} />
      )}
      <span aria-hidden="true" className="card-border" />
    </button>
  );
}
