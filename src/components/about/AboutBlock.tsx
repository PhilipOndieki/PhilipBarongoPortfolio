import type { ReactNode } from "react";
import { DrawLine } from "@/components/motion/DrawLine";

interface AboutBlockProps {
  readonly label: string;
  readonly children: ReactNode;
  /**
   * Draw the right half of the split divider over the content column. Off
   * for content that brings its own lines (Focus).
   */
  readonly contentDivider?: boolean;
}

/**
 * One About block, on the project-row grid: a split divider (left column
 * minus 16px, then the content column), the label on the left and the content
 * on the right, 20px under the line. On mobile the label sits 12px above the
 * content and the divider is one full-width line.
 */
export function AboutBlock({ label, children, contentDivider = true }: AboutBlockProps) {
  return (
    <div className="md:grid md:grid-cols-[var(--col-left)_minmax(0,1fr)]">
      <div className="md:pr-4">
        <DrawLine />
        <h2 className="pt-5 text-[15px] leading-[1.6] font-normal text-muted">{label}</h2>
      </div>
      <div className="mt-3 md:mt-0">
        {contentDivider ? <DrawLine segment={1} className="mb-5 hidden md:block" /> : null}
        {children}
      </div>
    </div>
  );
}
