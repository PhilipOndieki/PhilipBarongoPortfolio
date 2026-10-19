import { COVER_BOX, COVER_SIZES, coverSrcSet } from "@/lib/media";
import type { CoverSize, ProjectMedia } from "@/types";

interface PosterProps {
  readonly media: ProjectMedia;
  /** The sizes attribute: how wide the image shows at each viewport. */
  readonly sizes: string;
  /** Cover widths offered in the srcset (all three by default). */
  readonly widths?: readonly CoverSize[];
  readonly loading: "eager" | "lazy";
  /** The page's main image (its LCP): fetch it ahead of other images. */
  readonly priority?: boolean;
  readonly alt?: string;
  readonly className?: string;
}

/**
 * A project's laptop cover (16:9 WebP). A plain <img> with a srcset, since the
 * static export has no image server. The homepage row, the preview card and
 * the project page's bottom layer all use it with object-fit cover, centred,
 * so they show the same crop. It renders with the HTML, before hydration.
 */
export function Poster({
  media,
  sizes,
  widths = COVER_SIZES,
  loading,
  priority = false,
  alt = "",
  className = "",
}: PosterProps) {
  return (
    // A plain <img> by design: the static export has no image optimisation server.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={media.cover[widths[0] ?? "720"]}
      srcSet={coverSrcSet(media, widths)}
      sizes={sizes}
      alt={alt}
      width={COVER_BOX.width}
      height={COVER_BOX.height}
      loading={loading}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      className={`object-cover object-center ${className}`}
    />
  );
}
