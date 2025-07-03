"use client";

import { Badge } from "@/components/atoms";
import { formatDistanceToNow } from "date-fns";
import { Activity, AlertTriangle, Calendar, Clock, Package2 } from "lucide-react";

interface MedicalAlert {
  id: string;
  type: string;
  description: string;
  reaction: string;
}

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
  followUpDate: string | null;
}

interface Treatment {
  id: string;
  name: string;
  progress: number;
  totalSessions: number;
  completedSessions: number;
}

interface MedicalHistoryTabProps {
  medicalAlerts: MedicalAlert[];
  enrichedVisits?: EnrichedVisit[];
  treatments?: Treatment[];
  isLoading?: boolean;
}

const MedicalHistoryTab = ({
  medicalAlerts,
  enrichedVisits = [],
  treatments = [],
  isLoading,
}: MedicalHistoryTabProps) => {
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

  // Calculate total completed and total sessions across all treatments
  const totalCompletedSessions = treatments.reduce(
    (sum, treatment) => sum + treatment.completedSessions,
    0,
  );
  const totalSessions = treatments.reduce((sum, treatment) => sum + treatment.totalSessions, 0);

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Active Treatments Loading */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-2 mb-6">
            <Package2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Active Treatments</h2>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((index) => (
              <div key={index} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Medical Conditions Loading */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold">Medical Conditions & Alerts</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Treatment History Loading */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Treatment History</h2>
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
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Active Treatments Section */}
      {treatments.length > 0 && (
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-2 mb-6">
            <Package2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold">
              Active Treatments ({totalCompletedSessions}/{totalSessions})
            </h2>
            <span className="text-sm text-gray-500">({treatments.length} packages)</span>
          </div>

          <div className="space-y-6">
            {treatments.map((treatment) => (
              <div key={treatment.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">{treatment.name}</h3>
                  <span className="text-base text-gray-500">
                    {treatment.completedSessions}/{treatment.totalSessions} Sessions
                  </span>
                </div>
                <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full rounded-full bg-blue-500"
                    style={{
                      width: `${(treatment.completedSessions / treatment.totalSessions) * 100}%`,
                    }}
                  />
                </div>
                <div className="text-sm text-gray-500">
                  {Math.round((treatment.completedSessions / treatment.totalSessions) * 100)}%
                  Complete
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medical Conditions & Alerts Section */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center gap-2 mb-6">
          <AlertTriangle className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-800">Medical Conditions & Alerts</h2>
          {medicalAlerts.length > 0 && (
            <span className="text-sm text-gray-500">({medicalAlerts.length} total)</span>
          )}
        </div>

        {medicalAlerts.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No medical conditions found</h3>
            <p className="text-gray-500">
              This patient has no recorded medical conditions or alerts.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {medicalAlerts.map((alert) => (
              <div key={alert.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-700 mb-1">{alert.type}</h3>
                    {alert.description !== "N/A" && (
                      <p className="text-sm text-gray-600 mb-1">{alert.description}</p>
                    )}
                    {alert.reaction !== "N/A" && (
                      <p className="text-xs text-gray-500">Reaction: {alert.reaction}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Treatment History Section */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Treatment History</h2>
          {enrichedVisits.length > 0 && (
            <span className="text-sm text-gray-500">({enrichedVisits.length} total)</span>
          )}
        </div>

        {enrichedVisits.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No treatment history found</h3>
            <p className="text-gray-500">This patient doesn&apos;t have any treatment history.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {enrichedVisits.map((visit, index) => (
              <div key={visit.id} className="relative">
                {/* Timeline line */}
                {index < enrichedVisits.length - 1 && (
                  <div className="absolute left-2.5 top-12 w-px h-[calc(100%-2rem)] bg-gray-200"></div>
                )}

                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                      <Activity className="w-3 h-3 text-white" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-base font-medium text-gray-900">
                            {visit.treatment.procedure}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(visit.visitDate)}
                            </div>
                            <span>•</span>
                            <span>{formatRelativeDate(visit.visitDate)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {visit.treatment.unitsUsed} Units
                          </p>
                          <p className="text-xs text-gray-500">{visit.treatment.volumeUsed}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
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
                        <div className="text-sm text-gray-600 border-t border-gray-200 py-3">
                          <p className="font-medium text-text mb-1">Observations:</p>
                          <p>{visit.treatment.observations}</p>
                        </div>
                      )}

                      {visit.treatment.providerRecommendations && (
                        <div className="text-sm text-gray-600 border-t border-gray-200 pt-3">
                          <p className="font-medium text-text mb-1">Provider Recommendations:</p>
                          <p>{visit.treatment.providerRecommendations}</p>
                        </div>
                      )}

                      {visit.followUpDate && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-3 border-t border-gray-200 pt-3">
                          <Clock className="w-4 h-4" />
                          <span>Follow-up scheduled for {formatDate(visit.followUpDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalHistoryTab;
