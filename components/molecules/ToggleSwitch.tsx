import { cn } from "@/lib/utils";

type ToggleSwitchProps = {
  leftLabel?: string;
  rightLabel?: string;
  checked: boolean;
  onChange: () => void;
  className?: string;
};

export const ToggleSwitch = ({
  leftLabel,
  rightLabel,
  checked,
  onChange,
  className,
}: ToggleSwitchProps) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {leftLabel && (
        <span
          className={cn(
            "text-xs transition-colors",
            !checked ? "text-brand-blue-dark font-medium" : "text-gray-500",
          )}
        >
          {leftLabel}
        </span>
      )}

      <button
        type="button"
        onClick={onChange}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue-light/40 focus:ring-offset-2",
          checked ? "bg-brand-blue-dark" : "bg-gray-200 hover:bg-gray-300",
        )}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform",
            checked ? "translate-x-6" : "translate-x-1",
          )}
        />
      </button>

      {rightLabel && (
        <span
          className={cn(
            "text-xs transition-colors",
            checked ? "text-brand-blue-dark font-medium" : "text-gray-500",
          )}
        >
          {rightLabel}
        </span>
      )}
    </div>
  );
};
