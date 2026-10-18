import { AboutSection } from "@/components/about/AboutSection";
import { Hero } from "@/components/hero/Hero";
import { Header } from "@/components/layout/Header";
import { RouteFade } from "@/components/motion/RouteFade";
import { GroupHeader } from "@/components/work/GroupHeader";
import { WorkRow } from "@/components/work/WorkRow";
import { WorkStack } from "@/components/work/WorkStack";
import { about } from "@/data/about";
import { home } from "@/data/home";
import { getProject, projectGroups, projectPageCopy, projects } from "@/data/projects";
import { buildWorkStages } from "@/lib/workLayout";

const featured = getProject(home.featuredProjectSlug);
const stages = buildWorkStages(projectGroups, projects);

export default function HomePage() {
  return (
    <>
      <Header content={home.header} />
      <RouteFade>
        <Hero
          content={home.hero}
          strip={home.strip}
          featured={featured}
          cardLabel={home.work.cardLabel}
          placeholderLabel={projectPageCopy.previewComingSoon}
        />
        <section aria-label={home.work.label}>
          <WorkStack>
            {stages.map(({ project, group }, index) => (
              <WorkRow
                key={project.slug}
                project={project}
                index={index}
                header={group ? <GroupHeader label={group.label} /> : undefined}
              />
            ))}
          </WorkStack>
        </section>
        <AboutSection content={about} />
      </RouteFade>
    </>
  );
}
