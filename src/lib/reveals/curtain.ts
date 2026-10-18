import { reveals } from "@/lib/motion";
import type { RevealEffect } from "./types";

const { curtain, radius } = reveals;

/** Two doors parting from a vertical line in the centre. */
export const curtainEffect: RevealEffect = {
  setup() {},
  apply({ frame, media }, e) {
    if (e >= 1) {
      frame.style.clipPath = "";
      media.style.transform = "";
      return;
    }
    const closed = 1 - e;
    frame.style.clipPath = `inset(0 calc((50% - ${curtain.seam}px) * ${closed}) 0 calc((50% - ${curtain.seam}px) * ${closed}) round ${radius}px)`;
    media.style.transform = `scale(${curtain.mediaScale - (curtain.mediaScale - 1) * e})`;
  },
  reset({ frame, media }) {
    frame.style.clipPath = "";
    media.style.transform = "";
  },
};
