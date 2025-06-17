import type { PatientOverviewData } from "@/types/patient-overview";

interface PatientDataItemProps {
  data: PatientOverviewData;
  className?: string;
}

export function PatientDataItem({ data, className = "" }: PatientDataItemProps) {
  return (
    <div className={className}>
      <div className="flex gap-2">
        <span className="font-semibold text-sm">{data.label}</span>
        <span className="text-sm">{data.value}</span>
      </div>
      {data.description && <p className="text-sm text-gray-700 mt-1">{data.description}</p>}
    </div>
  );
}
