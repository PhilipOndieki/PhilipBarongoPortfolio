/**
 * Every motion value on the page. Durations are in milliseconds unless the
 * name says otherwise. CSS reads these through the custom properties that
 * motionStyles() writes into <head>, so nothing is duplicated in globals.css.
 */

export const BREAKPOINT_MD = 768;
/** From here the About Focus block shows its three columns side by side. */
export const BREAKPOINT_LG = 1024;

/** Below this viewport height (landscape phones) there is no card and no morph. */
export const MIN_MOTION_VIEWPORT_HEIGHT = 500;

export const MQ = {
  desktop: `(min-width: ${BREAKPOINT_MD}px)`,
  wide: `(min-width: ${BREAKPOINT_LG}px)`,
  finePointer: "(hover: hover) and (pointer: fine)",
  reducedMotion: "(prefers-reduced-motion: reduce)",
  /** Where the row reveal effects run (every effect is skipped with reduced motion). */
  motionOK: "(prefers-reduced-motion: no-preference)",
  /** Where the preview card and the card-to-row morph run. */
  morph: `(prefers-reduced-motion: no-preference) and (min-height: ${MIN_MOTION_VIEWPORT_HEIGHT}px)`,
} as const;

export const easing = {
  outExpo: "cubic-bezier(0.16, 1, 0.3, 1)",
  out: "ease-out",
  in: "ease-in",
} as const;

export const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));
/** Even build-up: slow in, steady middle, slow out. */
export const smoothstep = (t: number): number => t * t * (3 - 2 * t);

/** Named easing functions for scroll-linked motion. */
export const scrollEasings = { smoothstep } as const;
export type ScrollEasing = keyof typeof scrollEasings;

/** First-load fade-in of the hero text and strip. */
export const rise = {
  duration: 600,
  distance: 8,
  stagger: 100,
  order: { intro: 0, headline: 1, subtext: 2, strip: 3 },
} as const;

/** Strip marquee, in seconds per loop. */
export const marquee = {
  durationMobile: 30,
  durationDesktop: 40,
} as const;

/** Header name: monogram fade, typing and deleting. */
export const typing = {
  monogramFade: 150,
  typeInterval: 35,
  deleteInterval: 18,
  caretHold: 400,
} as const;

/** Project text: staggered line mask and chips. */
export const reveal = {
  visibleRatio: 0.35,
  duration: 900,
  stagger: 90,
  distance: "105%",
  order: { name: 0, tagline: 1, description: 2 },
  chips: {
    duration: 500,
    stagger: 50,
    delayAfterDescription: 300,
    distance: 6,
  },
} as const;

/**
 * The card and the project frame are one object. From scroll 0 to the moment
 * the featured stage pins under the header, the frame travels and grows from
 * the card's rest spot (FLIP, transform only) into its place in the row.
 */
export const cardMorph = {
  easing: "smoothstep" satisfies ScrollEasing,
  /** Visual corner radius at the card's size and at full size. */
  startRadius: 10,
  endRadius: 6,
  /** Above this scrollY the frame takes over from the card. */
  handoffScrollY: 1,
  /** The frame rises into the card's spot if the card was not fully up. */
  rise: { duration: 300, easing: easing.outExpo },
  /** Back at the top, the frame drops out below the fold. */
  drop: { duration: 450, easing: "cubic-bezier(0.4, 0, 1, 1)" },
  /** Eased progress at which the row text reveals (once). */
  textRevealAt: 0.7,
  /** Eased progress from which the video may play. */
  videoActiveAt: 0.98,
} as const;

type CardLevel = "hidden" | "rest" | "high" | "low";

interface CardKeyframe {
  /** Percent of the enter animation. */
  readonly at: number;
  readonly y: CardLevel;
  /** Easing of the segment that arrives at this keyframe. */
  readonly ease?: string;
}

/**
 * The small preview card that rises under the strip, holds, then drops away.
 * Sizes are the outer box (border and padding included).
 */
