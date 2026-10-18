import { DrawLine } from "@/components/motion/DrawLine";
import { FadeIn } from "@/components/motion/FadeIn";
import { MQ } from "@/lib/motion";
import type { AboutFocusColumn } from "@/types";

interface FocusColumnsProps {
  readonly columns: readonly AboutFocusColumn[];
}

/**
 * Three equal columns, each with its own line on top. Side by side from
 * 1024px, the lines continue the block's divider as later segments of one
 * stroke. Narrower, the columns stack 32px apart.
 */
export function FocusColumns({ columns }: FocusColumnsProps) {
  return (
    <div className="flex flex-col gap-8 lg:grid lg:grid-cols-3 lg:gap-x-4 lg:gap-y-0">
      {columns.map((column, index) => (
        <div key={column.heading}>
          <DrawLine segment={index + 1} segmentQuery={MQ.wide} />
          <FadeIn index={index} timing="about" className="pt-5">
            <h3 className="text-[15px] leading-[1.6] font-normal text-muted">{column.heading}</h3>
            <ul className="mt-2 text-[15px] leading-[1.6] text-fg">
              {column.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </FadeIn>
        </div>
      ))}
    </div>
  );
}
