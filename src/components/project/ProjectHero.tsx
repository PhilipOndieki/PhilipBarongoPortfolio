import { Container } from "@/components/layout/Container";
import type { Project, ProjectPageCopy } from "@/types";
import { BackLink } from "./BackLink";
import { ProjectVideo } from "./ProjectVideo";

interface ProjectHeroProps {
  readonly project: Project;
  readonly copy: ProjectPageCopy;
}

/** Back link, then the media filling the rest of the first screen. */
export function ProjectHero({ project, copy }: ProjectHeroProps) {
  return (
    <Container className="pt-[calc(var(--header-h)+env(safe-area-inset-top))]">
      <div className="mt-4">
        <BackLink label={copy.back} slug={project.slug} />
      </div>
      <ProjectVideo
        slug={project.slug}
        media={project.media}
        name={project.name}
        labels={{
          play: copy.playVideo,
          pause: copy.pauseVideo,
          placeholder: copy.previewComingSoon,
        }}
        className="mt-4"
      />
    </Container>
  );
}
