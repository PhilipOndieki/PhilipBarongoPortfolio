/** DOM ids shared between components that observe or target each other. */
export const HERO_NAME_ID = "hero-name";

/** Id of a project's row, the target of the preview card. */
export const projectAnchorId = (slug: string): string => `project-${slug}`;

/** The Back link on project pages: the header name types in once it passes under the header. */
export const BACK_LINK_ID = "back-link";

/** View transition name shared by a project's homepage frame and its project page media. */
export const projectMediaTransitionName = (slug: string): string => `project-media-${slug}`;

/** Marks a project's homepage media frame, so a click can find it to name it. */
export const PROJECT_MEDIA_ATTR = "data-project-media";

/** Marks a homepage media frame's layout box (untransformed), for row-relative scroll restoration. */
export const MEDIA_ANCHOR_ATTR = "data-media-anchor";
