import { reveals } from "@/lib/motion";
import { lerp, type RevealEffect } from "./types";

const { iris } = reveals;

/** A circle opens from the centre of the frame. */
export const irisEffect: RevealEffect = {
  setup() {},
  apply({ frame, media }, e) {
    if (e >= 1) {
      frame.style.clipPath = "";
      media.style.transform = "";
      return;
    }
    frame.style.clipPath = `circle(${lerp(iris.radiusFrom, iris.radiusTo, e)}% at 50% 50%)`;
    media.style.transform = `scale(${lerp(iris.mediaScale, 1, e)})`;
  },
  reset({ frame, media }) {
    frame.style.clipPath = "";
    media.style.transform = "";
  },
};
