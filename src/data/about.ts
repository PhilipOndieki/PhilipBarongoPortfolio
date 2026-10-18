import type { AboutContent } from "@/types";
import { mailto } from "./site";

export const about: AboutContent = {
  sectionLabel: "About",
  about: {
    label: "About",
    intro:
      "I'm Philip, a software engineer in Nairobi. I turn hard problems into simple, reliable web products for businesses, startups and communities.",
    paragraphs: [
      "I build full-stack web apps: online shops, payment flows, real-time systems and data dashboards. My work sits where speed, trust and clear design all matter.",
      "I often start from zero and take an idea to a live product. Just as often, I join to fix or finish something that is close but not quite working.",
      "My approach is hands-on. I work closely with founders and teams, ship in small steps, and build systems that are easy to run and maintain.",
      "I also run Webmerchants, my web design and digital marketing agency, so I understand the business side of every build.",
    ],
  },
  focus: {
    label: "Focus",
    columns: [
      {
        heading: "Frontend",
        items: [
          "Next.js + React",
          "TypeScript",
          "Tailwind CSS",
          "Responsive + Accessible UI",
          "Performance + SEO",
        ],
      },
      {
        heading: "Backend",
        items: ["Node.js + Express", "Rust Services", "REST + WebSocket APIs", "Auth + Payments"],
      },
      {
        heading: "Data + Infra",
        items: ["PostgreSQL", "MongoDB", "Firebase", "Docker", "Python Dashboards"],
      },
    ],
  },
  engagements: {
    label: "Recent engagements",
    rows: [
      { name: "Prop Firm Trading Simulator", work: "Rust, Real-time Systems" },
      { name: "Siledge", work: "Website Build" },
      { name: "Insight AfriResearch", work: "Website Build" },
      { name: "Dual Scope Engineering", work: "Full-Stack Developer, IT Systems" },
      { name: "Webmerchants", work: "Founder, Web Build" },
      { name: "Muva Technologies", work: "Backend Developer" },
    ],
  },
  recognition: {
    label: "Recognised by",
    text: "Power Learn Project, United Nations (PowerHack), Momentum Hackathon, GEGIS Hackathon, Harvard CS50",
  },
  connect: {
    label: "Connect",
    links: [
      { label: "Email", href: mailto },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/philip-barongo-8b215028a" },
      { label: "X.com", href: "https://x.com/philoloke" },
      { label: "GitHub", href: "https://github.com/PhilipOndieki" },
      { label: "WhatsApp", href: "https://wa.me/254703141296" },
    ],
    opensInNewTab: "(opens in a new tab)",
  },
  conversations: {
    label: "Open to conversations with",
    items: [
      "Startups that need a full-stack engineer.",
      "Businesses in Kenya and Africa that need a fast, reliable website.",
      "Teams building real-time, fintech or civic products.",
      "Full-time and contract engineering roles.",
    ],
    cta: { label: "If that sounds like you, drop me a line", href: mailto },
  },
  location: {
    label: "Location",
    place: "Nairobi, Kenya",
    timeZone: "Africa/Nairobi",
    clockLabel: "Current time in Nairobi",
  },
};
