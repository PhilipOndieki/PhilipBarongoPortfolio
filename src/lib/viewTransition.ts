/**
 * Home <-> project page transitions with the native View Transitions API.
 *
 * The update callback returns a promise whose resolve sits in a module-level
 * slot. The incoming page resolves it once its shared element is in place
 * (the project media on mount; the home row frame after scroll restoration),
 * or a safety timeout does. Browsers without the API, and reduced motion, get
 * a short fade-in of the new page instead.
 *
 * Browser Back/Forward between home and a project page is relayed through the
 * same path: our popstate listener runs before the App Router's (it is
 * installed by a component inside the router), wraps the navigation in a view
 * transition, and re-dispatches the event for the router from the update
 * callback, after the old page has been captured.
 */

import { MEDIA_ANCHOR_ATTR, PROJECT_MEDIA_ATTR, projectMediaTransitionName } from "@/lib/anchors";
import { cardMorph, MQ, viewTransition } from "@/lib/motion";

type Direction = "toProject" | "toHome";

interface Pending {
  readonly direction: Direction;
  /** The project the shared element belongs to. */
  readonly slug: string;
  readonly resolve: () => void;
  readonly timer: number;
}

const MEDIA_CLASS = "project-media";
const FROM_HOME_KEY = "po:from-home";
const HOME_SCROLL_KEY = "po:home-scroll";
/** The clicked row and where its frame sat in the viewport, for row-relative restoration. */
const HOME_ROW_KEY = "po:home-row";
const HOME_PATH = "/";
const PROJECT_PATH = /^\/work\/([^/]+)\/?$/;

let pending: Pending | null = null;
let active: ViewTransition | null = null;
let fallbackFade = false;
let returningHome = false;
let currentPath: string | null = null;
const relayed = new WeakSet<Event>();

const projectSlugOf = (path: string | null): string | null =>
  path?.match(PROJECT_PATH)?.[1] ?? null;

