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
          ? "bg-[#F9FAFB] border border-[#E5E7EB] text-[#0F172A]"
          : "bg-[#FAE8FF] border border-[#C026D3] text-[#0F172A]",
        className,
      )}
    >
      {label}
    </button>
  );
}
