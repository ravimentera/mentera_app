import { cn } from "@/lib/utils";
import { useState } from "react";
import { TreatmentPill } from "../TreatmentPill";

export interface TreatmentOption {
  label: string;
  value: string;
}

interface TreatmentPillGroupProps {
  title: string;
  options: TreatmentOption[];
  onChange?: (selectedOptions: string[]) => void;
  initialSelected?: string[];
  className?: string;
}

export function TreatmentPillGroup({
  title,
  options,
  onChange,
  initialSelected = [],
  className,
}: TreatmentPillGroupProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(initialSelected);

  const toggleOption = (value: string) => {
    const newSelected = selectedOptions.includes(value)
      ? selectedOptions.filter((option) => option !== value)
      : [...selectedOptions, value];

    setSelectedOptions(newSelected);
    onChange?.(newSelected);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-xl font-semibold text-[#1F2937]">{title}</h3>
      <div className="flex flex-wrap gap-4">
        {options.map((option) => (
          <TreatmentPill
            key={option.value}
            label={option.label}
            selected={selectedOptions.includes(option.value)}
            onClick={() => toggleOption(option.value)}
          />
        ))}
      </div>
    </div>
  );
}
