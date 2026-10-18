import { reveals } from "@/lib/motion";
import { lerp, type RevealEffect } from "./types";

const { tilt } = reveals;

/** The frame lies back in 3D, then lifts up to face the viewer. */
export const tiltEffect: RevealEffect = {
  setup({ anchor, frame }) {
    anchor.style.perspective = `${tilt.perspective}px`;
    frame.style.transformOrigin = "50% 100%";
  },
  apply({ frame }, e, { mobile }) {
    if (e >= 1) {
      frame.style.transform = "";
      frame.style.opacity = "";
      return;
    }
    const values = mobile ? tilt.mobile : tilt.desktop;
    frame.style.transform = `translateY(${lerp(values.translateY, 0, e)}px) rotateX(${lerp(values.rotateX, 0, e)}deg)`;
    frame.style.opacity = String(lerp(tilt.opacityFrom, 1, e));
  },
  reset({ anchor, frame }) {
    anchor.style.perspective = "";
    frame.style.transformOrigin = "";
    frame.style.transform = "";
    frame.style.opacity = "";
  },
};