export const notificationCard = {
  /** Outer size. 16:9 like the project frame, so the handoff is pixel-identical. */
  size: {
    desktop: { width: 168, height: 94.5 },
    mobile: { width: 128, height: 72 },
    min: { width: 96, height: 54 },
  },
  /** Gap between the card's bottom edge and the fold when fully up. */
  bottomOffset: 24,
  /** Minimum gap between the strip and the card's top edge. */
  stripGap: 12,
  /** After the hero fade-in ends, measured from navigation start. */
  startDelay: 1600,
  maxCycles: 10,
  /** Which container edge the card lines up with: "right" padding, or "left" (the start of the right column). */
  align: "right" as "left" | "right",
  enter: {
    duration: 500,
    keyframes: [
      { at: 0, y: "hidden" },
      { at: 55, y: "high", ease: easing.out },
      { at: 75, y: "rest", ease: "ease-in-out" },
      { at: 88, y: "low", ease: easing.out },
      { at: 100, y: "rest", ease: easing.in },
    ] satisfies readonly CardKeyframe[],
    peaks: {
      desktop: { high: -10, low: -4 },
      mobile: { high: -7, low: -3 },
    },
  },
  hold: 900,
  exit: { duration: 450, easing: "cubic-bezier(0.4, 0, 1, 1)" },
  /** Hidden between cycles. */
  pause: 1500,
  /** Rise back up when hovered or focused during the exit. */
  returnEasing: easing.out,
  hoverResumeDelay: 600,
} as const;

/** translateY that puts the card fully below the fold. */
export const cardHiddenTransform = `translateY(calc(100% + ${notificationCard.bottomOffset}px))`;

/** Web Animations keyframes for the enter, with desktop or mobile peaks. */
export function cardEnterKeyframes(desktop: boolean): Keyframe[] {
  const { keyframes, peaks } = notificationCard.enter;
  const peak = desktop ? peaks.desktop : peaks.mobile;
  const translate = (level: CardLevel): string => {
    if (level === "hidden") return cardHiddenTransform;
    return `translateY(${level === "rest" ? 0 : peak[level]}px)`;
  };
  const frames: readonly CardKeyframe[] = keyframes;
  // WAAPI puts a segment's easing on the keyframe where the segment starts.
  return frames.map((frame, index) => ({
    offset: frame.at / 100,
    transform: translate(frame.y),
    easing: frames[index + 1]?.ease ?? "linear",
  }));
}

/**
 * Row reveal effects (src/lib/reveals). Each project is a pinned stage; its
 * progress runs across the whole hand-over, from the stage entering at the
 * bottom of the viewport to it pinning under the header:
 * p = clamp((viewportHeight - stageTop) / (viewportHeight - headerHeight)),
 * eased by smoothstep. Lengths are px, angles deg, percentages % of the frame.
 */
export const reveals = {
  easing: "smoothstep" satisfies ScrollEasing,
  /** Rows subscribe to the scroll scheduler only within the viewport plus this margin. */
  subscribeMargin: 200,
  /** Row text reveals once at this eased progress. */
  textRevealAt: 0.7,
  /** The row's video and link become active from this eased progress. */
  videoActiveAt: 0.98,
  /** Frame corner radius, kept by effects that clip. */
  radius: 6,
  curtain: {
    /** Each door stops this far from the centre line, so a 2px line shows at e = 0. */
    seam: 1,
    mediaScale: 1.06,
  },
  tilt: {
    perspective: 1400,
    opacityFrom: 0.35,
    desktop: { rotateX: 28, translateY: 60 },
    mobile: { rotateX: 16, translateY: 32 },
  },
  blinds: {
    /** Each strip starts this much eased progress after the previous one. */
    stagger: 0.08,
    /** Eased progress each strip takes to open. */
    duration: 0.6,
    desktop: { count: 6 },
    mobile: { count: 4 },
  },
  iris: {
    /** circle() radius, % of the frame's reference box; 75% covers the corners. */
    radiusFrom: 6,
    radiusTo: 75,
    mediaScale: 1.1,
  },
  counterSlide: {
    mediaScale: 1.2,
    desktop: { frameX: 15, mediaX: -10 },
    mobile: { frameX: 8, mediaX: -5 },
  },
  diagonalWipe: {
    /** Triangle leg length; 200% covers the whole frame. */
    from: 4,
    to: 200,
  },
  stack: {
    /** The previous stage's frame recedes to this scale (origin centre top)... */
    previousScale: 0.92,
    /** ...under a black overlay rising to this opacity. */
    overlayOpacity: 0.5,
  },
} as const;

/** Project page: text fade-in and video visibility. */
export const projectPage = {
  textFade: 700,
  textFadeEasing: easing.outExpo,
  /** Blocks start at this opacity and fade to 1. */
  textStartOpacity: 0.2,
  stagger: 60,
  /** Share of a block that must be visible to start its fade. */
  textRevealRatio: 0.2,
  /** The video pauses below this visible share. */
  mediaPauseThreshold: 0.25,
  /** The video fades in over the cover when it first plays. */
  videoFadeIn: 400,
  videoFadeEasing: easing.out,
} as const;

