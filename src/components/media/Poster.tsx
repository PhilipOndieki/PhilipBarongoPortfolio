import { MQ } from "@/lib/motion";
import type { ProjectMedia } from "@/types";

interface PosterProps {
  readonly media: ProjectMedia;
  readonly width: number;
  readonly height: number;
  readonly loading: "eager" | "lazy";
  /** The page's main image (its LCP): fetch it ahead of other images. */
  readonly priority?: boolean;
  readonly className?: string;
}

/**
 * A project's poster: 720px below 768px, 1280px above. The preview card and
 * the project frame both use it, so they show the same file and the same crop.
 * It renders with the HTML, before hydration.
 */
export function Poster({
  media,
  width,
  height,
  loading,
  priority = false,
  className = "",
}: PosterProps) {
  return (
    <picture>
      <source media={MQ.desktop} srcSet={media.poster["1280"]} />
      <img
        src={media.poster["720"]}
        alt=""
        width={width}
        height={height}
        loading={loading}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className={className}
      />
    </picture>
  );
}
