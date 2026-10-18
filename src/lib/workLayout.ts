import type { Project, ProjectGroup } from "@/types";

/** One homepage stage: a project, with its group's header if it opens the group. */
export interface WorkStage {
  readonly project: Project;
  readonly group: ProjectGroup | null;
}

/** Projects in group order, then data order. Each group's first project carries its header. */
export function buildWorkStages(
  groups: readonly ProjectGroup[],
  projects: readonly Project[],
): WorkStage[] {
  return groups.flatMap((group) =>
    projects
      .filter((project) => project.group === group.id)
      .map((project, index) => ({ project, group: index === 0 ? group : null })),
  );
}
