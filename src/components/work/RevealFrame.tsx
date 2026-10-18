"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { useIncomingTransition } from "@/hooks/useIncomingTransition";
import { useInView } from "@/hooks/useInView";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useScrollScheduler } from "@/hooks/useScrollScheduler";
import { MEDIA_ANCHOR_ATTR, PROJECT_MEDIA_ATTR } from "@/lib/anchors";
import { MQ, reveals, scrollEasings } from "@/lib/motion";
import { revealEffects, type RevealEffect, type RevealTargets } from "@/lib/reveals";
import { revealStore } from "@/lib/revealStore";
import type { ScrollFrame } from "@/lib/scrollScheduler";
import { stageProgress, stageStore } from "@/lib/stageStore";
import type { FrameRevealName } from "@/types";

interface RevealFrameProps {
  readonly slug: string;
  readonly reveal: FrameRevealName;
  readonly children: ReactNode;
  readonly className?: string;
}

interface RevealController {
  onFrame(frame: ScrollFrame): void;
  /** Measure and apply the current scroll at once. */
  syncNow(): void;
  destroy(): void;
}

/**
 * The engine: turns the stage's hand-over progress (from the stage geometry
 * WorkStack measures, so the scroll frame reads no layout) into eased
 * progress and hands it to the row's effect. It also publishes the row's text
 * and full-size gates.
 */
function createReveal(
  slug: string,
  targets: RevealTargets,
  effect: RevealEffect,
): RevealController {
  const desktop = window.matchMedia(MQ.desktop);
  let lastFrame: ScrollFrame | null = null;
  // Pinned stages stay in view: skip frames whose progress has not changed.
  let lastEased = -1;

  effect.setup(targets);

  const apply = (scrollY: number, viewportHeight: number) => {
    const geometry = stageStore.get(slug);
    if (!geometry) return;
    const eased = scrollEasings[reveals.easing](stageProgress(geometry, scrollY, viewportHeight));
    if (eased === lastEased) return;
    lastEased = eased;
    effect.apply(targets, eased, { mobile: !desktop.matches });
    if (eased >= reveals.textRevealAt) revealStore.markRevealed(slug);
    const fullSize = eased >= reveals.videoActiveAt;
    revealStore.setFullSize(slug, fullSize);
    const state = fullSize ? "full" : "partial";
    if (targets.frame.dataset.morph !== state) targets.frame.dataset.morph = state;
  };

  const sync = () => {
    lastEased = -1;
    if (lastFrame) apply(lastFrame.scrollY, lastFrame.viewportHeight);
    else apply(window.scrollY, document.documentElement.clientHeight);
  };

  // New geometry (mount, resize, fonts) or a breakpoint change: apply afresh.
  const unsubscribe = stageStore.subscribeGeometry(sync);
  desktop.addEventListener("change", sync);
  sync();

  return {
    onFrame(next) {
      lastFrame = next;
      apply(next.scrollY, next.viewportHeight);
    },
    syncNow() {
      lastFrame = null;
      sync();
    },
    destroy() {
      unsubscribe();
      desktop.removeEventListener("change", sync);
      effect.reset(targets);
      delete targets.frame.dataset.morph;
      targets.frame.style.willChange = "";
    },
  };
}

/**
 * A project row's media frame with its own scroll reveal (from the registry).
 * The anchor keeps the full layout size, so the row height never changes.
 * Reduced motion skips the effect: the frame shows at its final state.
 */
export function RevealFrame({ slug, reveal, children, className = "" }: RevealFrameProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<RevealController | null>(null);
  const motionOK = useMediaQuery(MQ.motionOK);
  const near = useInView(anchorRef, { rootMargin: `${reveals.subscribeMargin}px` });

  useEffect(() => {
    const anchor = anchorRef.current;
    const frame = frameRef.current;
    const media = mediaRef.current;
    if (!motionOK || !anchor || !frame || !media) return;
    const controller = createReveal(slug, { anchor, frame, media }, revealEffects[reveal]);
    controllerRef.current = controller;
    return () => {
      controller.destroy();
      controllerRef.current = null;
    };
  }, [motionOK, reveal, slug]);

  // Sync when the row comes near: rows below the first screen skip rendering
  // (content-visibility) until then.
  useEffect(() => {
    const frame = frameRef.current;
    if (!near || !frame) return;
    controllerRef.current?.syncNow();
    frame.style.willChange = "transform, clip-path, opacity";
    return () => {
      frame.style.willChange = "";
    };
  }, [near]);

  const onFrame = useCallback((frame: ScrollFrame) => controllerRef.current?.onFrame(frame), []);
  useScrollScheduler(onFrame, motionOK && near);

  useIncomingTransition(slug, frameRef, () => controllerRef.current?.syncNow());

  return (
    <div
      ref={anchorRef}
      className={`reveal-anchor ${className}`}
      data-reveal-effect={reveal}
      {...{ [MEDIA_ANCHOR_ATTR]: "" }}
    >
      <div
        ref={frameRef}
        className="reveal-frame"
        data-reveal-frame=""
        {...{ [PROJECT_MEDIA_ATTR]: slug }}
      >
        <div ref={mediaRef} className="reveal-media">
          {children}
        </div>
      </div>
    </div>
  );
}
