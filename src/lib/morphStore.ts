/**
 * Shared state between the preview card (in the hero) and the morphing
 * project frame (in the featured row). Per-row reveal flags live in
 * revealStore. A plain module store: written from measurements
 * and from the morph's scroll frame, never from React state per frame.
 */

/** A rect in document coordinates (scroll-independent). */
export interface DocRect {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

/** What the card publishes while it is on screen. */
export interface CardHandle {
  /** The card's resting rect (fully up), with its translateY removed. */
  readonly rect: DocRect;
  /** The card's current translateY in px: 0 fully up, height + 24 hidden. */
  readOffset(): number;
  /** Hide the card at once and stop its cycles. */
  retire(): void;
}

type Listener = () => void;

const listeners = new Set<Listener>();
let card: CardHandle | null = null;
let finalRect: DocRect | null = null;
let retired = false;

const emit = () => listeners.forEach((listener) => listener());

export const morphStore = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getCard: (): CardHandle | null => card,
  setCard(next: CardHandle | null): void {
    card = next;
    emit();
  },

  getFinalRect: (): DocRect | null => finalRect,
  setFinalRect(next: DocRect): void {
    finalRect = next;
  },

  /** True once the frame has taken over. The card never shows again. */
  isRetired: (): boolean => retired,
  /**
   * Retire the card for this page view. Returns its translateY at that moment
   * (null if there is no card on screen), read before it is hidden.
   */
  retireCard(): number | null {
    if (retired) return null;
    retired = true;
    const handle = card;
    const offset = handle ? handle.readOffset() : null;
    handle?.retire();
    emit();
    return offset;
  },
};
