import type { HomeContent } from "@/types";
import { mailto } from "./site";

export const home: HomeContent = {
  meta: {
    title: "Philip Ondieki · Software Engineer",
    description:
      "Hard problems, simple products. Web apps that prioritise your needs and scale with your business.",
  },
  header: {
    homeLabel: "Philip Ondieki, home",
    headerName: "Philip Ondieki · Software Engineer",
    headerNameShort: "Philip Ondieki",
    contact: {
      label: "Contact",
      href: mailto,
    },
  },
  hero: {
    name: "Philip Ondieki",
    role: "Software Engineer",
    headline: "Hard problems, simple products",
    subtext: "Web apps that prioritise your needs and scale with your business",
  },
  strip: {
    label: "Selected work",
    items: [
      "EveShield",
      "NairobiAlert",
      "Insight AfriResearch",
      "Dual Scope Engineering",
      "Mkulima Sharp",
      "Webmerchants",
      "MamaShield",
      "Power Learn Project",
    ],
  },
  work: {
    label: "Selected work",
    cardLabel: "Scroll to selected work",
  },
  featuredProjectSlug: "siledge",
  notFound: {
    title: "Page not found",
    body: "This page does not exist, or it has moved.",
    homeLink: "Back to home",
  },
};
