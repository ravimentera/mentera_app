import { cn } from "@/lib/utils";
import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import React from "react";
import { v4 as uuidv4 } from "uuid";
import { AppointmentCard } from "./AppointmentCard";
import { DropIndicator } from "./DropIndicator";
import { Appointment, DropIndicator as DropIndicatorType } from "./types";

interface ProviderWeekViewProps {
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
  dropIndicator: DropIndicatorType;
}

export function ProviderWeekView({
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
}: ProviderWeekViewProps) {
  const getWeekDays = (currentDate: Date) => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 }); // Start from Sunday
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const weekDays = getWeekDays(date);

  return (
    <div className="bg-white overflow-hidden rounded-lg h-full max-h-screen overflow-y-auto">
      <div className="flex flex-col">
        {/* Headers row */}
        <div className="grid grid-cols-[64px_repeat(7,_1fr)] gap-x-2 px-4 pt-4 sticky top-0 z-30 bg-white border-b border-zinc-200">
          <div /> {/* Empty cell for time column */}
          {weekDays.map((day) => (
            <div key={format(day, "yyyy-MM-dd")} className="text-center">
              <div
                className={cn(
                  "text-sm font-medium mb-0.5",
                  isSameDay(day, new Date())
                    ? "text-brand-blue-dark"
                    : draggingAppointment && isSameDay(day, dropIndicator.date)
                      ? "text-brand-blue"
                      : "text-gray-600",
                )}
              >
                {format(day, "EEE")}
              </div>
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium mx-auto",
                  isSameDay(day, new Date())
                    ? "bg-brand-blue-dark text-white"
                    : draggingAppointment && isSameDay(day, dropIndicator.date)
                      ? "bg-brand-blue-light/40 text-brand-blue-dark"
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
              <div key={`time-slot-hour-${uuidv4()}`} className="text-sm text-gray-500">
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
                  "bg-brand-blue-light/20",
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
                  className="absolute left-0 right-0 bg-brand-blue-dark/10 border border-brand-blue-dark/20 z-20"
                  style={getSelectionStyles()}
                />
              )}

              {/* Drop indicator for appointment drag and drop */}
              <DropIndicator
                dropIndicator={dropIndicator}
                draggingAppointment={draggingAppointment}
                getAppointmentTextColor={getAppointmentTextColor}
                style={{
                  left: 0,
                  right: 0,
                }}
                className={!isSameDay(day, dropIndicator.date) ? "hidden" : ""}
              />

              {/* Current time indicator */}
              {isSameDay(day, new Date()) && (
                <div
                  className="absolute left-0 right-0 border-t-2 border-brand-blue-dark z-10"
                  style={{
                    top: `${((new Date().getHours() * 60 + new Date().getMinutes()) / (24 * 60)) * 100}%`,
                  }}
                >
                  <div className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-brand-blue-dark" />
                </div>
              )}

              {/* Render appointments */}
              {getOverlappingAppointments(filterAppointmentsByDate(appointments, day)).map(
                (group) =>
                  group.map((appointment, index) => {
                    // Instead of skipping, apply opacity if it's the dragging appointment
                    const isDragging =
                      draggingAppointment && draggingAppointment.id === appointment.id;

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
                          "absolute rounded-lg border cursor-pointer overflow-hidden group transition-colors hover:shadow-md text-left cursor-grab select-none",
                          isCompact ? "px-0.5 py-0.5" : isMedium ? "px-1 py-1" : "px-2 py-1.5",
                          getAppointmentColors(appointment.type),
                          getAppointmentStatusColors(appointment.status),
                          isDragging && "shadow-lg",
                        )}
                        style={getAppointmentStyle(appointment, index, group.length)}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAppointmentClick(appointment);
                        }}
                        onMouseDown={(e) => onAppointmentDragStart(appointment, e)}
                      >
                        <div className={cn("flex flex-col", isCompact ? "gap-0" : "gap-1")}>
                          <AppointmentCard
                            appointment={appointment}
                            durationInMinutes={durationInMinutes}
                            isCompact={isCompact}
                            isMedium={isMedium}
                            showAvatar={showAvatar}
                            isDragging={!!isDragging}
                            getAvatarColors={getAvatarColors}
                            getAppointmentTextColor={getAppointmentTextColor}
                          />
                        </div>
                      </button>
                    );
                  }),
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
