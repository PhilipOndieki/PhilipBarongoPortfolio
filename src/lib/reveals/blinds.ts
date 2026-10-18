import { clamp01, reveals } from "@/lib/motion";
import type { RevealEffect } from "./types";

const { blinds } = reveals;
const STRIPS_ATTR = "data-blinds";

function removeStrips(frame: HTMLElement): void {
  frame.querySelector(`[${STRIPS_ATTR}]`)?.remove();
}

function createStrips(frame: HTMLElement, count: number): HTMLElement {
  const layer = document.createElement("div");
  layer.setAttribute(STRIPS_ATTR, String(count));
  layer.setAttribute("aria-hidden", "true");
  layer.className = "reveal-blinds";
  for (let index = 0; index < count; index += 1) {
    const strip = document.createElement("span");
    strip.style.left = `${(index * 100) / count}%`;
    // A hair wider than its share, so neighbouring strips never show a seam.
    strip.style.width = `calc(${100 / count}% + 1px)`;
    layer.append(strip);
  }
  frame.append(layer);
  return layer;
}

/** Vertical strips over the media fold down one after another. */
export const blindsEffect: RevealEffect = {
  setup() {},
  apply({ frame }, e, { mobile }) {
    const count = (mobile ? blinds.mobile : blinds.desktop).count;
    let layer = frame.querySelector<HTMLElement>(`[${STRIPS_ATTR}]`);
    if (e >= 1) {
      layer?.remove();
      return;
    }
    if (layer && layer.getAttribute(STRIPS_ATTR) !== String(count)) {
      layer.remove();
      layer = null;
    }
    layer ??= createStrips(frame, count);
    Array.from(layer.children).forEach((strip, index) => {
      const local = clamp01((e - index * blinds.stagger) / blinds.duration);
      (strip as HTMLElement).style.transform = `scaleY(${1 - local})`;
    });
  },
  reset({ frame }) {
    removeStrips(frame);
  },
};
