"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { useScrollScheduler } from "@/hooks/useScrollScheduler";
import type { ScrollFrame } from "@/lib/scrollScheduler";
import { stageProgress, stageStore, type StageGeometry } from "@/lib/stageStore";
import { documentTop } from "@/lib/viewTransition";

interface WorkStackProps {
  /** The project stages (WorkRow), in order. */
  readonly children: ReactNode;
}

const STAGE_SELECTOR = ":scope > [data-stage]";

/**
 * Holds every project stage of both groups. Each stage is sticky under the
 * header, one viewport tall (less the header), and above the one before it,
 * so the next stage rises over the pinned one and replaces it. When the
 * container ends, the last stage scrolls away and the About section follows.
 *
 * Measured on mount, resize and font load, never in the scroll frame:
 * - a stage whose content is taller than the stage height is not sticky;
 * - each stage's document top, with sticky off, and its pin top.
 * The scroll frame then only marks which stages are fully covered.
 */
export function WorkStack({ children }: WorkStackProps) {
  const ref = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLDivElement>(null);
  const stagesRef = useRef<{ slug: string; geometry: StageGeometry }[]>([]);

  useEffect(() => {
    const container = ref.current;
    const probe = probeRef.current;
    if (!container || !probe) return;
    let destroyed = false;

    const measure = () => {
      if (destroyed) return;
      const stages = [...container.querySelectorAll<HTMLElement>(STAGE_SELECTOR)];
      // Reads: the pin top and stage height (the probe sits at the one and has
      // the other) and each stage's content height.
      const pinTop = probe.offsetTop;
      const stageHeight = probe.offsetHeight;
      const contentHeights = stages.map(
        (stage) => (stage.firstElementChild as HTMLElement | null)?.offsetHeight ?? 0,
      );
      // Writes: content taller than its stage scrolls normally.
      stages.forEach((stage, index) => {
        stage.toggleAttribute("data-static", (contentHeights[index] ?? 0) > stageHeight);
      });
      // Document tops in normal flow: sticky off for this read only (no paint
      // happens in between, and a static box takes the same space).
      container.setAttribute("data-measuring", "");
      const measured = stages.map((stage) => ({
        slug: stage.dataset.stage ?? "",
        geometry: { docTop: documentTop(stage), pinTop },
      }));
      container.removeAttribute("data-measuring");
      stagesRef.current = measured;
      stageStore.setGeometry(new Map(measured.map(({ slug, geometry }) => [slug, geometry])));
    };

    const observer = new ResizeObserver(measure);
    observer.observe(probe);
    observer.observe(container);
    container
      .querySelectorAll<HTMLElement>(STAGE_SELECTOR)
      .forEach((stage) => stage.firstElementChild && observer.observe(stage.firstElementChild));
    void document.fonts?.ready.then(measure);
    measure();

    return () => {
      destroyed = true;
      observer.disconnect();
    };
  }, []);

  // A stage is covered once the next one has pinned over it (its videos pause).
  const onFrame = useCallback(({ scrollY, viewportHeight }: ScrollFrame) => {
    const stages = stagesRef.current;
    stages.forEach(({ slug }, index) => {
      const next = stages[index + 1];
      stageStore.setCovered(
        slug,
        next ? stageProgress(next.geometry, scrollY, viewportHeight) >= 1 : false,
      );
    });
  }, []);
  useScrollScheduler(onFrame);

  return (
    <div ref={ref} className="work-stack">
      {children}
      <div ref={probeRef} aria-hidden="true" className="work-stage-probe" />
    </div>
  );
}
