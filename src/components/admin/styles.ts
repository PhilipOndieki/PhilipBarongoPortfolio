/** Shared class names for the admin pages. They follow the portfolio tokens. */
export const OK = "text-[#3FB27F]";

const base =
  "inline-flex min-h-11 touch-manipulation items-center justify-center rounded-md border px-[18px] text-[15px] transition-opacity duration-200 hover:opacity-75 disabled:pointer-events-none disabled:opacity-35";

export const btn = `${base} border-divider bg-tile text-fg`;

export const btnPrimary = `${base} border-fg bg-fg font-medium text-ink`;

export const btnGhost = `${base} border-divider bg-transparent text-muted`;

/** An unselected frequency preset. */
export const btnSeg = `${base} border-divider bg-tile text-muted`;

export const field =
  "min-h-11 rounded-md border border-divider bg-tile px-3 text-[15px] text-fg focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-fg";

export const chip =
  "whitespace-nowrap rounded-[3px] bg-chip px-2 py-[3px] text-[11px] font-medium text-tile-fg";
