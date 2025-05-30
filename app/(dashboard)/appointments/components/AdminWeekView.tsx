import { UserAvatar } from "@/components/molecules";
import { cn } from "@/lib/utils";
import { getAllProviders, getProviderFullName } from "@/utils/provider.utils";
import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import React from "react";
import { Appointment, DropIndicator } from "./types";

interface AdminWeekViewProps {
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

export function AdminWeekView({
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
}: AdminWeekViewProps) {
  const allProviders = getAllProviders();
  const [activeProviderDay, setActiveProviderDay] = React.useState<string | null>(null);

  const getWeekDays = (currentDate: Date) => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start from Monday
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const weekDays = getWeekDays(date);

  return (
    <div className="bg-white overflow-hidden rounded-lg h-full max-h-screen overflow-y-auto">
      {/* Header row */}
      <div className="sticky top-0 z-30 bg-white border-b border-zinc-200">
        <div className="grid grid-cols-[200px_repeat(7,_1fr)] gap-0">
          {/* Providers header */}
          <div className="p-4 bg-white flex items-center">
            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Providers
            </div>
          </div>

          {/* Day headers */}
          {weekDays.map((day, dayIndex) => (
            <div key={format(day, "yyyy-MM-dd")} className="p-4 pb-0 text-center bg-white">
              <div
                className={cn(
                  "inline-flex flex-col items-center gap-1 px-3 py-1 rounded-xl",
                  isSameDay(day, new Date()) && "bg-purple-100 border border-brand-purple-dark",
                )}
              >
                <div className="text-lg font-semibold text-zinc-900">{format(day, "d")}</div>
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  {format(day, "EEE")}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Provider rows */}
      <div className="divide-y divide-zinc-100">
        {allProviders.map((provider, providerIndex) => (
          <div
            key={provider.providerId}
            className="grid grid-cols-[200px_repeat(7,_1fr)] gap-0 border-t border-zinc-100 first:border-t-0"
          >
            {/* Provider info column */}
            <div className="p-4 pb-0 bg-white sticky left-0 z-20 border-r border-zinc-200">
              <div className="flex items-center gap-3">
                {provider.avatar ? (
                  <UserAvatar
                    avatar={provider.avatar}
                    name={getProviderFullName(provider)}
                    size="medium"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-zinc-400 text-white font-medium flex items-center justify-center text-sm">
                    {provider.firstName.charAt(0)}
                    {provider.lastName.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-zinc-900 truncate">
                    {getProviderFullName(provider)}
                  </div>
                  <div className="text-xs text-zinc-500 truncate">{provider.role}</div>
                </div>
              </div>
            </div>

            {/* Day columns for this provider */}
            {weekDays.map((day, dayIndex) => {
              const dayKey = `${provider.providerId}-${format(day, "yyyy-MM-dd")}`;
              const dayAppointments = filterAppointmentsByDate(appointments, day);

              return (
                <div
                  key={dayKey}
                  className={cn(
                    "relative min-h-[80px] border-r border-zinc-100 last:border-r-0 p-2",
                    activeProviderDay === dayKey && "bg-brand-purple-light/10",
                  )}
                  data-provider-id={provider.providerId}
                  data-day={format(day, "yyyy-MM-dd")}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setActiveProviderDay(dayKey);
                    onMouseDown(e, day);
                  }}
                  onMouseMove={(e) => {
                    e.stopPropagation();
                    if (activeProviderDay === dayKey || activeProviderDay === null) {
                      onMouseMove(e);
                      onAppointmentDragOver(e, day);
                    }
                  }}
                  onMouseUp={(e) => {
                    e.stopPropagation();
                    onMouseUp();
                    onAppointmentDragEnd();
                    setActiveProviderDay(null);
                  }}
                  onMouseLeave={(e) => {
                    e.stopPropagation();
                    onMouseLeave();
                    setActiveProviderDay(null);
                  }}
                >
                  {/* Selection overlay - only show in the active provider-day cell */}
                  {dragStart && dragEnd && activeProviderDay === dayKey && (
                    <div
                      className="absolute inset-0 bg-brand-purple-dark/10 border border-brand-purple-dark/20 z-20 rounded-md"
                      style={getSelectionStyles()}
                    />
                  )}

                  {/* Drop indicator for appointment drag and drop */}
                  {dropIndicator.isVisible &&
                    draggingAppointment &&
                    activeProviderDay === dayKey &&
                    isSameDay(day, dropIndicator.date) && (
                      <div
                        className={cn(
                          "absolute inset-x-1 border z-30 pointer-events-none rounded-md overflow-hidden animate-pulse",
                          draggingAppointment.type === "therapy"
                            ? "bg-[#8A03D3]/40 border-[#8A03D3]/40"
                            : draggingAppointment.type === "consultation"
                              ? "bg-[#035DD3]/40 border-[#035DD3]/40"
                              : draggingAppointment.type === "followup"
                                ? "bg-[#D36203]/40 border-[#D36203]/40"
                                : "bg-[#03A10B]/40 border-[#03A10B]/40",
                        )}
                        style={{
                          top: "8px",
                          height: "calc(100% - 16px)",
                        }}
                      >
                        <div
                          className={cn(
                            "h-full w-full rounded-md p-2 flex flex-col justify-center",
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
                            {draggingAppointment.patient.firstName}{" "}
                            {draggingAppointment.patient.lastName}
                          </div>
                          <div className="text-[10px] opacity-70 truncate">
                            {format(draggingAppointment.startTime, "h:mm a")} -{" "}
                            {format(draggingAppointment.endTime, "h:mm a")}
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Render appointments for this provider and day */}
                  <div className="space-y-1">
                    {dayAppointments
                      .filter((appointment) => {
                        // For now, show all appointments in each provider row
                        // In a real app, you'd filter by provider ID
                        return true;
                      })
                      .map((appointment, index) => {
                        const isDragging =
                          draggingAppointment && draggingAppointment.id === appointment.id;

                        return (
                          <div
                            key={`${dayKey}-${appointment.id}`}
                            data-appointment="true"
                            className={cn(
                              "rounded-md border cursor-pointer overflow-hidden group transition-all hover:shadow-sm cursor-grab select-none p-2",
                              getAppointmentColors(appointment.type),
                              getAppointmentStatusColors(appointment.status),
                              isDragging && "opacity-40 shadow-lg",
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              onAppointmentClick(appointment);
                            }}
                            onMouseDown={(e) => onAppointmentDragStart(appointment, e)}
                          >
                            <div className="flex items-center gap-2">
                              {/* Status icon */}
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
                              <div className="min-w-0 flex-1">
                                <div
                                  className={cn(
                                    "text-xs font-medium truncate",
                                    getAppointmentTextColor(appointment.type),
                                  )}
                                >
                                  {appointment.patient.firstName} {appointment.patient.lastName}
                                </div>
                                <div className="text-[10px] opacity-70 truncate">
                                  {format(appointment.startTime, "h:mm a")} -{" "}
                                  {format(appointment.endTime, "h:mm a")}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
