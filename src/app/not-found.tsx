import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Container } from "@/components/layout/Container";
import { home } from "@/data/home";

export const metadata: Metadata = {
  title: `${home.notFound.title} · ${home.hero.name}`,
};

/** Unknown routes (including unknown /work/<slug>), in the site's own style. */
export default function NotFound() {
  return (
    <>
      <Header content={home.header} />
      <main>
        <Container className="pt-[calc(var(--header-h)+env(safe-area-inset-top)+120px)]">
          <h1 className="text-[20px] leading-[1.4] font-normal text-fg">{home.notFound.title}</h1>
          <p className="mt-0.5 text-[15px] leading-[1.6] text-muted">{home.notFound.body}</p>
          <Link
            href="/"
            className="mt-6 inline-flex h-11 touch-manipulation items-center text-[15px] text-fg transition-opacity duration-200 hover:opacity-60"
          >
            {home.notFound.homeLink}
          </Link>
        </Container>
      </main>
    </>
  );
}
