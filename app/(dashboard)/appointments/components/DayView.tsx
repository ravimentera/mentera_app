import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { Appointment } from "./types";

interface DayViewProps {
  date: Date;
  appointments: Appointment[];
  isDragging: boolean;
  dragStart: number | null;
  dragEnd: number | null;
  onMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseMove: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  getSelectionStyles: () => { top: string; height: string } | undefined;
  getOverlappingAppointments: (appointments: Appointment[]) => Appointment[][];
  filterAppointmentsByDate: (appointments: Appointment[], date: Date) => Appointment[];
  getAppointmentStyle: (
    appointment: Appointment,
    index: number,
    overlappingCount: number,
  ) => {
    top: string;
    height: string;
    width: string;
    left: string;
    minHeight: string;
    zIndex: number;
  };
  getAppointmentColors: (type: Appointment["type"]) => string;
  getAvatarColors: (type: Appointment["type"]) => string;
  getAppointmentTextColor: (type: Appointment["type"]) => string;
  onAppointmentClick: (appointment: Appointment) => void;
}

export function DayView({
  date,
  appointments,
  isDragging,
  dragStart,
  dragEnd,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
  getSelectionStyles,
  getOverlappingAppointments,
  filterAppointmentsByDate,
  getAppointmentStyle,
  getAppointmentColors,
  getAvatarColors,
  getAppointmentTextColor,
  onAppointmentClick,
}: DayViewProps) {
  return (
    <div className="grid grid-cols-[64px_1fr] gap-4 p-4">
      {/* Time slots */}
      <div className="grid grid-rows-[repeat(24,_minmax(60px,_1fr))]">
        {Array.from({ length: 24 }, (_, i) => (
          <div key={`time-slot-${uuidv4()}`} className="text-sm text-gray-500 -mt-2">
            {format(new Date().setHours(i, 0), "h a")}
          </div>
        ))}
      </div>

      {/* Day view appointments grid */}
      <div
        className="relative min-h-full"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
      >
        {/* Time grid lines */}
        <div className="absolute inset-0 grid grid-rows-[repeat(24,_minmax(60px,_1fr))] pointer-events-none">
          {Array.from({ length: 24 }, (_, i) => (
            <div key={`grid-line-${uuidv4()}`} className="border-t border-gray-100" />
          ))}
        </div>

        {/* Current time indicator */}
        <div
          className="absolute left-0 right-0 border-t border-[#8A03D3] border-dashed z-10"
          style={{
            top: `${((new Date().getHours() * 60 + new Date().getMinutes()) / (24 * 60)) * 100}%`,
          }}
        >
          <div className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-full bg-[#8A03D3]" />
        </div>

        {/* Selection overlay */}
        {dragStart && dragEnd && (
          <div
            className="absolute left-0 right-0 bg-[#8A03D3]/10 border border-[#8A03D3]/20 z-20"
            style={getSelectionStyles()}
          />
        )}

        {/* Render appointments */}
        {getOverlappingAppointments(filterAppointmentsByDate(appointments, date)).map((group) =>
          group.map((appointment, index) => {
            const durationInMinutes =
              (appointment.endTime.getTime() - appointment.startTime.getTime()) / (60 * 1000);
            const heightInPixels = (durationInMinutes / (24 * 60)) * 1440;

            const isCompact = durationInMinutes <= 15;
            const isMedium = durationInMinutes > 15 && durationInMinutes < 30;
            const isRegular = durationInMinutes >= 30;

            const showAvatar = !isCompact && heightInPixels >= 48;

            return (
              <div
                key={appointment.id}
                data-appointment="true"
                className={cn(
                  "absolute rounded-lg border cursor-pointer overflow-hidden group transition-colors hover:shadow-md",
                  isCompact ? "px-0.5 py-0.5" : isMedium ? "px-1 py-1" : "px-2 py-1.5",
                  getAppointmentColors(appointment.type),
                )}
                style={getAppointmentStyle(appointment, index, group.length)}
                onClick={(e) => {
                  e.stopPropagation();
                  onAppointmentClick(appointment);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    onAppointmentClick(appointment);
                  }
                }}
              >
                <div className={cn("flex flex-col", isCompact ? "gap-0" : "gap-1")}>
                  <div className={cn("flex items-start", isCompact ? "gap-0.5" : "gap-1")}>
                    {showAvatar && (
                      <div
                        className={cn(
                          "shrink-0 rounded-full flex items-center justify-center font-medium shadow-sm",
                          isCompact
                            ? "h-4 w-4 text-[8px]"
                            : isMedium
                              ? "h-5 w-5 text-[10px]"
                              : "h-6 w-6 text-xs",
                          getAvatarColors(appointment.type),
                        )}
                      >
                        {appointment.patient.firstName.charAt(0)}
                        {appointment.patient.lastName.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div
                        className={cn(
                          "font-medium truncate",
                          isCompact
                            ? "text-[8px] leading-[1]"
                            : isMedium
                              ? "text-[10px] leading-[1.1]"
                              : "text-xs leading-[1.2]",
                          getAppointmentTextColor(appointment.type),
                        )}
                      >
                        {isCompact
                          ? appointment.patient.firstName
                          : `${appointment.patient.firstName} ${appointment.patient.lastName}`}
                      </div>
                      {!isCompact && durationInMinutes >= 20 && (
                        <div
                          className={cn(
                            "text-gray-500 truncate",
                            isMedium ? "text-[8px] leading-[1]" : "text-[10px] leading-[1.2]",
                          )}
                        >
                          {format(appointment.startTime, "h:mm a")} -{" "}
                          {format(appointment.endTime, "h:mm a")}
                        </div>
                      )}
                    </div>
                  </div>
                  {isRegular && appointment.patient.condition && (
                    <span
                      className={cn(
                        "self-start font-medium rounded",
                        isMedium ? "text-[8px] px-1 py-px" : "text-[10px] px-1.5 py-0.5",
                        getAvatarColors(appointment.type),
                      )}
                    >
                      {appointment.patient.condition}
                    </span>
                  )}
                </div>
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}
