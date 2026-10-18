import type { LinkItem } from "@/types";

interface ConnectListProps {
  readonly links: readonly LinkItem[];
  /** Screen reader note after links that open a new tab. */
  readonly opensInNewTab: string;
}

const isExternal = (href: string): boolean => /^https?:\/\//.test(href);

/**
 * Contact links, 6px apart, each with a 44px tall hit area. Web links open in
 * a new tab; email opens the mail app in place.
 */
export function ConnectList({ links, opensInNewTab }: ConnectListProps) {
  return (
    <ul className="flex flex-col gap-1.5 text-[15px] leading-[1.6] text-fg">
      {links.map((link) => {
        const external = isExternal(link.href);
        return (
          <li key={link.href}>
            <a
              href={link.href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className="relative inline-block touch-manipulation decoration-1 underline-offset-[3px] after:absolute after:inset-x-0 after:-inset-y-2.5 hover:underline"
            >
              {link.label}
              {external ? <span className="sr-only">{` ${opensInNewTab}`}</span> : null}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
