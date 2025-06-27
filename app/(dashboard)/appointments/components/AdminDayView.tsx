import { UserAvatar } from "@/components/molecules";
import { cn } from "@/lib/utils";
import { getAllProviders, getProviderFullName } from "@/utils/provider.utils";
import { format } from "date-fns";
import React from "react";
import { v4 as uuidv4 } from "uuid";
import { AppointmentCard } from "./AppointmentCard";
import { DropIndicator } from "./DropIndicator";
import { Appointment, DropIndicator as DropIndicatorType } from "./types";

interface AdminDayViewProps {
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

export function AdminDayView({
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
}: AdminDayViewProps) {
  const allProviders = getAllProviders();

  // Always declare hooks at the top level (before any conditional logic)
  const [headerScrollRef, setHeaderScrollRef] = React.useState<HTMLDivElement | null>(null);
  const [gridScrollRef, setGridScrollRef] = React.useState<HTMLDivElement | null>(null);
  const [activeProviderId, setActiveProviderId] = React.useState<string | null>(null);

  // Synchronize scroll between header and grid
  const handleHeaderScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (gridScrollRef) {
      gridScrollRef.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  const handleGridScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (headerScrollRef) {
      headerScrollRef.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  return (
    <div className="bg-white overflow-hidden rounded-lg h-full max-h-screen overflow-y-auto">
      {/* Provider headers row */}
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-30">
        <div className="flex">
          {/* Time column header */}
          <div className="w-16 flex-shrink-0 p-3 sticky left-0 bg-white z-40"></div>

          {/* Provider columns headers with horizontal scroll */}
          <div
            ref={setHeaderScrollRef}
            className="flex-1 overflow-x-auto scrollbar-hide"
            onScroll={handleHeaderScroll}
          >
            <div className="flex" style={{ minWidth: `${allProviders.length * 192}px` }}>
              {allProviders.map((provider, index) => (
                <div key={provider.providerId} className="flex-1 min-w-48 p-3">
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
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="flex relative">
        {/* Current time indicator - spans across provider columns only */}
        <div
          className="absolute border-t-2 border-brand-blue-dark z-20 pointer-events-none"
          style={{
            top: `${((new Date().getHours() * 60 + new Date().getMinutes()) / (24 * 60)) * 100}%`,
            left: "64px", // Start after the time column (w-16 = 64px)
            right: "0",
          }}
        >
          <div className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-brand-blue-dark" />
        </div>

        {/* Time slots column */}
        <div className="w-16 flex-shrink-0 sticky left-0 bg-white z-20">
          <div className="grid grid-rows-[repeat(24,_minmax(60px,_1fr))]">
            {Array.from({ length: 24 }, (_, i) => (
              <div
                key={`time-slot-${uuidv4()}`}
                className="text-xs text-zinc-500 p-2 flex items-start"
              >
                {format(new Date().setHours(i, 0), "h a")}
              </div>
            ))}
          </div>
        </div>

        {/* Provider columns with horizontal scroll */}
        <div
          ref={setGridScrollRef}
          className="flex-1 overflow-x-auto scrollbar-hide"
          onScroll={handleGridScroll}
        >
          <div className="flex" style={{ minWidth: `${allProviders.length * 192}px` }}>
            {allProviders.map((provider, providerIndex) => (
              <div
                key={provider.providerId}
                className={cn(
                  "flex-1 min-w-48 relative",
                  providerIndex < allProviders.length - 1 && "border-r border-zinc-200",
                )}
              >
                {/* Time grid lines */}
                <div className="absolute inset-0 grid grid-rows-[repeat(24,_minmax(60px,_1fr))] pointer-events-none">
                  {Array.from({ length: 24 }, (_, i) => (
                    <div
                      key={`grid-line-${provider.providerId}-${i}`}
                      className="border-b border-zinc-100"
                    />
                  ))}
                </div>

                {/* Provider column content area */}
                <div
                  className="relative h-full select-none"
                  style={{ height: `${24 * 60}px` }} // 24 hours * 60px per hour
                  data-provider-id={provider.providerId}
                  onMouseDown={(e) => {
                    // Stop propagation to prevent affecting other columns
                    e.stopPropagation();
                    setActiveProviderId(provider.providerId);
                    onMouseDown(e);
                  }}
                  onMouseMove={(e) => {
                    // Stop propagation to prevent affecting other columns
                    e.stopPropagation();
                    // Only handle mouse move if this is the active provider
                    if (activeProviderId === provider.providerId || activeProviderId === null) {
                      onMouseMove(e);
                      onAppointmentDragOver(e, date);
                    }
                  }}
                  onMouseUp={(e) => {
                    // Stop propagation to prevent affecting other columns
                    e.stopPropagation();
                    onMouseUp();
                    onAppointmentDragEnd();
                    setActiveProviderId(null);
                  }}
                  onMouseLeave={(e) => {
                    // Stop propagation to prevent affecting other columns
                    e.stopPropagation();
                    onMouseLeave();
                    onAppointmentDragEnd();
                    setActiveProviderId(null);
                  }}
                >
                  {/* Selection overlay - only show in the active provider column */}
                  {dragStart && dragEnd && activeProviderId === provider.providerId && (
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
                    className={activeProviderId !== provider.providerId ? "hidden" : ""}
                  />

                  {/* Render appointments for this provider */}
                  {getOverlappingAppointments(
                    filterAppointmentsByDate(appointments, date).filter(
                      (appointment) =>
                        // For now, we'll show all appointments in each column
                        // In a real app, you'd filter by provider ID
                        true,
                    ),
                  ).map((group) =>
                    group.map((appointment, index) => {
                      // Instead of skipping, apply opacity if it's the dragging appointment
                      const isDragging =
                        draggingAppointment && draggingAppointment.id === appointment.id;

                      const durationInMinutes =
                        (appointment.endTime?.getTime() - appointment.startTime.getTime()) /
                        (60 * 1000);
                      const heightInPixels = (durationInMinutes / (24 * 60)) * 1440;

                      const isCompact = durationInMinutes <= 15;
                      const isMedium = durationInMinutes > 15 && durationInMinutes < 30;
                      const isRegular = durationInMinutes >= 30;

                      const showAvatar = !isCompact && heightInPixels >= 24;

                      return (
                        <div
                          key={`${provider.providerId}-${appointment.id}`}
                          data-appointment="true"
                          className={cn(
                            "absolute rounded-md border cursor-pointer overflow-hidden group transition-colors hover:shadow-md cursor-grab select-none mx-1",
                            isCompact ? "px-1 py-0.5" : isMedium ? "px-1.5 py-1" : "px-2 py-1.5",
                            getAppointmentColors(appointment.type),
                            getAppointmentStatusColors(appointment.status),
                            isDragging && "shadow-lg",
                          )}
                          style={{
                            ...getAppointmentStyle(appointment, index, group.length),
                            width: "calc(100% - 8px)", // Account for mx-1
                            left: "4px", // Account for mx-1
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAppointmentClick(appointment);
                          }}
                          onMouseDown={(e) => onAppointmentDragStart(appointment, e)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              onAppointmentClick(appointment);
                            }
                          }}
                        >
                          <div className={cn("flex flex-col", isCompact ? "gap-0" : "gap-0.5")}>
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
                        </div>
                      );
                    }),
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
