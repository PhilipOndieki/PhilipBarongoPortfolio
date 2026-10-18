import { Container } from "@/components/layout/Container";
import { FadeIn } from "@/components/motion/FadeIn";
import { ProjectTags } from "@/components/work/ProjectTags";
import type { Project, ProjectPageCopy } from "@/types";

interface ProjectInfoProps {
  readonly project: Project;
  readonly copy: ProjectPageCopy;
}

function ExternalArrow() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M2.5 7.5 8 2M3.5 2H8v4.5" />
    </svg>
  );
}

const label = "text-[15px] leading-[1.6] text-muted";
const value = "mt-1 text-[15px] leading-[1.6] text-fg";

/** Name, tagline, fields and chips on the left; the story on the right. */
export function ProjectInfo({ project, copy }: ProjectInfoProps) {
  return (
    <Container className="mt-14 grid grid-cols-1 gap-y-10 md:mt-24 md:grid-cols-2 md:gap-0">
      <div>
        <FadeIn index={0}>
          <h1 className="text-[20px] leading-[1.4] font-normal text-fg">{project.name}</h1>
          <p className="mt-0.5 text-[15px] leading-[1.6] text-fg">{project.tagline}</p>
        </FadeIn>

        <dl className="mt-8 flex flex-col gap-6">
          <FadeIn index={1}>
            <dt className={label}>{project.firstField.label}</dt>
            <dd className={value}>{project.firstField.value}</dd>
          </FadeIn>
          <FadeIn index={2}>
            <dt className={label}>{copy.stack}</dt>
            <dd className={value}>
              <ul>
                {project.stack.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </dd>
          </FadeIn>
          <FadeIn index={3}>
            <dt className={label}>{copy.link}</dt>
            <dd className={value}>
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative inline-flex items-center gap-1 decoration-1 underline-offset-[3px] after:absolute after:inset-x-0 after:-inset-y-2.5 hover:underline"
              >
                {copy.liveLabel}
                <ExternalArrow />
                <span className="sr-only">{copy.opensInNewTab}</span>
              </a>
            </dd>
          </FadeIn>
        </dl>

        <FadeIn index={4} className="mt-7">
          <ProjectTags tags={project.caseTags} reveal={false} />
        </FadeIn>
      </div>

      <div className="flex max-w-[420px] flex-col gap-4">
        {project.body.map((paragraph, index) => (
          <FadeIn key={paragraph} index={index}>
            <p className="text-[15px] leading-[1.6] text-fg">{paragraph}</p>
          </FadeIn>
        ))}
      </div>
    </Container>
  );
}
