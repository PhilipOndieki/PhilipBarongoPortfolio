/**
 * The page's single scroll listener. Scroll and resize events are coalesced
 * into one requestAnimationFrame callback per frame, and every subscriber
 * reads the same snapshot. The listeners exist only while someone subscribes.
 */

export interface ScrollFrame {
  readonly scrollY: number;
  /** Layout viewport height. It does not jump when mobile browser bars move. */
  readonly viewportHeight: number;
}

export type ScrollSubscriber = (frame: ScrollFrame) => void;

const subscribers = new Set<ScrollSubscriber>();
let frameId: number | null = null;
// Read on subscribe and on resize, so the frame itself does no layout reads.
let viewportHeight = 0;

function flush(): void {
  frameId = null;
  const frame: ScrollFrame = { scrollY: window.scrollY, viewportHeight };
  subscribers.forEach((subscriber) => subscriber(frame));
}

function requestFlush(): void {
  if (frameId === null) frameId = window.requestAnimationFrame(flush);
}

function onResize(): void {
  viewportHeight = document.documentElement.clientHeight;
  requestFlush();
}

export function subscribeToScroll(subscriber: ScrollSubscriber): () => void {
  subscribers.add(subscriber);
  if (subscribers.size === 1) {
    viewportHeight = document.documentElement.clientHeight;
    window.addEventListener("scroll", requestFlush, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
  }
  // New subscribers get a frame straight away, so they start in sync.
  requestFlush();

  return () => {
    subscribers.delete(subscriber);
    if (subscribers.size > 0) return;
    window.removeEventListener("scroll", requestFlush);
    window.removeEventListener("resize", onResize);
    if (frameId !== null) {
      window.cancelAnimationFrame(frameId);
      frameId = null;
    }
  };
}
