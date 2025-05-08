import { addDays, format, startOfWeek } from "date-fns";
import { useState } from "react";
import { CalendarEvent } from "./CalendarEvent";
import { TimeGrid } from "./TimeGrid";

interface Appointment {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  type: "focus" | "lunch" | "meeting" | "busy";
  description?: string;
}

interface WeeklyCalendarProps {
  appointments: Appointment[];
  onEventClick: (appointment: Appointment) => void;
}

export function WeeklyCalendar({ appointments, onEventClick }: WeeklyCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });

  // Generate week days
  const weekDays = Array.from({ length: 5 }, (_, i) => {
    const date = addDays(weekStart, i);
    return {
      date,
      dayName: format(date, "EEE"),
      dayNumber: format(date, "d"),
    };
  });

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      {/* Header */}
      <div className="flex border-b">
        <div className="w-20 border-r p-2 text-sm text-gray-500">Time</div>
        <div className="flex-1 grid grid-cols-5">
          {weekDays.map((day) => (
            <div key={day.date.toString()} className="p-2 text-center border-r last:border-r-0">
              <div className="text-sm font-medium text-gray-900">{day.dayName}</div>
              <div className="text-2xl font-semibold text-gray-900">{day.dayNumber}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Time Grid */}
      <div className="flex">
        <TimeGrid />
        <div className="flex-1 grid grid-cols-5 relative">
          {/* Time slots background */}
          <div className="absolute inset-0 grid grid-rows-[repeat(24,_minmax(60px,_1fr))]">
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="border-b border-gray-100" />
            ))}
          </div>

          {/* Events */}
          {appointments.map((appointment) => (
            <CalendarEvent
              key={appointment.id}
              appointment={appointment}
              onClick={() => onEventClick(appointment)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
