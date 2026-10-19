import { MQ } from "@/lib/motion";
import type { BySize, CoverSize, MediaSize, ProjectMedia } from "@/types";

const MEDIA_ROOT = "/media";

/** Video widths written by scripts/encode-media.sh. */
export const MEDIA_SIZES: readonly MediaSize[] = ["720", "1280"];

/** Cover widths, in srcset order. */
export const COVER_SIZES: readonly CoverSize[] = ["720", "1280", "2560"];

/** The media box is 16:9. These are the intrinsic size hints for <video>. */
export const MEDIA_BOX = { width: 1280, height: 720 } as const;

/** Intrinsic size of the largest cover, for the <img> width and height. */
export const COVER_BOX = { width: 2560, height: 1440 } as const;

/** Width / height of the media box. */
export const MEDIA_ASPECT = MEDIA_BOX.width / MEDIA_BOX.height;

function bySize<T>(build: (size: MediaSize) => T): BySize<T> {
  return { "720": build("720"), "1280": build("1280") };
}

function videoPath(slug: string, size: MediaSize): string {
  return `${MEDIA_ROOT}/${slug}/${slug}-${size}.mp4`;
}

function coverPath(slug: string, size: CoverSize): string {
  return `${MEDIA_ROOT}/work/${slug}/${slug}-cover-${size}.webp`;
}

/**
 * Every media path for a project, built from its slug. Paths are never typed
 * by hand. Pass `{ video: false }` for a project with a cover but no video.
 */
export function getProjectMedia(slug: string, { video = true } = {}): ProjectMedia {
  return {
    cover: {
      "720": coverPath(slug, "720"),
      "1280": coverPath(slug, "1280"),
      "2560": coverPath(slug, "2560"),
    },
    video: video ? { mp4: bySize((size) => videoPath(slug, size)) } : null,
  };
}

/** A srcset of the given cover widths. */
export function coverSrcSet(
  media: ProjectMedia,
  sizes: readonly CoverSize[] = COVER_SIZES,
): string {
  return sizes.map((size) => `${media.cover[size]} ${size}w`).join(", ");
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
