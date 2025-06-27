import type { InboxTab } from "@/app/(dashboard)/inbox/types";
import { InboxCounter } from "@/components/atoms/InboxCounter";
import { cn } from "@/lib/utils";

export interface InboxTabButtonProps {
  tab: InboxTab;
  label: string;
  count: number;
  isActive: boolean;
  onClick: (tab: InboxTab) => void;
  className?: string;
}

export function InboxTabButton({
  tab,
  label,
  count,
  isActive,
  onClick,
  className,
}: InboxTabButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(tab)}
      className={cn(
        "flex items-center justify-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-colors flex-1 h-7",
        isActive
          ? "bg-blue-100 text-brand-blue border border-brand-blue"
          : "text-gray-900 hover:bg-gray-50",
        className,
      )}
    >
      <span>{label}</span>
      <InboxCounter count={count} variant={isActive ? "active" : "default"} />
    </button>
  );
}
