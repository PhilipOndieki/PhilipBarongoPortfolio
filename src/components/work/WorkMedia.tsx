import { MediaPlaceholder } from "@/components/media/MediaPlaceholder";
import { Poster } from "@/components/media/Poster";
import { CardMorph } from "@/components/motion/CardMorph";
import { projectPageCopy } from "@/data/projects";
import { revealMotionQuery } from "@/lib/reveals";
import type { Project } from "@/types";
import { ProjectLink } from "./ProjectLink";
import { RevealFrame } from "./RevealFrame";

interface WorkMediaProps {
  readonly project: Project;
  readonly href: string;
  /** Accessible name of the media link. */
  readonly label: string;
  /** Placeholder line when the project has no media yet. */
  readonly placeholderLabel: string;
  readonly className?: string;
}

/** Full width below 768px; from there, the media column (viewport less the 420px column and gutters). */
const ROW_COVER_SIZES = "(max-width: 767px) 100vw, calc(100vw - 460px)";

/**
 * The row's media frame, as a link to the project page, showing the project's
 * laptop cover (no video on the homepage). The featured project morphs from
 * the preview card, so its cover loads at once; every other row gets its own
 * reveal effect and loads its cover lazily.
 */
export function WorkMedia({
  project,
  href,
  label,
  placeholderLabel,
  className = "",
}: WorkMediaProps) {
  const { slug, reveal, media, name } = project;
  const gateQuery = revealMotionQuery(reveal);

  const featured = reveal === "cardMorph";

  const content = media ? (
    <Poster
      media={media}
      sizes={ROW_COVER_SIZES}
      loading={featured ? "eager" : "lazy"}
      priority={featured}
      alt={`${name} ${projectPageCopy.coverAlt}`}
      className="absolute inset-0 h-full w-full"
    />
  ) : (
    <MediaPlaceholder name={name} label={placeholderLabel} />
  );

  return (
    <ProjectLink
      slug={slug}
      href={href}
      ariaLabel={label}
      gateQuery={gateQuery}
      className={`block ${className}`}
    >
      {featured ? (
        <CardMorph slug={slug} enabled>
          {content}
        </CardMorph>
      ) : (
        <RevealFrame slug={slug} reveal={reveal}>
          {content}
        </RevealFrame>
      )}
    </ProjectLink>
  );
}
