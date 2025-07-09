"use client";

import { Link } from "@/components/atoms";
import { cn } from "@/lib/utils";
import { Package2 } from "lucide-react";

interface Treatment {
  id: string;
  name: string;
  progress: number;
  totalSessions: number;
  completedSessions: number;
}

interface TreatmentCardProps {
  treatments: Treatment[];
  onViewAll: () => void;
  showBorder?: boolean;
}

export function TreatmentCard({ treatments, onViewAll, showBorder = true }: TreatmentCardProps) {
  // Calculate total completed and total sessions across all treatments
  const totalCompletedSessions = treatments.reduce(
    (sum, treatment) => sum + treatment.completedSessions,
    0,
  );
  const totalSessions = treatments.reduce((sum, treatment) => sum + treatment.totalSessions, 0);

  return (
    <div className={cn("bg-white rounded-lg space-y-6", showBorder && "border p-6 border-border")}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showBorder && <Package2 className="h-5 w-5 text-brand-blue" />}
          <h2 className="text-lg font-semibold">
            Active Treatments ({totalCompletedSessions}/{totalSessions})
          </h2>
        </div>
        <Link onClick={onViewAll}>View All</Link>
      </div>

      {treatments.length === 0 ? (
        <p className="text-gray-500 text-sm">No active treatments found</p>
      ) : (
        <div className="space-y-4">
          {treatments.map((treatment) => (
            <div key={treatment.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{treatment.name}</h3>
                <span className="text-base text-gray-500">
                  {treatment.completedSessions}/{treatment.totalSessions} Sessions
                </span>
              </div>
              <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full rounded-full bg-brand-gradient"
                  style={{
                    width: `${(treatment.completedSessions / treatment.totalSessions) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
