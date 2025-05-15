import { cn } from "@/lib/utils";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { Appointment } from "./types";

interface MonthViewProps {
  date: Date;
  appointments: Appointment[];
  onDateSelect: (date: Date) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  getAppointmentColors: (type: Appointment["type"]) => string;
  getAppointmentStatusColors: (type: Appointment["status"]) => string;
  filterAppointmentsByDate: (appointments: Appointment[], date: Date) => Appointment[];
}

export function MonthView({
  date,
  appointments,
  onDateSelect,
  onAppointmentClick,
  getAppointmentColors,
  getAppointmentStatusColors,
  filterAppointmentsByDate,
}: MonthViewProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Month grid header */}
      <div className="grid grid-cols-7 border-b bg-white">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="px-2 py-3 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Month grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-[repeat(6,_1fr)] divide-x divide-y">
        {eachDayOfInterval({
          start: startOfWeek(startOfMonth(date), { weekStartsOn: 0 }),
          end: endOfWeek(endOfMonth(date), { weekStartsOn: 0 }),
        }).map((day) => (
          <button
            key={format(day, "yyyy-MM-dd")}
            type="button"
            className={cn(
              "min-h-[120px] bg-white p-2 relative text-left",
              !isSameMonth(day, date) && "bg-gray-50",
              isSameDay(day, new Date()) && "bg-[#8A03D3]/5",
            )}
            onClick={() => onDateSelect(day)}
            aria-label={format(day, "EEEE, MMMM d, yyyy")}
          >
            {/* Date number */}
            <div
              className={cn(
                "inline-flex h-6 w-6 items-center justify-center rounded-full text-sm",
                !isSameMonth(day, date) && "text-gray-400",
                isSameDay(day, new Date()) && "bg-[#8A03D3] text-white",
                isSameMonth(day, date) &&
                  !isSameDay(day, new Date()) &&
                  "text-gray-900 hover:bg-gray-100",
              )}
            >
              {format(day, "d")}
            </div>

            {/* Appointments for the day */}
            <div className="mt-1 space-y-1">
              {filterAppointmentsByDate(appointments, day)
                .slice(0, 3) // Show max 3 appointments
                .map((appointment) => (
                  <button
                    key={appointment.id}
                    type="button"
                    className={cn(
                      "w-full text-left text-xs px-2 py-1 rounded-md truncate",
                      !isSameMonth(day, date) ? "opacity-50" : "",
                      getAppointmentColors(appointment.type),
                      getAppointmentStatusColors(appointment.status),
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAppointmentClick(appointment);
                    }}
                    aria-label={`${appointment.patient.firstName} ${appointment.patient.lastName}'s ${appointment.type} appointment at ${format(appointment.startTime, "h:mm a")}`}
                  >
                    {appointment.patient.firstName} {appointment.patient.lastName}
                  </button>
                ))}
              {filterAppointmentsByDate(appointments, day).length > 3 && (
                <div
                  className={cn(
                    "text-xs text-gray-500 pl-2",
                    !isSameMonth(day, date) && "opacity-50",
                  )}
                >
                  +{filterAppointmentsByDate(appointments, day).length - 3} more
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
