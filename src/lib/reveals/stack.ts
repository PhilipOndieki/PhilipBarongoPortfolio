import { reveals } from "@/lib/motion";
import { lerp, type RevealEffect, type RevealTargets } from "./types";

const { stack } = reveals;
const OVERLAY_ATTR = "data-stack-overlay";

// The previous stage's frame, found once per row in setup, so the scroll
// frame does no DOM queries.
const previousByAnchor = new WeakMap<HTMLElement, HTMLElement | null>();

function findPrevious(anchor: HTMLElement): HTMLElement | null {
  const stage = anchor.closest<HTMLElement>("[data-stage]");
  const previous = stage?.previousElementSibling;
  return previous?.matches("[data-stage]")
    ? previous.querySelector<HTMLElement>("[data-project-media]")
    : null;
}

function previousFrame({ anchor }: RevealTargets): HTMLElement | null {
  if (!previousByAnchor.has(anchor)) previousByAnchor.set(anchor, findPrevious(anchor));
  return previousByAnchor.get(anchor) ?? null;
}

function overlayOf(frame: HTMLElement): HTMLElement | null {
  return frame.querySelector<HTMLElement>(`[${OVERLAY_ATTR}]`);
}

/**
 * This stage slides up over the pinned stage before it, with no effect of its
 * own. Instead, the previous stage's media frame recedes: it scales down from
 * its centre top and darkens under a black overlay.
 */
export const stackEffect: RevealEffect = {
  setup(targets) {
    previousByAnchor.set(targets.anchor, findPrevious(targets.anchor));
    const frame = previousFrame(targets);
    if (!frame || overlayOf(frame)) return;
    const overlay = document.createElement("div");
    overlay.setAttribute(OVERLAY_ATTR, "");
    overlay.setAttribute("aria-hidden", "true");
    overlay.className = "reveal-stack-overlay";
    frame.append(overlay);
  },
  apply(targets, e) {
    const frame = previousFrame(targets);
    if (!frame) return;
    frame.style.transformOrigin = "50% 0";
    frame.style.transform = e > 0 ? `scale(${lerp(1, stack.previousScale, e)})` : "";
    const overlay = overlayOf(frame);
    if (overlay) overlay.style.opacity = String(lerp(0, stack.overlayOpacity, e));
  },
  reset(targets) {
    const frame = previousFrame(targets);
    if (frame) {
      frame.style.transform = "";
      frame.style.transformOrigin = "";
      overlayOf(frame)?.remove();
    }
    previousByAnchor.delete(targets.anchor);
  },
};