/** Home <-> project page transitions (View Transitions API, with a fade fallback). */
export const viewTransition = {
  mediaDuration: 600,
  mediaEasing: easing.outExpo,
  rootDuration: 250,
  rootEasing: easing.out,
  /** Browsers without view transitions, and reduced motion: the new page fades in. */
  fallbackFade: 300,
  /** Resolve the transition anyway if the new page has not signalled by then. */
  resolveTimeout: 1200,
} as const;

/**
 * Divider lines (DrawLine). Each line's progress is
 * p = clamp((viewportHeight - lineTop) / (viewportHeight * range)), eased by
 * smoothstep into scaleX: from the bottom of the viewport to its top quarter.
 * Scroll-linked both ways.
 */
export const drawLine = {
  range: 0.75,
  /** The line is fully drawn once its top reaches this share of the viewport height. */
  end: 0.25,
  easing: "smoothstep" satisfies ScrollEasing,
  /** Each later segment of a split divider starts this much progress later. */
  splitOffset: 0.1,
  /** Lines subscribe to the scroll scheduler only within the viewport plus this margin. */
  subscribeMargin: 200,
} as const;

/** About section: each content block fades from 20% to full once (FadeIn). */
export const about = {
  fadeStartOpacity: 0.2,
  fadeDuration: 700,
  fadeEasing: easing.outExpo,
  stagger: 60,
} as const;

/** The Nairobi clock in the About section. */
export const clock = {
  /** Hands move once per second, on the full second. */
  tickInterval: 1000,
  /** The accessible time label changes once per minute. */
  labelUpdate: 60000,
} as const;

/** Lazy loading and playback of project videos. */
export const video = {
  lazyMargin: 400,
  playRatio: 0.5,
} as const;

const ms = (value: number): string => `${value}ms`;
const px = (value: number): string => `${value}px`;

function declarations(vars: Readonly<Record<string, string | number>>): string {
  return Object.entries(vars)
    .map(([name, value]) => `--${name}:${value};`)
    .join("");
}

/** The CSS custom properties generated from the values above. Rendered once in the root layout. */
export function motionStyles(): string {
  const mobile = declarations({
    "rise-duration": ms(rise.duration),
    "rise-distance": px(rise.distance),
    "marquee-duration": `${marquee.durationMobile}s`,
    "ease-out-expo": easing.outExpo,
    "monogram-fade": ms(typing.monogramFade),
    "reveal-duration": ms(reveal.duration),
    "reveal-stagger": ms(reveal.stagger),
    "reveal-distance": reveal.distance,
    "chip-duration": ms(reveal.chips.duration),
    "chip-stagger": ms(reveal.chips.stagger),
    "chip-delay": ms(
      reveal.order.description * reveal.stagger + reveal.chips.delayAfterDescription,
    ),
    "chip-distance": px(reveal.chips.distance),
    "morph-radius-start": px(cardMorph.startRadius),
    "morph-radius-end": px(cardMorph.endRadius),
    "media-radius": px(cardMorph.endRadius),
    "fade-duration": ms(projectPage.textFade),
    "fade-easing": projectPage.textFadeEasing,
    // A black cover at this opacity looks the same as the text at textStartOpacity
    // on the pure black page, while the text itself keeps full contrast.
    "fade-cover": String(1 - projectPage.textStartOpacity),
    "fade-stagger": ms(projectPage.stagger),
    "vt-media-duration": ms(viewTransition.mediaDuration),
    "vt-media-easing": viewTransition.mediaEasing,
    "vt-root-duration": ms(viewTransition.rootDuration),
    "vt-root-easing": viewTransition.rootEasing,
    "route-fade-duration": ms(viewTransition.fallbackFade),
    "reveal-radius": px(reveals.radius),
    "about-fade-duration": ms(about.fadeDuration),
    "about-fade-easing": about.fadeEasing,
    "about-fade-cover": String(1 - about.fadeStartOpacity),
    "about-fade-stagger": ms(about.stagger),
  });

  const desktop = declarations({
    "marquee-duration": `${marquee.durationDesktop}s`,
  });

  // The morphing frame stays hidden at the top of the page (the card shows
  // there instead). Where the morph does not run, it is a static frame.
  const morph =
    `@media ${MQ.morph}{.morph-anchor[data-morph] .morph-lift{visibility:hidden}}` +
    `@media not all and ${MQ.morph}{.morph-lift,.morph-frame{transform:none!important;visibility:visible!important}}`;

  return `:root{${mobile}}@media ${MQ.desktop}{:root{${desktop}}}${morph}`;
}
