"use client";

import { Badge, Link } from "@/components/atoms";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Clock } from "lucide-react";

interface EnrichedVisit {
  id: string;
  visitDate: string;
  treatment: {
    procedure: string;
    areasTreated: string[];
    unitsUsed: number;
    volumeUsed: string;
    observations: string;
    providerRecommendations: string;
  };
  providerId: string;
}

interface TreatmentHistoryCardProps {
  enrichedVisits?: EnrichedVisit[];
  isLoading?: boolean;
  onViewAll?: () => void;
  showBorder?: boolean;
}

const TreatmentHistoryCard = ({
  enrichedVisits = [],
  isLoading,
  onViewAll,
  showBorder = true,
}: TreatmentHistoryCardProps) => {
  const formatRelativeDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  // Show only first 2 items
  const displayTreatments = enrichedVisits.slice(0, 2);

  if (isLoading) {
    return (
      <div className={cn("bg-white rounded-xl h-fit", showBorder && "border border-border p-4")}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Treatment History</h2>
        </div>
        <div className="space-y-6">
          {[1, 2].map((index) => (
            <div key={index} className="animate-pulse">
              <div className="flex justify-between mb-2">
                <div className="h-5 bg-gray-200 rounded w-32"></div>
                <div className="h-5 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="flex gap-2 mt-2">
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!enrichedVisits.length) {
    return (
      <div className={cn("bg-white rounded-xl h-fit", showBorder && "border-b border-border p-4")}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Treatment History</h2>
        </div>
        <p className="text-gray-500 text-sm">No treatment history available</p>
      </div>
    );
  }

  return (
    <div className={cn("bg-white rounded-xl h-fit", showBorder && "border border-border p-4 ")}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Treatment History</h2>
          <span className="text-sm text-gray-500">({enrichedVisits.length} total)</span>
        </div>
        {onViewAll && <Link onClick={onViewAll}>View All</Link>}
      </div>

      <div className="space-y-6">
        {displayTreatments.map((visit) => (
          <div key={visit.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium text-gray-900">{visit.treatment.procedure}</h3>
                <p className="text-gray-500 text-sm flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatRelativeDate(visit.visitDate)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {visit.treatment.unitsUsed} Units
                </p>
                <p className="text-xs text-gray-500">{visit.treatment.volumeUsed}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {visit.treatment.areasTreated.map((area) => (
                <Badge
                  key={area}
                  className="bg-brand-blue-light text-brand-blue hover:bg-brand-blue-light"
                >
                  {area}
                </Badge>
              ))}
            </div>

            {visit.treatment.observations && (
              <p className="text-sm text-gray-600 mt-2">{visit.treatment.observations}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TreatmentHistoryCard;
