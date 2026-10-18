import type { LinkItem } from "@/types";

interface ConversationListProps {
  readonly items: readonly string[];
  readonly cta: LinkItem;
}

/** A plain list (no numbers, no markers), then an always-underlined email link 24px below. */
export function ConversationList({ items, cta }: ConversationListProps) {
  return (
    <>
      <ul className="list-none text-[15px] leading-[1.6] text-fg">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <a
        href={cta.href}
        className="relative mt-6 inline-block touch-manipulation text-[15px] leading-[1.6] text-fg underline decoration-1 underline-offset-[3px] after:absolute after:inset-x-0 after:-inset-y-2.5"
      >
        {cta.label}
      </a>
    </>
  );
}
