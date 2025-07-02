"use client";

import { Button } from "@/components/atoms";
import { formatDistanceToNow } from "date-fns";

interface TreatmentHistoryItem {
  id: string;
  title: string;
  date: string;
  status: "completed" | "scheduled" | "cancelled";
  type?: string;
}

interface TreatmentHistoryCardProps {
  treatments?: TreatmentHistoryItem[];
  isLoading?: boolean;
  onViewAll?: () => void;
}

const TreatmentHistoryCard = ({
  treatments = [],
  isLoading,
  onViewAll,
}: TreatmentHistoryCardProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0" />;
      case "scheduled":
        return <div className="w-3 h-3 bg-yellow-500 rounded-full flex-shrink-0" />;
      default:
        return <div className="w-3 h-3 bg-gray-300 rounded-full flex-shrink-0" />;
    }
  };

  const formatRelativeDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  // Show only first 3 items
  const displayTreatments = treatments.slice(0, 3);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border p-4 h-fit">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Treatment History</h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((index) => (
            <div key={index} className="flex items-start gap-3 animate-pulse">
              <div className="w-3 h-3 bg-gray-200 rounded-full flex-shrink-0 mt-1" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!treatments.length) {
    return (
      <div className="bg-white rounded-xl border p-4 h-fit">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Treatment History</h2>
        </div>
        <p className="text-gray-500 text-sm">No treatment history available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border p-4 h-fit">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Treatment History</h2>
        {treatments.length > 3 && onViewAll && (
          <Button variant="link" onClick={onViewAll} className="text-blue-600 font-medium">
            View All
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {displayTreatments.map((treatment) => (
          <div key={treatment.id} className="flex items-start gap-3">
            {getStatusIcon(treatment.status)}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 text-sm leading-tight">{treatment.title}</h3>
              <p className="text-gray-500 text-sm mt-1">{formatRelativeDate(treatment.date)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TreatmentHistoryCard;
