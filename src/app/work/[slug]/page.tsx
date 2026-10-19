import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { RouteFade } from "@/components/motion/RouteFade";
import { ProjectHero } from "@/components/project/ProjectHero";
import { ProjectInfo } from "@/components/project/ProjectInfo";
import { home } from "@/data/home";
import { getProject, projectPageCopy, projects } from "@/data/projects";
import { BACK_LINK_ID } from "@/lib/anchors";

interface ProjectPageProps {
  readonly params: Promise<{ slug: string }>;
}

// Every project is pre-rendered; any other slug is a 404.
export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return projects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  const title = `${project.name} · ${projectPageCopy.titleSuffix}`;
  return {
    title,
    description: project.tagline,
    openGraph: {
      title,
      description: project.tagline,
      images: project.media ? [{ url: project.media.cover["1280"] }] : undefined,
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <>
      <Header content={home.header} triggerId={BACK_LINK_ID} />
      <RouteFade>
        <ProjectHero project={project} copy={projectPageCopy} />
        <ProjectInfo project={project} copy={projectPageCopy} />
      </RouteFade>
    </>
  );
}
