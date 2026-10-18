import type { ReactNode } from "react";

interface ContainerProps {
  readonly children: ReactNode;
  readonly className?: string;
}

/** Full-width container: 16px side padding on mobile, 20px on desktop, clear of the notch. */
export function Container({ children, className = "" }: ContainerProps) {
  return <div className={`gutter-x ${className}`}>{children}</div>;
}
