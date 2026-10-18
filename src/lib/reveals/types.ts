/** The elements a reveal effect works on. */
export interface RevealTargets {
  /** The full-size layout box (never transformed by effects). */
  readonly anchor: HTMLElement;
  /** The visible frame: radius, background, clip. Most effects animate it. */
  readonly frame: HTMLElement;
  /** The layer inside the frame holding the video or placeholder. */
  readonly media: HTMLElement;
}

export interface RevealContext {
  /** Below 768px: effects use their lighter mobile values. */
  readonly mobile: boolean;
}

/**
 * One scroll reveal. Pure DOM writes: no layout reads, and only transform,
 * opacity and clip-path (plus one-time setup styles). apply() runs once per
 * frame with the eased progress e (0 to 1); at e = 1 the frame is at its final
 * state, with an identity transform and no clip. reset() removes every trace.
 */
export interface RevealEffect {
  setup(targets: RevealTargets): void;
  apply(targets: RevealTargets, e: number, context: RevealContext): void;
  reset(targets: RevealTargets): void;
}

export const lerp = (from: number, to: number, t: number): number => from + (to - from) * t;
