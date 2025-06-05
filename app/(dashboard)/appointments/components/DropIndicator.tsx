import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Appointment, DropIndicator as DropIndicatorType } from "./types";

interface DropIndicatorProps {
  dropIndicator: DropIndicatorType;
  draggingAppointment: Appointment | null;
  getAppointmentTextColor: (type: Appointment["type"]) => string;
  style?: React.CSSProperties;
  className?: string;
  showTime?: boolean;
  variant?: "default" | "week";
}

export function DropIndicator({
  dropIndicator,
  draggingAppointment,
  getAppointmentTextColor,
  style,
  className,
  showTime = true,
  variant = "default",
}: DropIndicatorProps) {
  if (!dropIndicator.isVisible || !draggingAppointment) {
    return null;
  }

  const getBackgroundColors = (type: Appointment["type"]) => {
    switch (type) {
      case "therapy":
        return {
          border: "bg-[#8A03D3]/40 border-[#8A03D3]/40",
          background: "bg-[#8A03D3]/30",
        };
      case "consultation":
        return {
          border: "bg-[#035DD3]/40 border-[#035DD3]/40",
          background: "bg-[#035DD3]/30",
        };
      case "followup":
        return {
          border: "bg-[#D36203]/40 border-[#D36203]/40",
          background: "bg-[#D36203]/30",
        };
      default:
        return {
          border: "bg-[#03A10B]/40 border-[#03A10B]/40",
          background: "bg-[#03A10B]/30",
        };
    }
  };

  const colors = getBackgroundColors(draggingAppointment.type);

  return (
    <div
      className={cn(
        "absolute border z-30 pointer-events-none rounded-md overflow-hidden animate-pulse",
        colors.border,
        className,
      )}
      style={{
        top: dropIndicator.top,
        height: dropIndicator.height,
        ...style,
      }}
    >
      <div
        className={cn(
          "h-full w-full rounded-md p-2",
          variant === "week" ? "flex flex-col justify-center" : "flex flex-col",
          colors.background,
        )}
      >
        <div
          className={cn(
            "text-xs font-medium truncate",
            getAppointmentTextColor(draggingAppointment.type),
          )}
        >
          {draggingAppointment.patient.firstName} {draggingAppointment.patient.lastName}
          {showTime && variant === "default" && (
            <span className="ml-2 text-[10px] opacity-70 italic">
              {format(
                new Date(dropIndicator.date).setHours(
                  Math.floor(((Number.parseFloat(dropIndicator.top) / 100) * 24 * 60) / 60),
                  Math.floor(((Number.parseFloat(dropIndicator.top) / 100) * 24 * 60) % 60),
                ),
                "h:mm a",
              )}
            </span>
          )}
        </div>
        {showTime && (
          <div className="text-[10px] opacity-70 truncate">
            {format(draggingAppointment.startTime, "h:mm a")} -{" "}
            {format(draggingAppointment.endTime, "h:mm a")}
          </div>
        )}
      </div>
    </div>
  );
}
