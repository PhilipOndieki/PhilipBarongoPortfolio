import type { CSSProperties, ReactNode } from "react";
import { DrawLine } from "@/components/motion/DrawLine";
import { MaskReveal } from "@/components/motion/MaskReveal";
import { projectHref, projectPageCopy } from "@/data/projects";
import { projectAnchorId } from "@/lib/anchors";
import { reveal } from "@/lib/motion";
import { revealMotionQuery } from "@/lib/reveals";
import type { Project } from "@/types";
import { ProjectLink } from "./ProjectLink";
import { ProjectTags } from "./ProjectTags";
import { WorkMedia } from "./WorkMedia";

interface WorkRowProps {
  readonly project: Project;
  /** Position in the stack: later stages sit above earlier ones. */
  readonly index: number;
  /** The group header, when this project opens its group. */
  readonly header?: ReactNode;
}

const order = (position: number): CSSProperties => ({ "--i": position }) as CSSProperties;

/**
 * One project as a stage: pinned under the header (see WorkStack), opaque,
 * with the row centred in it: divider and text on the left, the media frame
 * on the right.
 */
export function WorkRow({ project, index, header }: WorkRowProps) {
  const href = projectHref(project.slug);
  // The card-morph stage's frame draws over the hero while it morphs, which
  // paint containment would clip, so it is never deferred.
  const deferRender = project.reveal !== "cardMorph";

  return (
    <div
      id={projectAnchorId(project.slug)}
      data-stage={project.slug}
      // Stages below the first screen skip rendering until they come near.
      className={`work-stage ${deferRender ? "work-row-deferred" : ""}`}
      style={{ zIndex: index + 1 }}
    >
      <div className="gutter-x">
        {header}
        <MaskReveal
          slug={project.slug}
          gateQuery={revealMotionQuery(project.reveal)}
          className="work-row"
        >
          <DrawLine className="[grid-area:line] md:mr-4" />

          <WorkMedia
            project={project}
            href={href}
            label={`${projectPageCopy.viewProject}: ${project.name}`}
            placeholderLabel={projectPageCopy.previewComingSoon}
            className="mt-4 [grid-area:media] md:mt-0"
          />

          <div className="mt-4 [grid-area:text] md:mt-0 md:self-end">
            {/* The mask is an inner span so the link's 44px hit area (::after, placed
            against the h3) is not clipped by it once the line has revealed. */}
            <h3 className="relative w-fit text-[15px] leading-[1.6] font-normal text-fg">
              <span className="reveal-line block">
                <ProjectLink
                  slug={project.slug}
                  href={href}
                  className="w-fit after:absolute after:inset-x-0 after:-inset-y-2.5"
                  style={order(reveal.order.name)}
                >
                  {project.name}
                </ProjectLink>
              </span>
            </h3>
            <p className="reveal-line text-[15px] leading-[1.6] text-fg">
              <span style={order(reveal.order.tagline)}>{project.tagline}</span>
            </p>
            <p className="reveal-line max-w-[340px] text-[15px] leading-[1.6] text-muted">
              <span className="line-clamp-2" style={order(reveal.order.description)}>
                {project.description}
              </span>
            </p>
            <ProjectTags tags={project.tags} className="mt-[14px]" />
          </div>
        </MaskReveal>
      </div>
    </div>
  );
}
