import { cn } from "@/lib/utils";

export interface InboxCounterProps {
  count: number;
  variant?: "default" | "active" | "primary";
  className?: string;
}

export function InboxCounter({ count, variant = "default", className }: InboxCounterProps) {
  if (count === 0) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-normal min-w-[20px] h-5",
        variant === "active"
          ? "bg-brand-blue-dark/10 text-text"
          : variant === "primary"
            ? "bg-brand-blue text-white"
            : "bg-secondary text-gray-900",
        className,
      )}
    >
      {count}
    </div>
  );
}