function storage(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

/** True when the browser can morph and the user has not asked for reduced motion. */
export function canMorph(): boolean {
  return (
    typeof document.startViewTransition === "function" &&
    !window.matchMedia(MQ.reducedMotion).matches
  );
}

/** Give an element the shared name for one transition. */
export function nameSharedElement(element: HTMLElement, slug: string): void {
  element.style.setProperty("view-transition-name", projectMediaTransitionName(slug));
  element.style.setProperty("view-transition-class", MEDIA_CLASS);
}

export function clearSharedElement(element: HTMLElement): void {
  element.style.removeProperty("view-transition-name");
  element.style.removeProperty("view-transition-class");
}

/** A project's homepage media frame, if it is on the page. */
export function findProjectFrame(slug: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[${PROJECT_MEDIA_ATTR}="${CSS.escape(slug)}"]`);
}

/** Static frames are always full size; the morphing frame says so in data-morph. */
export function isFrameAtFullSize(frame: HTMLElement): boolean {
  return frame.dataset.morph !== "partial";
}

function begin(
  direction: Direction,
  slug: string,
  update: () => void,
  sharedElement: HTMLElement | null,
): void {
  if (!canMorph()) {
    fallbackFade = true;
    update();
    return;
  }

  if (sharedElement) nameSharedElement(sharedElement, slug);
  const transition = document.startViewTransition(
    () =>
      new Promise<void>((resolve) => {
        const timer = window.setTimeout(() => settle(), viewTransition.resolveTimeout);
        pending = { direction, slug, resolve, timer };
        update();
      }),
  );
  active = transition;
  // A skipped transition rejects these; navigation still happens.
  transition.ready.catch(() => {});
  transition.finished
    .catch(() => {})
    .finally(() => {
      if (sharedElement) clearSharedElement(sharedElement);
      if (active === transition) active = null;
    });
}

function settle(): void {
  if (!pending) return;
  window.clearTimeout(pending.timer);
  const { resolve } = pending;
  pending = null;
  resolve();
}

/** The incoming transition this page should complete, if any. */
export function incomingTransition(): { direction: Direction; slug: string } | null {
  return pending ? { direction: pending.direction, slug: pending.slug } : null;
}

/** Let the transition capture the new page. Returns false if none was waiting in that direction. */
export function resolveRouteTransition(direction: Direction): boolean {
  if (pending?.direction !== direction) return false;
  settle();
  return true;
}

/**
 * Resolve a waiting home transition that no row frame will claim (the project
 * has no frame on the homepage). Frames that exist claim it themselves.
 */
export function resolveUnclaimedHomeTransition(): void {
  if (pending?.direction !== "toHome" || findProjectFrame(pending.slug)) return;
  settle();
}

/** Run after the current transition (or now, if none is running). */
export function afterRouteTransition(callback: () => void): void {
  if (!active) {
    callback();
    return;
  }
  active.finished.catch(() => {}).finally(callback);
}

/** True once, on the page the fallback navigation lands on. */
export function consumeFallbackFade(): boolean {
  const fade = fallbackFade;
  fallbackFade = false;
  return fade;
}

/** Homepage row click: open the project page, morphing the frame if it is at full size. */
export function openProject(slug: string, navigate: () => void): void {
  const store = storage();
  store?.setItem(FROM_HOME_KEY, "1");
  store?.setItem(HOME_SCROLL_KEY, String(Math.round(window.scrollY)));
  const frame = findProjectFrame(slug);
  const anchor = frame?.closest<HTMLElement>(`[${MEDIA_ANCHOR_ATTR}]`);
  if (anchor) {
    store?.setItem(HOME_ROW_KEY, JSON.stringify({ slug, top: anchor.getBoundingClientRect().top }));
  } else {
    store?.removeItem(HOME_ROW_KEY);
  }
  begin("toProject", slug, navigate, frame && isFrameAtFullSize(frame) ? frame : null);
}

/** Back link without history to return to: go home (top of page) with a crossfade. */
export function goHome(slug: string, navigate: () => void): void {
  begin("toHome", slug, navigate, null);
}

/** Did this tab reach the project page from the homepage row? */
export function cameFromHome(): boolean {
  return storage()?.getItem(FROM_HOME_KEY) === "1";
}

/** True while the homepage is being re-entered with browser or Back-link history. */
export function isReturningHome(): boolean {
  return returningHome;
}

/** Put the homepage back at the row the user left from. Runs once per return. */
export function restoreHomeScroll(): void {
  if (!returningHome) return;
  returningHome = false;
  const store = storage();
  const saved = Number(store?.getItem(HOME_SCROLL_KEY));
  const hasSaved = Number.isFinite(saved) && saved > 0;
  const row = parseSavedRow(store?.getItem(HOME_ROW_KEY));
  const anchor = row
    ? findProjectFrame(row.slug)?.closest<HTMLElement>(`[${MEDIA_ANCHOR_ATTR}]`)
    : null;
  if (row && anchor) {
    // Taken at the top of the page, where no project stage is pinned.
    const rowScroll = documentTop(anchor) - row.top;
    // The same scrollY first (a pinned stage holds its frame still over a
    // range of scroll, which only the scrollY tells apart). If the row is not
    // where it was (content above skipped rendering and is not its real height
    // yet), put the clicked row's frame back where it was in the viewport.
    if (hasSaved) {
      window.scrollTo(0, saved);
      if (Math.abs(anchor.getBoundingClientRect().top - row.top) < 1) return;
    }
    window.scrollTo(0, rowScroll);
    return;
  }
  if (hasSaved) window.scrollTo(0, saved);
}

function parseSavedRow(raw: string | null | undefined): { slug: string; top: number } | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (
      typeof value === "object" &&
      value !== null &&
      "slug" in value &&
      "top" in value &&
      typeof value.slug === "string" &&
      typeof value.top === "number"
    ) {
      return { slug: value.slug, top: value.top };
    }
  } catch {
    // Unreadable: fall back to the saved scroll position.
  }
  return null;
}

/** Document top of an element from layout offsets (transforms ignored). */
export function documentTop(element: HTMLElement): number {
  let top = 0;
  let node: HTMLElement | null = element;
  while (node) {
    top += node.offsetTop;
    node = node.offsetParent instanceof HTMLElement ? node.offsetParent : null;
  }
  return top;
}

/** Called by the route listener after every navigation. */
export function setCurrentPath(path: string): void {
  currentPath = path;
  if (path === HOME_PATH) storage()?.removeItem(FROM_HOME_KEY);
}

/** Wrap browser Back/Forward between home and a project page in a transition. */
export function installPopstateRelay(): () => void {
  // The browser would otherwise restore the next entry's scroll on the page
  // being left, before popstate, so the old page would be captured at the
  // wrong position. The homepage scroll is restored here instead.
  const previousRestoration = window.history.scrollRestoration;
  window.history.scrollRestoration = "manual";

  const onPopState = (event: PopStateEvent) => {
    if (relayed.has(event)) return;
    const to = window.location.pathname;
    const fromSlug = projectSlugOf(currentPath);
    const toSlug = projectSlugOf(to);

    let direction: Direction | null = null;
    let slug: string | null = null;
    if (fromSlug && to === HOME_PATH) {
      direction = "toHome";
      slug = fromSlug;
      returningHome = true;
    } else if (currentPath === HOME_PATH && toSlug) {
      direction = "toProject";
      slug = toSlug;
    }
    if (!direction || !slug) return;

    if (!canMorph()) {
      fallbackFade = true;
      return;
    }

    // Hold the router back until the old page has been captured.
    event.stopImmediatePropagation();
    const frame = direction === "toProject" ? findProjectFrame(slug) : null;
    begin(
      direction,
      slug,
      () => {
        const relay = new PopStateEvent("popstate", { state: event.state });
        relayed.add(relay);
        window.dispatchEvent(relay);
      },
      frame && isFrameAtFullSize(frame) ? frame : null,
    );
  };

  window.addEventListener("popstate", onPopState);
  return () => {
    window.removeEventListener("popstate", onPopState);
    window.history.scrollRestoration = previousRestoration;
  };
}

/**
 * Transition CSS, rendered once in <head>. Generated (not in globals.css) so
 * the view transition pseudo-element selectors reach the browser untouched.
 * The class rules cover Chrome 125+ and Safari 18.2+; the per-name rules
 * cover browsers with view transitions but without view-transition-class.
 */
export function viewTransitionStyles(slugs: readonly string[]): string {
  const media =
    `animation-duration:${viewTransition.mediaDuration}ms;` +
    `animation-timing-function:${viewTransition.mediaEasing};`;
  const radius = `border-radius:${cardMorph.endRadius}px;overflow:clip;`;
  const groups = [`.${MEDIA_CLASS}`, ...slugs.map(projectMediaTransitionName)];

  const rules = groups.map(
    (group) =>
      `::view-transition-group(${group}){${media}${radius}}` +
      `::view-transition-old(${group}),::view-transition-new(${group}){${media}${radius}height:100%;object-fit:cover}`,
  );

  return (
    `.${MEDIA_CLASS}{view-transition-class:${MEDIA_CLASS}}` +
    `::view-transition-old(root),::view-transition-new(root){` +
    `animation-duration:${viewTransition.rootDuration}ms;animation-timing-function:${viewTransition.rootEasing}}` +
    rules.join("")
  );
}
