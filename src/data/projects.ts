import { getProjectMedia } from "@/lib/media";
import type { Project, ProjectGroup, ProjectPageCopy } from "@/types";

/** Homepage groups, in display order. */
export const projectGroups: readonly ProjectGroup[] = [
  { id: "production", label: "Production websites" },
  { id: "hackathon", label: "Hackathons" },
];

/**
 * Every project, in display order within its group. A new project needs only
 * an entry here plus its media:
 *   1. put its source video (<slug>preview.*) and poster image (<slug>.png)
 *      in the repository root, or pass their paths to the encoder
 *   2. run `npm run media -- <slug> [video] [poster]`
 *   3. add the entry: pick a group and a reveal that no other row uses, and
 *      set `media: getProjectMedia("<slug>")` (or null for the placeholder).
 * The homepage row and /work/<slug> are built from it.
 */
export const projects: readonly Project[] = [
  {
    slug: "siledge",
    group: "production",
    reveal: "cardMorph",
    name: "Siledge",
    tagline: "Bearings to belts, one supplier online.",
    description:
      "Product website for a Nairobi supplier of bearings, seals, belts and automation systems",
    tags: ["Web Design", "Product Catalogue", "SEO"],
    caseTags: ["Web Design", "Product Catalogue", "SEO"],
    firstField: { label: "Client", value: "Siledge Industrial Solutions Ltd" },
    stack: ["Next.js", "TypeScript", "Tailwind CSS"],
    liveUrl: "https://siledge.co.ke",
    body: [
      "Siledge Industrial Solutions supplies factories and workshops in Kenya with bearings, oil seals, hydraulic and pneumatic seals, chains and sprockets, pulleys, belts and automation systems.",
      "The website puts that full range in one place. Buyers browse products by category, see what Siledge stocks, and reach the sales team in a few clicks.",
    ],
    media: null,
  },
  {
    slug: "afriresearch",
    group: "production",
    reveal: "curtain",
    name: "Insight AfriResearch",
    tagline: "One firm. Three disciplines. One site.",
    description:
      "Corporate platform for an HR, research and architecture consultancy serving 50+ organisations",
    tags: ["Web Design", "Next.js", "SEO"],
    caseTags: ["Web Design", "SEO", "CMS"],
    firstField: { label: "Client", value: "Insight AfriResearch" },
    stack: ["Next.js", "TypeScript", "PostgreSQL"],
    liveUrl: "https://www.insightafriresearch.com/",
    body: [
      "Insight AfriResearch is a Nairobi-based consultancy that works across HR, research and architecture. It serves more than 50 organisations in 12 Kenyan counties and 4 countries.",
      "I built a single platform that presents all three disciplines clearly. The site uses a type-safe Next.js architecture for speed and SEO, with PostgreSQL-backed content that the team updates without code.",
    ],
    media: getProjectMedia("afriresearch"),
  },
  {
    slug: "mkulima-sharp",
    group: "production",
    reveal: "tilt",
    name: "Mkulima Sharp",
    tagline: "From hatchery to checkout.",
    description: "Online shop for poultry farmers: chicks, birds, feeders and secure checkout",
    tags: ["E-commerce", "Checkout", "Inventory"],
    caseTags: ["E-commerce", "Checkout", "Inventory"],
    firstField: { label: "Client", value: "Mkulima Sharp" },
    stack: ["React", "Firebase", "Tailwind CSS"],
    liveUrl: "https://mkulima-sharp.vercel.app/",
    body: [
      "Mkulima Sharp sells to poultry farmers: day-old chicks, mature birds, feeders and farm accessories.",
      "Farmers browse what is in stock, add items to a cart and pay through a secure checkout. The team tracks inventory in the background, so customers only see what is available.",
    ],
    media: getProjectMedia("mkulima-sharp"),
  },
  {
    slug: "dual-scope",
    group: "production",
    reveal: "blinds",
    name: "Dual Scope Engineering",
    tagline: "Industrial parts, properly catalogued.",
    description:
      "Industrial parts catalogue with quote requests, an AI assistant and an admin dashboard",
    tags: ["Catalogue", "AI Assistant", "Admin"],
    caseTags: ["Catalogue", "AI Assistant", "Admin"],
    firstField: { label: "Client", value: "Dual Scope Engineering" },
    stack: ["React", "Firebase", "Gemini AI", "Paystack"],
    liveUrl: "https://dualscopeengineering.com",
    body: [
      "Dual Scope Engineering supplies industrial parts and equipment to businesses across Kenya.",
      "Customers search a full product catalogue, filter by category and request a quote in one step. An AI assistant answers product questions at any hour, and an admin dashboard lets the team manage products and quotes.",
    ],
    media: getProjectMedia("dual-scope"),
  },
  {
    slug: "webmerchants",
    group: "production",
    reveal: "iris",
    name: "Webmerchants",
    tagline: "Fixed price. Five weeks. Live.",
    description: "Agency site for bespoke websites, redesigns and SEO for Kenyan businesses",
    tags: ["Web Design", "Brand", "SEO"],
    caseTags: ["Web Design", "Brand", "SEO"],
    firstField: { label: "Client", value: "Webmerchants (own agency)" },
    stack: ["Next.js", "TypeScript", "Tailwind CSS"],
    liveUrl: "https://www.webmerchants.co.ke/",
    body: [
      "Webmerchants is my web design and digital marketing agency in Nairobi. It builds bespoke websites, redesigns and SEO for Kenyan businesses.",
      "The site explains each service in plain words, shows a fixed-price quote, and walks clients through a five-week delivery process. A WhatsApp button and enquiry prompts turn visits into conversations.",
    ],
    media: getProjectMedia("webmerchants"),
  },
  {
    slug: "eveshield",
    group: "hackathon",
    reveal: "counterSlide",
    name: "EveShield",
    tagline: "Safety, with a voice that answers.",
    description:
      "Women's safety platform with an AI chatbot and emergency response. Best Project in Africa, PowerHack 2025",
    tags: ["AI", "Safety", "Payments"],
    caseTags: ["AI", "Safety", "Payments"],
    firstField: { label: "Award", value: "PowerHack 2025, Best Project in Africa" },
    stack: ["React", "Firebase", "Gemini AI", "Paystack"],
    liveUrl: "https://eveshield.vercel.app/",
    body: [
      "EveShield is a safety and advocacy platform for women. It won Best Project in Africa at PowerHack 2025, run with the UN and Power Learn Project.",
      "An AI chatbot gives private, judgement-free guidance at any hour. One tap starts the emergency response flow, and a library of safety resources helps women plan ahead. Supporters can donate through secure payments.",
    ],
    media: getProjectMedia("eveshield"),
  },
  {
    slug: "nairobialert",
    group: "hackathon",
    reveal: "diagonalWipe",
    name: "NairobiAlert",
    tagline: "When the rain comes, the city reports.",
    description:
      "Real-time flood reporting for Nairobi residents, verified and mapped live. Best Project, Momentum 2026",
    tags: ["Real-time", "PWA", "Civic Tech"],
    caseTags: ["Real-time", "PWA", "Civic Tech"],
    firstField: { label: "Award", value: "Momentum Hackathon 2026, Best Project" },
    stack: ["React", "Vite", "Firebase"],
    liveUrl: "https://nairobialert2.vercel.app/",
    body: [
      "NairobiAlert helps Nairobi residents report floods and other incidents as they happen. It won Best Project at the Momentum Hackathon 2026.",
      "A resident sends a report from their phone, even on a weak connection. Admins verify each report, and it then appears on a live public map, so neighbours and responders can act fast.",
    ],
    media: getProjectMedia("nairobialert"),
  },
  {
    slug: "mamashield",
    group: "hackathon",
    reveal: "stack",
    name: "MamaShield",
    tagline: "Does a mother's education protect her child?",
    description:
      "Data dashboard on maternal education and child mortality across 77,381 Kenyan birth records. Best Project, GEGIS 2026",
    tags: ["Data", "Maps", "Public Health"],
    caseTags: ["Data", "Maps", "Public Health"],
    firstField: { label: "Award", value: "GEGIS Hackathon 2026, Best Project" },
    stack: ["Python", "Streamlit", "GeoPandas", "Plotly"],
    liveUrl: "https://mamashield.streamlit.app/",
    body: [
      "MamaShield asks one question: does a mother's education reduce child mortality in Kenya's high-malaria and remote zones? It won Best Project at the GEGIS Hackathon 2026.",
      "The dashboard analyses 77,381 birth records from Kenya's Demographic and Health Survey. Interactive county maps and charts show where risk is highest, and the findings turn into clear policy insights.",
    ],
    media: null,
  },
  // A new project needs no component changes. After `npm run media -- <slug>`:
  //
  // {
  //   slug: "new-project",
  //   group: "production",
  //   reveal: "curtain", // pick one no other row uses, or add an effect in src/lib/reveals
  //   name: "New Project",
  //   tagline: "One line that sells it.",
  //   description: "What it is, for whom, in one or two lines",
  //   tags: ["Web Design", "SEO"],
  //   caseTags: ["Web Design", "SEO"],
  //   firstField: { label: "Client", value: "Client name" },
  //   stack: ["Next.js", "TypeScript"],
  //   liveUrl: "https://example.com/",
  //   body: ["What the app does.", "Who it helps, and how."],
  //   media: getProjectMedia("new-project"), // or null for the placeholder
  // },
];

export const projectPageCopy: ProjectPageCopy = {
  stack: "Stack",
  link: "Link",
  liveLabel: "Live Site",
  back: "Back",
  viewProject: "View project",
  opensInNewTab: "(opens in a new tab)",
  playVideo: "Play video",
  pauseVideo: "Pause video",
  previewComingSoon: "Preview coming soon",
  titleSuffix: "Philip Ondieki",
};

export const getProject = (slug: string): Project | undefined =>
  projects.find((project) => project.slug === slug);

export const projectHref = (slug: string): string => `/work/${slug}`;
