import { useUserRole } from "@/hooks/useUserRole";
import { AdminDayView } from "./AdminDayView";
import { ProviderDayView } from "./ProviderDayView";
import { Appointment, DropIndicator } from "./types";

interface DayViewProps {
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
  dropIndicator: DropIndicator;
}

export function DayView({
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
}: DayViewProps) {
  const { isAdmin } = useUserRole();

  // Common props to pass to both components
  const commonProps = {
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
  };

  // Render appropriate view based on user role
  if (isAdmin) {
    return <AdminDayView {...commonProps} />;
  }

  return <ProviderDayView {...commonProps} />;
}
