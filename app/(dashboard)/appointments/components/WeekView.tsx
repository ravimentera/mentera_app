import { cn } from "@/lib/utils";
import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { Appointment } from "./types";

interface WeekViewProps {
  date: Date;
  appointments: Appointment[];
  isDragging: boolean;
  dragStart: number | null;
  dragEnd: number | null;
  onMouseDown: (event: React.MouseEvent<HTMLDivElement>, day: Date) => void;
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
  getAppointmentStatusColors: (type: Appointment["status"]) => string;
  getAvatarColors: (type: Appointment["type"]) => string;
  getAppointmentTextColor: (type: Appointment["type"]) => string;
  onAppointmentClick: (appointment: Appointment) => void;
}

export function WeekView({
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
  getAppointmentStatusColors,
  getAvatarColors,
  getAppointmentTextColor,
  onAppointmentClick,
}: WeekViewProps) {
  const getWeekDays = (currentDate: Date) => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 }); // Start from Sunday
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const weekDays = getWeekDays(date);

  return (
    <div className="flex flex-col">
      {/* Headers row */}
      <div className="grid grid-cols-[64px_repeat(7,_1fr)] gap-x-2 px-4 pt-4">
        <div /> {/* Empty cell for time column */}
        {weekDays.map((day) => (
          <div key={format(day, "yyyy-MM-dd")} className="text-center">
            <div
              className={cn(
                "text-sm font-medium mb-0.5",
                isSameDay(day, new Date()) ? "text-[#8A03D3]" : "text-gray-600",
              )}
            >
              {format(day, "EEE")}
            </div>
            <div
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium mx-auto",
                isSameDay(day, new Date())
                  ? "bg-[#8A03D3] text-white"
                  : "text-gray-900 hover:bg-gray-100",
              )}
            >
              {format(day, "d")}
            </div>
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div className="grid grid-cols-[64px_repeat(7,_1fr)] gap-x-2 px-4 pb-4">
        {/* Time slots column */}
        <div className="grid grid-rows-[repeat(24,_minmax(60px,_1fr))]">
          {Array.from({ length: 24 }, (_, i) => (
            <div key={`time-slot-hour-${uuidv4()}`} className="text-sm text-gray-500 -mt-2">
              {format(new Date().setHours(i, 0), "h a")}
            </div>
          ))}
        </div>

        {/* Week days columns */}
        {weekDays.map((day, dayIndex) => (
          <div
            key={format(day, "yyyy-MM-dd")}
            className={cn("relative", dayIndex < 6 && "border-r border-gray-100")}
            onMouseDown={(e) => onMouseDown(e, day)}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
          >
            {/* Grid lines */}
            <div className="absolute inset-0 grid grid-rows-[repeat(24,_minmax(60px,_1fr))] pointer-events-none">
              {Array.from({ length: 24 }, (_, i) => (
                <div
                  key={`grid-line-${format(day, "yyyy-MM-dd")}-hour-${i}`}
                  className="border-t border-gray-100"
                />
              ))}
            </div>

            {/* Selection overlay */}
            {isSameDay(day, date) && dragStart && dragEnd && (
              <div
                className="absolute left-0 right-0 bg-[#8A03D3]/10 border border-[#8A03D3]/20 z-20"
                style={getSelectionStyles()}
              />
            )}

            {/* Current time indicator */}
            {isSameDay(day, new Date()) && (
              <div
                className="absolute left-0 right-0 border-t border-[#8A03D3] border-dashed z-10"
                style={{
                  top: `${((new Date().getHours() * 60 + new Date().getMinutes()) / (24 * 60)) * 100}%`,
                }}
              >
                <div className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-full bg-[#8A03D3]" />
              </div>
            )}

            {/* Render appointments */}
            {getOverlappingAppointments(filterAppointmentsByDate(appointments, day)).map((group) =>
              group.map((appointment, index) => {
                const durationInMinutes =
                  (new Date(appointment.endTime).getTime() -
                    new Date(appointment.startTime).getTime()) /
                  (60 * 1000);
                const heightInPixels = (durationInMinutes / (24 * 60)) * 1440;

                const isCompact = durationInMinutes <= 15;
                const isMedium = durationInMinutes > 15 && durationInMinutes < 30;
                const isRegular = durationInMinutes >= 30;

                const showAvatar = !isCompact && heightInPixels >= 48;

                return (
                  <button
                    key={appointment.id}
                    type="button"
                    data-appointment="true"
                    className={cn(
                      "flex items-start absolute rounded-lg border cursor-pointer overflow-hidden group transition-colors hover:shadow-md text-left",
                      isCompact ? "px-0.5 py-0.5" : isMedium ? "px-1 py-1" : "px-2 py-1.5",
                      getAppointmentColors(appointment.type),
                      getAppointmentStatusColors(appointment.status),
                    )}
                    style={getAppointmentStyle(appointment, index, group.length)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAppointmentClick(appointment);
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
                              className={cn("text-gray-500 truncate", "text-[10px] leading-[1.2]")}
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
                            "text-[10px] px-1.5 py-0.5",
                            getAvatarColors(appointment.type),
                          )}
                        >
                          {appointment.patient.condition}
                        </span>
                      )}
                    </div>
                  </button>
                );
              }),
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
