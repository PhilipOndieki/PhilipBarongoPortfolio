import { reveals } from "@/lib/motion";
import { lerp, type RevealEffect } from "./types";

const { diagonalWipe, radius } = reveals;

/**
 * A triangle spreads from the top-left corner to the bottom-right, like water.
 * polygon() has no rounding, so the anchor keeps the 6px corners meanwhile.
 */
export const diagonalWipeEffect: RevealEffect = {
  setup({ anchor }) {
    anchor.style.borderRadius = `${radius}px`;
    anchor.style.overflow = "hidden";
  },
  apply({ frame }, e) {
    if (e >= 1) {
      frame.style.clipPath = "";
      return;
    }
    const leg = lerp(diagonalWipe.from, diagonalWipe.to, e);
    frame.style.clipPath = `polygon(0 0, ${leg}% 0, 0 ${leg}%)`;
  },
  reset({ anchor, frame }) {
    anchor.style.borderRadius = "";
    anchor.style.overflow = "";
    frame.style.clipPath = "";
  },
};
