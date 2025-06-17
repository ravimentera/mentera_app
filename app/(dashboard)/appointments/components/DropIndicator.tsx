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
      case "consultation":
        return {
          border: "bg-brand-purple-dark/40 border-brand-purple-dark/40",
          background: "bg-brand-purple-dark/30",
        };
      case "followup":
        return {
          border: "bg-brand-blue/40 border-brand-blue/40",
          background: "bg-brand-blue/30",
        };
      case "therapy":
        return {
          border: "bg-brand-amber/40 border-brand-amber/40",
          background: "bg-brand-amber/30",
        };
      case "general":
        return {
          border: "bg-brand-green/40 border-brand-green/40",
          background: "bg-brand-green/30",
        };
      default:
        return {
          border: "",
          background: "",
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
