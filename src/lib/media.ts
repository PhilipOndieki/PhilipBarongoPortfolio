import { MQ } from "@/lib/motion";
import type { BySize, MediaSize, ProjectMedia } from "@/types";

const MEDIA_ROOT = "/media";

/** Widths written by scripts/encode-media.sh. */
export const MEDIA_SIZES: readonly MediaSize[] = ["720", "1280"];

/** The media box is 16:9. These are the intrinsic size hints for <video> and <img>. */
export const MEDIA_BOX = { width: 1280, height: 720 } as const;

/** Width / height of the media box. */
export const MEDIA_ASPECT = MEDIA_BOX.width / MEDIA_BOX.height;

function bySize<T>(build: (size: MediaSize) => T): BySize<T> {
  return { "720": build("720"), "1280": build("1280") };
}

function mediaPath(slug: string, size: MediaSize, extension: "mp4" | "webp"): string {
  return `${MEDIA_ROOT}/${slug}/${slug}-${size}.${extension}`;
}

/** Every media path for a project, built from its slug. Paths are never typed by hand. */
export function getProjectMedia(slug: string): ProjectMedia {
  return {
    mp4: bySize((size) => mediaPath(slug, size, "mp4")),
    poster: bySize((size) => mediaPath(slug, size, "webp")),
  };
}

let chosenSize: MediaSize | undefined;

/**
 * The rendition for this page load: 1280 from 768px up, 720 below. Chosen once
 * (browser only) and then kept, so a resize never swaps the video.
 */
export function chooseMediaSize(): MediaSize {
  chosenSize ??= window.matchMedia(MQ.desktop).matches ? "1280" : "720";
  return chosenSize;
}
