/** Video rendition widths produced by `npm run media`. */
export type MediaSize = "720" | "1280";

export type BySize<T> = Readonly<Record<MediaSize, T>>;

/** Cover image widths (16:9 WebP). */
export type CoverSize = "720" | "1280" | "2560";

export interface ProjectMedia {
  /** The laptop cover: homepage row, preview card, and the project page's bottom layer. */
  readonly cover: Readonly<Record<CoverSize, string>>;
  /** The preview video for the project page, or null when there is none. */
  readonly video: { readonly mp4: BySize<string> } | null;
}

/** The homepage groups, in data order. */
export type ProjectGroupId = "production" | "hackathon";

export interface ProjectGroup {
  readonly id: ProjectGroupId;
  readonly label: string;
}

/**
 * How a project's homepage frame enters on scroll. "cardMorph" is the
 * featured project's morph from the preview card (one project only); the
 * others come from the reveal registry in src/lib/reveals.
 */
export type RevealName =
  "cardMorph" | "curtain" | "tilt" | "blinds" | "iris" | "counterSlide" | "diagonalWipe" | "stack";

export type FrameRevealName = Exclude<RevealName, "cardMorph">;

/** The first field on the project page: Client for production work, Award for hackathons. */
export interface FirstField {
  readonly label: string;
  readonly value: string;
}

export interface Project {
  /** The /work/<slug> route, and the media folder and file prefix under /public/media. */
  readonly slug: string;
  readonly group: ProjectGroupId;
  readonly reveal: RevealName;
  readonly name: string;
  readonly tagline: string;
  /** Homepage row: short description (max 2 lines) and tags. */
  readonly description: string;
  readonly tags: readonly string[];
  /** Project page. The body says what the app does and who it helps. */
  readonly firstField: FirstField;
  readonly stack: readonly string[];
  readonly liveUrl: string;
  readonly caseTags: readonly string[];
  readonly body: readonly string[];
  /** Encoded preview media, or null for the "Preview coming soon" placeholder. */
  readonly media: ProjectMedia | null;
}

/** Labels and accessible text for the project pages. */
export interface ProjectPageCopy {
  readonly stack: string;
  readonly link: string;
  readonly liveLabel: string;
  readonly back: string;
  /** Media link label prefix on the homepage: "<viewProject>: <name>". */
  readonly viewProject: string;
  readonly opensInNewTab: string;
  readonly playVideo: string;
  /** Cover image alt text after the project name: "<name> website shown on a laptop". */
  readonly coverAlt: string;
  /** Placeholder line under the project name when there is no media yet. */
  readonly previewComingSoon: string;
  readonly pauseVideo: string;
  /** Appended to the project name in the page title. */
  readonly titleSuffix: string;
}

export interface LinkItem {
  readonly label: string;
  readonly href: string;
}

export interface MetaContent {
  readonly title: string;
  readonly description: string;
}

export interface HeaderContent {
  readonly homeLabel: string;
  readonly headerName: string;
  readonly headerNameShort: string;
  readonly contact: LinkItem;
}

export interface HeroContent {
  readonly name: string;
  readonly role: string;
  readonly headline: string;
  readonly subtext: string;
}

export interface StripContent {
  readonly label: string;
  readonly items: readonly string[];
}

export interface WorkContent {
  readonly label: string;
  /** Accessible label prefix for the preview card: "<cardLabel>: <project name>". */
  readonly cardLabel: string;
}

export interface NotFoundContent {
  readonly title: string;
  readonly body: string;
  readonly homeLink: string;
}

export interface HomeContent {
  readonly meta: MetaContent;
  readonly header: HeaderContent;
  readonly hero: HeroContent;
  readonly strip: StripContent;
  readonly work: WorkContent;
  /** The project the first-screen preview card points to. */
  readonly featuredProjectSlug: string;
  readonly notFound: NotFoundContent;
}

/** Site-wide facts shared by the header, About and footer. */
export interface SiteContent {
  readonly email: string;
  /** Fixed in data so the static export never depends on the build date. */
  readonly copyrightYear: number;
  readonly footer: {
    readonly emailLabel: string;
    readonly copyrightSymbol: string;
  };
}

export interface AboutFocusColumn {
  readonly heading: string;
  readonly items: readonly string[];
}

export interface AboutEngagement {
  readonly name: string;
  readonly work: string;
}

/** Every string in the homepage About section. */
export interface AboutContent {
  readonly sectionLabel: string;
  readonly about: {
    readonly label: string;
    readonly intro: string;
    readonly paragraphs: readonly string[];
  };
  readonly focus: {
    readonly label: string;
    readonly columns: readonly AboutFocusColumn[];
  };
  readonly engagements: {
    readonly label: string;
    readonly rows: readonly AboutEngagement[];
  };
  readonly recognition: {
    readonly label: string;
    readonly text: string;
  };
  readonly connect: {
    readonly label: string;
    /** http(s) links open in a new tab; mailto does not. */
    readonly links: readonly LinkItem[];
    readonly opensInNewTab: string;
  };
  readonly conversations: {
    readonly label: string;
    readonly items: readonly string[];
    readonly cta: LinkItem;
  };
  readonly location: {
    readonly label: string;
    readonly place: string;
    /** IANA time zone the clock shows, whatever the visitor's own. */
    readonly timeZone: string;
    /** Accessible name prefix: "<clockLabel>: HH:MM". */
    readonly clockLabel: string;
  };
}
