/**
 * The homepage project stages, keyed by project slug. WorkStack measures each
 * stage's document top (with sticky off) and its pin top (the header height)
 * on mount, resize and font load, and works out which stages are fully
 * covered. Reveals, the card morph, divider lines and videos read from here,
 * so nothing reads layout inside the scroll frame.
 */

export interface StageGeometry {
  /** Document top of the stage in normal flow (never the stuck position). */
  readonly docTop: number;
  /** Viewport top at which the stage pins: the header height. */
  readonly pinTop: number;
}

type Listener = () => void;

const geometryListeners = new Set<Listener>();
const coveredListeners = new Set<Listener>();
let geometry = new Map<string, StageGeometry>();
const covered = new Set<string>();

const subscribe = (listeners: Set<Listener>) => (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const stageStore = {
  subscribeGeometry: subscribe(geometryListeners),
  subscribeCovered: subscribe(coveredListeners),

  get: (slug: string): StageGeometry | undefined => geometry.get(slug),
  setGeometry(next: Map<string, StageGeometry>): void {
    geometry = next;
    geometryListeners.forEach((listener) => listener());
  },

  /** Fully hidden by the next stage (it has pinned over this one). */
  isCovered: (slug: string): boolean => covered.has(slug),
  setCovered(slug: string, next: boolean): void {
    if (next === covered.has(slug)) return;
    if (next) covered.add(slug);
    else covered.delete(slug);
    coveredListeners.forEach((listener) => listener());
  },
};

/**
 * Hand-over progress of a stage, 0 to 1: 0 as its top edge enters at the
 * bottom of the viewport, 1 as it reaches the header and pins (and fully
 * covers the stage before it). Arithmetic only.
 */
export function stageProgress(
  { docTop, pinTop }: StageGeometry,
  scrollY: number,
  viewportHeight: number,
): number {
  const top = docTop - scrollY;
  const span = viewportHeight - pinTop;
  if (span <= 0) return top <= pinTop ? 1 : 0;
  return Math.min(1, Math.max(0, (viewportHeight - top) / span));
}
