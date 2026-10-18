import type { SiteContent } from "@/types";

export const site: SiteContent = {
  email: "philipbarongo30@gmail.com",
  copyrightYear: 2026,
  footer: {
    emailLabel: "Email me",
    copyrightSymbol: "©",
  },
};

export const mailto = `mailto:${site.email}`;
