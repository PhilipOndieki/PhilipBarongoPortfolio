import { MQ } from "@/lib/motion";
import type { FrameRevealName, RevealName } from "@/types";
import { blindsEffect } from "./blinds";
import { counterSlideEffect } from "./counterSlide";
import { curtainEffect } from "./curtain";
import { diagonalWipeEffect } from "./diagonalWipe";
import { irisEffect } from "./iris";
import { stackEffect } from "./stack";
import { tiltEffect } from "./tilt";
import type { RevealEffect } from "./types";

export type { RevealContext, RevealEffect, RevealTargets } from "./types";

/**
 * Every row reveal. Add an effect: write a module with setup/apply/reset,
 * add it here, and add its name to RevealName in src/types.
 * ("cardMorph" is the featured row's CardMorph, not a registry effect.)
 */
export const revealEffects: Readonly<Record<FrameRevealName, RevealEffect>> = {
  curtain: curtainEffect,
  tilt: tiltEffect,
  blinds: blindsEffect,
  iris: irisEffect,
  counterSlide: counterSlideEffect,
  diagonalWipe: diagonalWipeEffect,
  stack: stackEffect,
};

/**
 * Where a row's reveal runs, as a media query. The card morph also needs a
 * tall enough screen; every other effect only needs motion allowed.
 */
export function revealMotionQuery(reveal: RevealName): string {
  return reveal === "cardMorph" ? MQ.morph : MQ.motionOK;
}
