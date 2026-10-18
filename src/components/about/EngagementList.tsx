import { DrawLine } from "@/components/motion/DrawLine";
import { FadeIn } from "@/components/motion/FadeIn";
import type { AboutEngagement } from "@/types";

interface EngagementListProps {
  readonly rows: readonly AboutEngagement[];
}

/**
 * One row per engagement, a line under each and one over the first. From
 * 768px: 45px rows, the name in a fixed 30% column, the work beside it. On
 * mobile the work sits under the name.
 */
export function EngagementList({ rows }: EngagementListProps) {
  return (
    <ul className="text-[15px] leading-[1.6]">
      {rows.map((row, index) => (
        <li key={row.name} className="relative">
          {index === 0 ? <DrawLine className="absolute inset-x-0 top-0" /> : null}
          <FadeIn
            index={index}
            timing="about"
            className="flex flex-col gap-0.5 py-3 md:min-h-[45px] md:flex-row md:items-center md:gap-0 md:py-2.5"
          >
            <span className="text-fg md:w-[30%] md:shrink-0 md:pr-4">{row.name}</span>
            <span className="text-muted">{row.work}</span>
          </FadeIn>
          <DrawLine className="absolute inset-x-0 bottom-0" />
        </li>
      ))}
    </ul>
  );
}
