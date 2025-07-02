import { cn } from "@/lib/utils";

interface TreatmentPillProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function TreatmentPill({ label, selected = false, onClick, className }: TreatmentPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center px-4 py-2 rounded-full text-base font-medium transition-colors",
        selected
          ? "bg-brand-blue-light border border-brand-blue text-foreground"
          : "bg-ui-background-gray border border-ui-border text-foreground",
        className,
      )}
    >
      {label}
    </button>
  );
}
