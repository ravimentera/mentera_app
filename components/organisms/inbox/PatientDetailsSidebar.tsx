import type { PatientDetail } from "@/app/(dashboard)/inbox/types";
import { Badge } from "@/components/atoms";
import { cn } from "@/lib/utils";
import { Calendar, Clock, ExternalLink } from "lucide-react";

export interface PatientDetailsSidebarProps {
  patient: PatientDetail | null;
  className?: string;
}

export function PatientDetailsSidebar({ patient, className }: PatientDetailsSidebarProps) {
  if (!patient) {
    return (
      <div className={cn("w-[320px] bg-white p-6", className)}>
        <div className="text-center text-gray-500">
          <p>Select a conversation to view patient details</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-[320px] bg-white flex flex-col", className)}>
      {/* Patient Profile Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold text-text">Patient Details</h3>
              {patient.tags.includes("VIP") && (
                <Badge variant="secondary" className="text-xs">
                  VIP
                </Badge>
              )}
            </div>
          </div>
          <ExternalLink className="w-5 h-5 text-brand-blue cursor-pointer" />
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-2 gap-2">
          <div className="text-sm text-text-muted">Name</div>
          <div className="text-text text-sm">{patient.name}</div>
          <div className="text-sm text-text-muted">Email</div>
          <div className="text-text text-sm">{patient.email}</div>
          <div className="text-sm text-text-muted">Phone</div>
          <div className="text-text text-sm">{patient.phone}</div>
        </div>

        {/* Tags */}
        {patient.tags.length > 0 && patient.tags.some((tag) => tag !== "VIP") && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-1">
              {patient.tags
                .filter((tag) => tag !== "VIP")
                .map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs bg-brand-blue-light text-brand-blue"
                  >
                    {tag}
                  </Badge>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Treatment History */}
      <div className="p-4 border-b border-gray-100">
        <h4 className="text-xl font-semibold text-text mb-3">Treatment History</h4>
        <div className="space-y-3">
          {patient.treatmentHistory.map((treatment) => (
            <div key={treatment.id} className="flex items-start gap-2 text-text">
              <div
                className={cn(
                  "w-2 h-2 rounded-full mt-1.5",
                  treatment.status === "completed"
                    ? "bg-emerald-500"
                    : treatment.status === "scheduled"
                      ? "bg-blue-500"
                      : "bg-red-500 text-red-500",
                )}
              />
              <div>
                <p className="text-sm text-text">{treatment.title}</p>
                <p className="text-xs text-text-muted">{treatment.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Appointment */}
      {patient.nextAppointment && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xl font-semibold text-text">Next Appointment</h4>
            <span className="text-sm text-brand-blue cursor-pointer">View all</span>
          </div>
          <div className="rounded-lg p-3">
            <p className="text-md font-medium text-text mb-2">{patient.nextAppointment.title}</p>
            <div className="flex items-center gap-2 mb-2 text-text-muted">
              <Calendar className="w-4 h-4 text-text-muted" />
              <span className="text-sm font-medium text-text-muted">
                {patient.nextAppointment.date}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-text-muted" />
              <span className="text-sm text-text-muted">{patient.nextAppointment.time}</span>
            </div>
          </div>
        </div>
      )}

      {/* Medical Insights */}
      <div className="p-4">
        <h4 className="text-xl font-semibold text-text mb-3">Medical Insights</h4>
        <div className="space-y-3">
          {patient.medicalInsights.map((insight) => (
            <div key={insight.id}>
              <p className="text-sm font-medium text-text mb-1">{insight.condition}</p>
              <p className="text-xs text-text-muted">Reaction: {insight.reaction}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
