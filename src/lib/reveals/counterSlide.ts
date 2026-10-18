import { reveals } from "@/lib/motion";
import { lerp, type RevealEffect } from "./types";

const { counterSlide } = reveals;

/**
 * The frame slides in from the right while the media inside moves the other
 * way. The row clips horizontally (.reveal-clip-x) so the page never scrolls.
 */
export const counterSlideEffect: RevealEffect = {
  setup() {},
  apply({ frame, media }, e, { mobile }) {
    if (e >= 1) {
      frame.style.transform = "";
      media.style.transform = "";
      return;
    }
    const values = mobile ? counterSlide.mobile : counterSlide.desktop;
    frame.style.transform = `translateX(${lerp(values.frameX, 0, e)}%)`;
    media.style.transform = `translateX(${lerp(values.mediaX, 0, e)}%) scale(${lerp(counterSlide.mediaScale, 1, e)})`;
  },
  reset({ frame, media }) {
    frame.style.transform = "";
    media.style.transform = "";
  },
};
