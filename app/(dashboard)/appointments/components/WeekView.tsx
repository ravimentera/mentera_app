import { cn } from "@/lib/utils";
import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { Appointment, DropIndicator } from "./types";

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
  onAppointmentDragStart: (appointment: Appointment, event: React.MouseEvent) => void;
  onAppointmentDragOver: (event: React.MouseEvent<HTMLDivElement>, dayDate?: Date) => void;
  onAppointmentDragEnd: () => void;
  draggingAppointment: Appointment | null;
  dropIndicator: DropIndicator;
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
  onAppointmentDragStart,
  onAppointmentDragOver,
  onAppointmentDragEnd,
  draggingAppointment,
  dropIndicator,
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
                isSameDay(day, new Date())
                  ? "text-brand-purple-dark"
                  : draggingAppointment && isSameDay(day, dropIndicator.date)
                    ? "text-brand-purple"
                    : "text-gray-600",
              )}
            >
              {format(day, "EEE")}
            </div>
            <div
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium mx-auto",
                isSameDay(day, new Date())
                  ? "bg-brand-purple-dark text-white"
                  : draggingAppointment && isSameDay(day, dropIndicator.date)
                    ? "bg-brand-purple-light/40 text-brand-purple-dark"
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
            className={cn(
              "relative select-none",
              dayIndex < 6 && "border-r border-gray-100",
              draggingAppointment &&
                isSameDay(day, dropIndicator.date) &&
                "bg-brand-purple-light/20",
            )}
            onMouseDown={(e) => onMouseDown(e, day)}
            onMouseMove={(e) => {
              onMouseMove(e);
              onAppointmentDragOver(e, day);
            }}
            onMouseUp={() => {
              onMouseUp();
              onAppointmentDragEnd();
            }}
            onMouseLeave={() => {
              onMouseLeave();
              // Don't end dragging on column leave, only on calendar leave
              if (!draggingAppointment) {
                onAppointmentDragEnd();
              }
            }}
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
                className="absolute left-0 right-0 bg-brand-purple-dark/10 border border-brand-purple-dark/20 z-20"
                style={getSelectionStyles()}
              />
            )}

            {/* Drop indicator for appointment drag and drop */}
            {dropIndicator.isVisible &&
              draggingAppointment &&
              isSameDay(day, dropIndicator.date) && (
                <div
                  className={cn(
                    "absolute left-0 right-0 border z-30 pointer-events-none rounded-md overflow-hidden animate-pulse",
                    draggingAppointment.type === "therapy"
                      ? "bg-[#8A03D3]/40 border-[#8A03D3]/40"
                      : draggingAppointment.type === "consultation"
                        ? "bg-[#035DD3]/40 border-[#035DD3]/40"
                        : draggingAppointment.type === "followup"
                          ? "bg-[#D36203]/40 border-[#D36203]/40"
                          : "bg-[#03A10B]/40 border-[#03A10B]/40",
                  )}
                  style={{
                    top: dropIndicator.top,
                    height: dropIndicator.height,
                  }}
                >
                  <div
                    className={cn(
                      "h-full w-full rounded-md p-2 flex items-start",
                      draggingAppointment.type === "therapy"
                        ? "bg-[#8A03D3]/30"
                        : draggingAppointment.type === "consultation"
                          ? "bg-[#035DD3]/30"
                          : draggingAppointment.type === "followup"
                            ? "bg-[#D36203]/30"
                            : "bg-[#03A10B]/30",
                    )}
                  >
                    <div
                      className={cn(
                        "text-xs font-medium truncate",
                        getAppointmentTextColor(draggingAppointment.type),
                      )}
                    >
                      {draggingAppointment.patient.firstName} {draggingAppointment.patient.lastName}
                      <span className="ml-2 text-[10px] opacity-70 italic">
                        {format(
                          new Date(dropIndicator.date).setHours(
                            Math.floor(
                              ((Number.parseFloat(dropIndicator.top) / 100) * 24 * 60) / 60,
                            ),
                            Math.floor(
                              ((Number.parseFloat(dropIndicator.top) / 100) * 24 * 60) % 60,
                            ),
                          ),
                          "h:mm a",
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}

            {/* Current time indicator */}
            {isSameDay(day, new Date()) && (
              <div
                className="absolute left-0 right-0 border-t border-brand-purple-dark border-dashed z-10"
                style={{
                  top: `${((new Date().getHours() * 60 + new Date().getMinutes()) / (24 * 60)) * 100}%`,
                }}
              >
                <div className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-full bg-brand-purple-dark" />
              </div>
            )}

            {/* Render appointments */}
            {getOverlappingAppointments(filterAppointmentsByDate(appointments, day)).map((group) =>
              group.map((appointment, index) => {
                // Instead of skipping, apply opacity if it's the dragging appointment
                const isDragging = draggingAppointment && draggingAppointment.id === appointment.id;

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
                      "flex items-start absolute rounded-lg border cursor-pointer overflow-hidden group transition-colors hover:shadow-md text-left cursor-grab select-none",
                      isCompact ? "px-0.5 py-0.5" : isMedium ? "px-1 py-1" : "px-2 py-1.5",
                      getAppointmentColors(appointment.type),
                      getAppointmentStatusColors(appointment.status),
                      isDragging && "opacity-40 shadow-lg",
                    )}
                    style={getAppointmentStyle(appointment, index, group.length)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAppointmentClick(appointment);
                    }}
                    onMouseDown={(e) => onAppointmentDragStart(appointment, e)}
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
