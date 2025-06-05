import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Appointment } from "./types";

interface AppointmentCardProps {
  appointment: Appointment;
  durationInMinutes: number;
  isCompact?: boolean;
  isMedium?: boolean;
  showAvatar?: boolean;
  showStatusIcon?: boolean;
  showTime?: boolean;
  isDragging?: boolean;
  className?: string;
  getAvatarColors: (type: Appointment["type"]) => string;
  getAppointmentTextColor: (type: Appointment["type"]) => string;
}

export function AppointmentCard({
  appointment,
  durationInMinutes,
  isCompact = false,
  isMedium = false,
  showAvatar = true,
  showStatusIcon = false,
  showTime = true,
  isDragging = false,
  className,
  getAvatarColors,
  getAppointmentTextColor,
}: AppointmentCardProps) {
  return (
    <div
      className={cn(
        "flex items-start transition-all",
        isCompact ? "gap-0.5" : showStatusIcon ? "gap-2" : "gap-1",
        isDragging && "opacity-40",
        className,
      )}
    >
      {/* Status icon (for AdminWeekView) */}
      {showStatusIcon && (
        <div
          className={cn(
            "w-2 h-2 rounded-full flex-shrink-0",
            appointment.status === "completed"
              ? "bg-green-500"
              : appointment.status === "cancelled"
                ? "bg-red-500"
                : appointment.status === "scheduled"
                  ? "bg-blue-500"
                  : "bg-yellow-500",
          )}
        />
      )}

      {/* Avatar */}
      {showAvatar && (
        <div
          className={cn(
            "shrink-0 rounded-full flex items-center justify-center font-medium shadow-sm",
            isCompact
              ? "h-3 w-3 text-[7px]"
              : isMedium
                ? "h-4 w-4 text-[8px]"
                : showStatusIcon
                  ? "h-5 w-5 text-[9px]"
                  : "h-5 w-5 text-[10px]",
            // Handle sizing differences between admin and provider views
            !showStatusIcon &&
              (isCompact
                ? "h-4 w-4 text-[8px]"
                : isMedium
                  ? "h-5 w-5 text-[10px]"
                  : "h-6 w-6 text-xs"),
            getAvatarColors(appointment.type),
          )}
        >
          {appointment.patient.firstName.charAt(0)}
          {appointment.patient.lastName.charAt(0)}
        </div>
      )}

      <div className="min-w-0 flex-1">
        {/* Patient name */}
        <div
          className={cn(
            "font-medium truncate",
            isCompact
              ? showStatusIcon
                ? "text-[9px] leading-[1]"
                : "text-[8px] leading-[1]"
              : isMedium
                ? showStatusIcon
                  ? "text-[10px] leading-[1.1]"
                  : "text-[10px] leading-[1.1]"
                : showStatusIcon
                  ? "text-[11px] leading-[1.2]"
                  : "text-xs leading-[1.2]",
            getAppointmentTextColor(appointment.type),
          )}
        >
          {isCompact
            ? appointment.patient.firstName
            : `${appointment.patient.firstName} ${appointment.patient.lastName}`}
        </div>

        {/* Time display */}
        {showTime && !isCompact && durationInMinutes >= 20 && (
          <div
            className={cn(
              "truncate",
              showStatusIcon ? "text-zinc-500" : "text-gray-500",
              isMedium
                ? showStatusIcon
                  ? "text-[7px] leading-[1]"
                  : "text-[8px] leading-[1.2]"
                : showStatusIcon
                  ? "text-[8px] leading-[1.2]"
                  : "text-[10px] leading-[1.2]",
            )}
          >
            {format(appointment.startTime, "h:mm a")} - {format(appointment.endTime, "h:mm a")}
          </div>
        )}
      </div>
    </div>
  );
}
