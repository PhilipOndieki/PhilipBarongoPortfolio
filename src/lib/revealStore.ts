/**
 * Per-row reveal state, keyed by project slug: whether the row's text has
 * revealed (one-way, at e >= 0.7) and whether its frame is at full size
 * (e >= 0.98, both ways). Written from the scroll frame only when a value
 * changes; read by the row's text, link and video.
 */

type Listener = () => void;

const listeners = new Set<Listener>();
const revealed = new Set<string>();
const fullSize = new Set<string>();

const emit = () => listeners.forEach((listener) => listener());

export const revealStore = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  isRevealed: (slug: string): boolean => revealed.has(slug),
  markRevealed(slug: string): void {
    if (revealed.has(slug)) return;
    revealed.add(slug);
    emit();
  },

  isFullSize: (slug: string): boolean => fullSize.has(slug),
  setFullSize(slug: string, next: boolean): void {
    if (next === fullSize.has(slug)) return;
    if (next) fullSize.add(slug);
    else fullSize.delete(slug);
    emit();
  },
};
