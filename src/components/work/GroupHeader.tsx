import { DrawLine } from "@/components/motion/DrawLine";

interface GroupHeaderProps {
  readonly label: string;
}

/** Full-width line, then the group label. Rendered inside its group's first stage. */
export function GroupHeader({ label }: GroupHeaderProps) {
  return (
    <div className="group-header">
      <DrawLine />
      <h2 className="pt-3 text-[15px] leading-[1.6] font-normal text-muted">{label}</h2>
    </div>
  );
}
