import { DrawLine } from "@/components/motion/DrawLine";
import { mailto, site } from "@/data/site";

/**
 * Every page's footer: a split divider (two halves, 16px apart, the right one
 * drawing just after the left), then "Email me" and the copyright year. The
 * year comes from data, so the static export never changes with the date.
 */
export function Footer() {
  return (
    <footer className="gutter-x mt-24 pb-[calc(40px+env(safe-area-inset-bottom))]">
      <div className="flex gap-4">
        <DrawLine className="flex-1" />
        <DrawLine segment={1} className="flex-1" />
      </div>
      <div className="flex items-baseline justify-between pt-5 text-[15px] leading-[1.6]">
        <a
          href={mailto}
          className="relative touch-manipulation text-fg decoration-1 underline-offset-[3px] after:absolute after:inset-x-0 after:-inset-y-2.5 hover:underline"
        >
          {site.footer.emailLabel}
        </a>
        <p className="text-right text-muted">
          {site.footer.copyrightSymbol}
          {site.copyrightYear}
        </p>
      </div>
    </footer>
  );
}
