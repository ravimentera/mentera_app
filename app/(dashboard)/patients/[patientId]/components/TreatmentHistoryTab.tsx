"use client";

import { formatDistanceToNow } from "date-fns";
import { Activity, Calendar, CheckCircle, Clock } from "lucide-react";

interface TreatmentHistoryItem {
  id: string;
  title: string;
  date: string;
  status: "completed" | "scheduled" | "cancelled";
  type?: string;
}

interface TreatmentHistoryTabProps {
  treatments: TreatmentHistoryItem[];
  isLoading?: boolean;
}

const TreatmentHistoryTab = ({ treatments, isLoading }: TreatmentHistoryTabProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "scheduled":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "completed":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "scheduled":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "cancelled":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
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

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl font-semibold">Treatment History</h1>
        </div>
        <div className="space-y-6">
          {[1, 2, 3, 4, 5].map((index) => (
            <div key={index} className="flex gap-4 animate-pulse">
              <div className="w-5 h-5 bg-gray-200 rounded-full flex-shrink-0 mt-1"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!treatments.length) {
    return (
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl font-semibold">Treatment History</h1>
        </div>
        <div className="text-center py-12">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No treatment history found</h3>
          <p className="text-gray-500">This patient doesn&apos;t have any treatment history.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border p-6">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-5 h-5 text-blue-600" />
        <h1 className="text-xl font-semibold">Treatment History</h1>
        <span className="text-sm text-gray-500">({treatments.length} total)</span>
      </div>

      <div className="space-y-6">
        {treatments.map((treatment, index) => (
          <div key={treatment.id} className="relative">
            {/* Timeline line */}
            {index < treatments.length - 1 && (
              <div className="absolute left-2.5 top-8 w-px h-6 bg-gray-200"></div>
            )}

            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-1">{getStatusIcon(treatment.status)}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-base font-medium text-gray-900 mb-1">{treatment.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(treatment.date)}
                      </div>
                      <span>•</span>
                      <span>{formatRelativeDate(treatment.date)}</span>
                      {treatment.type && (
                        <>
                          <span>•</span>
                          <span className="capitalize">{treatment.type}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0 ml-4">
                    <span className={getStatusBadge(treatment.status)}>
                      {treatment.status.charAt(0).toUpperCase() + treatment.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TreatmentHistoryTab;
