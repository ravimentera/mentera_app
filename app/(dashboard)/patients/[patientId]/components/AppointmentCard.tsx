"use client";

import { Link } from "@/components/atoms";
import { cn } from "@/lib/utils";
import { Calendar, ChevronRight, User } from "lucide-react";
import { Appointment } from "../types";

interface AppointmentCardProps {
  appointments: Appointment[];
  onViewAll: () => void;
  showBorder?: boolean;
}

export function AppointmentCard({
  appointments,
  onViewAll,
  showBorder = true,
}: AppointmentCardProps) {
  return (
    <div className={cn("bg-white rounded-lg space-y-6", showBorder && "border p-6 border-border")}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showBorder && <Calendar className="h-5 w-5 text-brand-blue" />}
          <h2 className="text-lg font-semibold">Next Appointment</h2>
        </div>
        <Link onClick={onViewAll}> View All</Link>
      </div>

      {appointments.length === 0 ? (
        <p className="text-gray-500 text-sm">No upcoming appointments</p>
      ) : (
        <div className="space-y-4">
          {appointments.slice(0, 2).map((appointment) => (
            <div
              key={appointment.id}
              className={`p-4 rounded-lg space-y-3 ${
                appointment.title.toLowerCase().includes("botox") ? "bg-blue-50" : "bg-green-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{appointment.title}</h3>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {appointment.date ===
                    new Date(Date.now() + 86400000).toISOString().split("T")[0]
                      ? "Tomorrow"
                      : new Date(appointment.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })}
                    , {appointment.time}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{appointment.doctor}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
