import { PatientDataItem } from "@/components/atoms/PatientDataItem";
import { cn } from "@/lib/utils";
import type { PatientOverviewCardProps } from "@/types/patient-overview";

export function PatientOverviewCard({ card, className = "" }: PatientOverviewCardProps) {
  return (
    <div className={cn(card.backgroundColor, "border border-gray-200 rounded-lg p-4", className)}>
      <h4 className="font-semibold mb-3">{card.title}</h4>
      <div className="space-y-2">
        {card.data.map((item, index) => (
          <PatientDataItem
            key={`${card.id}-${index}`}
            data={item}
            className={item.description ? "mt-2" : ""}
          />
        ))}
      </div>
    </div>
  );
}
