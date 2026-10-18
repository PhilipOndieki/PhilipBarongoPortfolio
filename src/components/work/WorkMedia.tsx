import { LazyVideo } from "@/components/media/LazyVideo";
import { MediaPlaceholder } from "@/components/media/MediaPlaceholder";
import { CardMorph } from "@/components/motion/CardMorph";
import { MEDIA_BOX } from "@/lib/media";
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

/**
 * The row's media frame, as a link to the project page. The featured project
 * morphs from the preview card; every other row gets its own reveal effect.
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

  const content = media ? (
    <LazyVideo
      slug={slug}
      media={media}
      width={MEDIA_BOX.width}
      height={MEDIA_BOX.height}
      gateQuery={gateQuery}
      eagerPoster={reveal === "cardMorph"}
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
      {reveal === "cardMorph" ? (
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
