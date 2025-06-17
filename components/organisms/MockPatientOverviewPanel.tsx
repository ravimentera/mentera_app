import {
  MOCK_PATIENT_OVERVIEW_CARDS,
  MOCK_PATIENT_OVERVIEW_TITLE,
} from "@/app/constants/patient-overview-constants";
import { PatientOverviewCard } from "@/components/molecules/PatientOverviewCard";
import { cn } from "@/lib/utils";
import type { PatientOverviewPanelProps } from "@/types/patient-overview";
import { ChevronUp } from "lucide-react";

export function MockPatientOverviewPanel({ className = "" }: PatientOverviewPanelProps) {
  return (
    <div className={cn("w-159 h-full bg-white p-4 space-y-4 overflow-y-auto", className)}>
      {/* Mock Patient Overview Accordion */}
      <div className="border border-gray-200 rounded-lg h-full">
        <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
          <span className="font-medium">{MOCK_PATIENT_OVERVIEW_TITLE}</span>
          <ChevronUp className="w-4 h-4 text-gray-500" />
        </div>
        <div className="p-4 grid grid-cols-2 gap-4">
          {MOCK_PATIENT_OVERVIEW_CARDS.map((card) => (
            <PatientOverviewCard key={card.id} card={card} />
          ))}
        </div>
      </div>
    </div>
  );
}
