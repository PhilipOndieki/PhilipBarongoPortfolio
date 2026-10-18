import { clamp01, drawLine, scrollEasings } from "./motion";
import { subscribeToScroll, type ScrollFrame } from "./scrollScheduler";
import { stageStore } from "./stageStore";
import { documentTop } from "./viewTransition";

export interface DrawLineOptions {
  /** Position in a split divider: segment n starts n * splitOffset later. */
  readonly segment: number;
  /** Where the segment offset applies (segments side by side), or null for everywhere. */
  readonly segmentQuery: string | null;
}

interface Line {
  readonly element: HTMLElement;
  readonly options: DrawLineOptions;
  /** Document top, measured outside the scroll frame. */
  top: number;
  delay: number;
  /** Not displayed (e.g. the right segment on mobile): nothing to draw. */
  hidden: boolean;
  /** Null until the first intersection report. */
  near: boolean | null;
  unsubscribe: (() => void) | null;
  /** Last scale written, so unchanged frames write nothing. */
  drawn: number;
}

const lines = new Map<HTMLElement, Line>();
let nearObserver: IntersectionObserver | null = null;
let sizeObserver: ResizeObserver | null = null;
let unsubscribeStages: (() => void) | null = null;
/** Height of the document's content, for the furthest reachable scroll. */
let contentHeight = 0;

const viewportFrame = (): ScrollFrame => ({
  scrollY: window.scrollY,
  viewportHeight: document.documentElement.clientHeight,
});

function write(line: Line, scale: number): void {
  if (Math.abs(scale - line.drawn) < 0.0005) return;
  line.drawn = scale;
  line.element.style.transform = scale >= 1 ? "none" : `scaleX(${scale})`;
}

/**
 * Scroll frame: arithmetic and one style write per line, no layout reads.
 * p runs from the line entering at the bottom of the viewport to the line
 * reaching the top quarter (drawLine.end). A line too near the end of the
 * page to get there completes at the furthest scroll instead (its top at
 * that scroll is the end point), so it always finishes drawing.
 */
function apply(line: Line, { scrollY, viewportHeight }: ScrollFrame): void {
  if (line.hidden) return;
  const start = line.top - viewportHeight;
  const maxScroll = Math.max(0, contentHeight - viewportHeight);
  const end = Math.min(line.top - viewportHeight * drawLine.end, maxScroll);
  const raw = end > start ? (scrollY - start) / (end - start) : 1;
  // Later segments start later and still finish with the first one.
  const progress = clamp01((raw - line.delay) / (1 - line.delay));
  write(line, scrollEasings[drawLine.easing](progress));
}

/**
 * Document top in normal flow. A line in a pinned project stage takes the
 * stage's measured document top (sticky would skew offsets) plus its place in
 * the stage, so a pinned line stays fully drawn.
 */
function lineTop(element: HTMLElement): number {
  const stage = element.closest<HTMLElement>("[data-stage]");
  const geometry = stage ? stageStore.get(stage.dataset.stage ?? "") : undefined;
  if (!stage || !geometry) return documentTop(element);
  let offset = 0;
  let node: HTMLElement | null = element;
  while (node && node !== stage) {
    offset += node.offsetTop;
    node = node.offsetParent instanceof HTMLElement ? node.offsetParent : null;
  }
  return node === stage ? geometry.docTop + offset : documentTop(element);
}

function measure(line: Line): void {
  line.hidden = line.element.offsetParent === null;
  if (line.hidden) return;
  line.top = lineTop(line.element);
  const { segment, segmentQuery } = line.options;
  const offset = segmentQuery === null || window.matchMedia(segmentQuery).matches;
  line.delay = offset ? segment * drawLine.splitOffset : 0;
}

/**
 * Mount, resize, font load and late-rendering rows: re-measure the lines in
 * range, then redraw them. Lines out of range are measured when they come
 * near, so rows that skip rendering are never forced to lay out. All reads
 * happen before any write.
 */
function measureNear(): void {
  contentHeight = document.documentElement.offsetHeight;
  const near = [...lines.values()].filter((line) => line.near);
  near.forEach(measure);
  const frame = viewportFrame();
  near.forEach((line) => apply(line, frame));
}

/** One intersection report: lines entering range subscribe, lines leaving it settle. */
function onIntersect(entries: readonly IntersectionObserverEntry[]): void {
  const entering: Line[] = [];
  entries.forEach((entry) => {
    const line = lines.get(entry.target as HTMLElement);
    const near = entry.isIntersecting;
    if (!line || near === line.near) return;
    line.near = near;
    if (near) {
      entering.push(line);
      return;
    }
    line.unsubscribe?.();
    line.unsubscribe = null;
    // Out of range: drawn if it is above the viewport, undrawn if below.
    if (entry.boundingClientRect.height > 0 || entry.boundingClientRect.width > 0) {
      write(line, entry.boundingClientRect.top < 0 ? 1 : 0);
    }
  });
  if (entering.length === 0) return;
  // Reads (rows below the first screen may have just rendered), then writes.
  contentHeight = document.documentElement.offsetHeight;
  entering.forEach(measure);
  const frame = viewportFrame();
  entering.forEach((line) => {
    // Right state at once (a jump can land the line in view), then follow the scroll.
    apply(line, frame);
    line.unsubscribe = subscribeToScroll((next) => apply(line, next));
  });
}

function observers(): { near: IntersectionObserver; size: ResizeObserver } {
  if (!nearObserver || !sizeObserver) {
    nearObserver = new IntersectionObserver(onIntersect, {
      rootMargin: `${drawLine.subscribeMargin}px 0px`,
    });
    sizeObserver = new ResizeObserver(measureNear);
    sizeObserver.observe(document.documentElement);
    unsubscribeStages = stageStore.subscribeGeometry(measureNear);
    void document.fonts?.ready.then(measureNear);
  }
  return { near: nearObserver, size: sizeObserver };
}

/**
 * Registers a divider line. One IntersectionObserver tracks which lines are
 * within the viewport plus the margin; only those subscribe to the shared
 * scroll scheduler. One ResizeObserver on the document re-measures them all.
 * Returns the cleanup, which leaves the line to its CSS default.
 */
export function registerDrawLine(element: HTMLElement, options: DrawLineOptions): () => void {
  const line: Line = {
    element,
    options,
    top: 0,
    delay: 0,
    hidden: false,
    near: null,
    unsubscribe: null,
    drawn: -1,
  };
  lines.set(element, line);
  observers().near.observe(element);

  return () => {
    line.unsubscribe?.();
    lines.delete(element);
    nearObserver?.unobserve(element);
    element.style.transform = "";
    if (lines.size > 0) return;
    nearObserver?.disconnect();
    sizeObserver?.disconnect();
    unsubscribeStages?.();
    unsubscribeStages = null;
    nearObserver = null;
    sizeObserver = null;
  };
}
