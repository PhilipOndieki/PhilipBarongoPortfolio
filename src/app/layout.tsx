import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { RouteTransitions } from "@/components/layout/RouteTransitions";
import { home } from "@/data/home";
import { projects } from "@/data/projects";
import { motionStyles } from "@/lib/motion";
import { siteUrl } from "@/lib/site";
import { viewTransitionStyles } from "@/lib/viewTransition";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: home.meta.title,
  description: home.meta.description,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
  colorScheme: "dark",
};

interface RootLayoutProps {
  readonly children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: motionStyles() }} />
        <style
          dangerouslySetInnerHTML={{
            __html: viewTransitionStyles(projects.map(({ slug }) => slug)),
          }}
        />
        <noscript>
          <style>
            {
              ".reveal-line>*,.reveal-chip{transform:none;opacity:1}.draw-line{transform:none}.morph-lift{visibility:visible!important}.fade-in::after{display:none}"
            }
          </style>
        </noscript>
      </head>
      <body className="bg-ink font-sans text-fg">
        <RouteTransitions />
        {children}
        <Footer />
      </body>
    </html>
  );
}
