import { format } from "date-fns";
import { useState } from "react";

interface Appointment {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  type: "focus" | "lunch" | "meeting" | "busy";
  description?: string;
}

interface CalendarEventProps {
  appointment: Appointment;
  onClick: () => void;
}

export function CalendarEvent({ appointment, onClick }: CalendarEventProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Calculate position and height
  const startHour = appointment.startTime.getHours();
  const startMinutes = appointment.startTime.getMinutes();
  const endHour = appointment.endTime.getHours();
  const endMinutes = appointment.endTime.getMinutes();

  const startPosition = startHour + startMinutes / 60;
  const duration = endHour - startHour + (endMinutes - startMinutes) / 60;

  const dayOfWeek = appointment.startTime.getDay();

  const getEventColor = (type: Appointment["type"]) => {
    switch (type) {
      case "focus":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "lunch":
        return "bg-green-100 text-green-700 border-green-200";
      case "meeting":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "busy":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const timeString = `${format(appointment.startTime, "h:mm a")} - ${format(appointment.endTime, "h:mm a")}`;

  return (
    <button
      type="button"
      className={`absolute rounded-lg border p-2 mx-1 text-left hover:opacity-90 ${getEventColor(
        appointment.type,
      )}`}
      style={{
        top: `${startPosition * 60}px`,
        height: `${duration * 60}px`,
        left: `${(dayOfWeek - 1) * 20}%`,
        right: `${100 - dayOfWeek * 20}%`,
      }}
      onClick={onClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      aria-label={`${appointment.title} - ${timeString}`}
    >
      <div className="text-sm font-medium truncate">{appointment.title}</div>
      <div className="text-xs">{timeString}</div>

      {showTooltip && (
        <div
          className="absolute z-10 bg-white rounded-lg shadow-lg border p-3 w-64 mt-2"
          role="tooltip"
          aria-label={`Details for ${appointment.title}`}
        >
          <h4 className="font-medium text-gray-900">{appointment.title}</h4>
          <p className="text-sm text-gray-500 mt-1">{timeString}</p>
          {appointment.description && (
            <p className="text-sm text-gray-600 mt-2">{appointment.description}</p>
          )}
        </div>
      )}
    </button>
  );
}
