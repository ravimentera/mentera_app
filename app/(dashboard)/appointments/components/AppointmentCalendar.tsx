import { mockAppointments, updateAppointmentNotificationStatus } from "@/mock/appointments.data";
import { addDays, addMonths, addWeeks, set, subDays, subMonths, subWeeks } from "date-fns";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAppointmentForm } from "../hooks/useAppointmentForm";
import { AppointmentDialog } from "./AppointmentDialog";
import { CalendarHeader } from "./CalendarHeader";
import { DayView } from "./DayView";
import { MonthView } from "./MonthView";
import { WeekView } from "./WeekView";
import { Appointment } from "./types";
import {
  filterAppointmentsByDate,
  generateCareInstructions,
  getAppointmentColors,
  getAppointmentStyle,
  getAppointmentTextColor,
  getAvatarColors,
  getOverlappingAppointments,
} from "./utils";

interface AppointmentCalendarProps {
  appointments?: Appointment[];
  onAppointmentClick?: (appointment: Appointment) => void;
  onDateChange?: (date: Date) => void;
  initialView?: "day" | "week" | "month";
}

export function AppointmentCalendar({
  appointments = mockAppointments as Appointment[],
  onAppointmentClick,
  onDateChange,
  initialView = "week",
}: AppointmentCalendarProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<"day" | "week" | "month">(initialView ?? "week");
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragEnd, setDragEnd] = useState<number | null>(null);
  const [showNewAppointmentDialog, setShowNewAppointmentDialog] = useState(false);
  const [calendarAppointments, setCalendarAppointments] = useState<Appointment[]>(appointments);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);
  const [editedMessage, setEditedMessage] = useState<string>("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const {
    formData,
    setFormData,
    editFormData,
    setEditFormData,
    formError,
    setFormError,
    resetForm,
    createAppointment,
    updateAppointment,
  } = useAppointmentForm({
    mode: showNewAppointmentDialog ? "new" : "edit",
    appointment: editingAppointment,
    dragStart,
    dragEnd,
  });

  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showNewAppointmentDialog) {
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 0);
    }
  }, [showNewAppointmentDialog]);

  // Convert mouse position to time
  const getTimeFromMousePosition = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const y = event.clientY - rect.top;
      const totalMinutes = Math.floor((y / rect.height) * 24 * 60);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = Math.floor((totalMinutes % 60) / 15) * 15; // Round to nearest 15 minutes
      return set(date, { hours, minutes });
    },
    [date],
  );

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>, selectedDay?: Date) => {
    // Check if clicking on an appointment
    const target = event.target as HTMLElement;
    if (target.closest('[data-appointment="true"]')) {
      return; // Don't start drag if clicking on an appointment
    }

    // Update the selected date if provided (for week view)
    if (selectedDay) {
      setDate(selectedDay);
    }

    const startTime = getTimeFromMousePosition(event);
    setIsDragging(true);
    setDragStart(startTime.getTime());
    setDragEnd(startTime.getTime() + 15 * 60 * 1000); // Add 15 minutes by default
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      const currentTime = getTimeFromMousePosition(event);
      setDragEnd(currentTime.getTime());
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setShowNewAppointmentDialog(true);
    }
  };

  const resetDragSelection = () => {
    setDragStart(null);
    setDragEnd(null);
    setIsDragging(false);
  };

  // Calculate selection styles
  const getSelectionStyles = () => {
    if (!dragStart || !dragEnd) return undefined;

    const startPercent =
      ((new Date(dragStart).getHours() * 60 + new Date(dragStart).getMinutes()) / (24 * 60)) * 100;
    const endPercent =
      ((new Date(dragEnd).getHours() * 60 + new Date(dragEnd).getMinutes()) / (24 * 60)) * 100;
    const top = Math.min(startPercent, endPercent);
    const height = Math.abs(endPercent - startPercent);

    return {
      top: `${top}%`,
      height: `${height}%`,
    } as const;
  };

  const handleCreateAppointment = () => {
    const newAppointment = createAppointment();
    if (newAppointment) {
      setCalendarAppointments((prev) => [...prev, newAppointment]);
      setShowNewAppointmentDialog(false);
      resetDragSelection();
      resetForm();
    }
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setShowEditDialog(true);
  };

  const handleSaveAppointment = (appointmentData: Partial<Appointment>) => {
    if (!appointmentData.id) {
      // Create new appointment
      const newAppointment: Appointment = {
        id: Math.random().toString(36).substr(2, 9),
        patientId: "temp-patient-id",
        chartId: "temp-chart-id",
        patient: {
          firstName: appointmentData.patient?.firstName || "",
          lastName: appointmentData.patient?.lastName || "",
        },
        provider: {
          providerId: "temp-provider-id",
          firstName: "Doctor",
          lastName: "Name",
          specialties: [],
        },
        startTime: appointmentData.startTime || new Date(),
        endTime: appointmentData.endTime || new Date(),
        status: "scheduled",
        notes: appointmentData.notes,
        type: appointmentData.type || "general",
      };
      setCalendarAppointments((prev) => [...prev, newAppointment]);
    } else {
      // Update existing appointment
      setCalendarAppointments((prev) =>
        prev.map((apt) => (apt.id === appointmentData.id ? { ...apt, ...appointmentData } : apt)),
      );
    }
  };

  const handleDeleteAppointment = (appointment: Appointment) => {
    setCalendarAppointments((prev) => prev.filter((apt) => apt.id !== appointment.id));
    toast.error("Appointment deleted");
  };

  const handleUpdateAppointment = () => {
    const updatedAppointment = updateAppointment();
    if (updatedAppointment) {
      setCalendarAppointments((prev) =>
        prev.map((apt) => (apt.id === updatedAppointment.id ? updatedAppointment : apt)),
      );
      setShowEditDialog(false);
      setEditingAppointment(null);
      resetForm();
    }
  };

  const handlePrevious = () => {
    const newDate =
      view === "day" ? subDays(date, 1) : view === "week" ? subWeeks(date, 1) : subMonths(date, 1);
    setDate(newDate);
    onDateChange?.(newDate);
  };

  const handleNext = () => {
    const newDate =
      view === "day" ? addDays(date, 1) : view === "week" ? addWeeks(date, 1) : addMonths(date, 1);
    setDate(newDate);
    onDateChange?.(newDate);
  };

  const handleApproveAndSend = () => {
    if (editingAppointment) {
      // We are updating only the appointment that was being edited.
      // Instead of using mockAppointments (which accumulates state and causes duplicates),
      // we directly update the local state (calendarAppointments) to keep things in sync and isolated.
      const updatedAppointments = calendarAppointments.map(
        (apt) =>
          apt.id === editingAppointment.id
            ? {
                ...apt,
                notificationStatus: {
                  ...apt.notificationStatus,
                  status: "approved", // Set the status to approved
                  sent: true, // Mark that the notification was sent
                  message: editedMessage || apt.notes, // Use the edited message or fall back to notes
                  type: apt.notificationStatus?.type || "pre-care", // Retain type or default to "pre-care"
                },
              }
            : apt, // No change for other appointments
      );

      // Update the state with the modified appointment list
      setCalendarAppointments(updatedAppointments as Appointment[]);

      // Show success message and reset dialog state
      toast.success("Care instructions have been approved and sent to the patient.");
      setShowEditDialog(false);
      setEditingAppointment(null);
      setEditedMessage("");
    }
  };

  const handleDeclineAndRegenerate = () => {
    if (editingAppointment) {
      setIsGeneratingMessage(true);
      // Simulate message regeneration
      setTimeout(() => {
        const instructions = generateCareInstructions(editingAppointment);

        // Update the appointment both in local state and in the mock data storage
        const updatedAppointments = updateAppointmentNotificationStatus(
          editingAppointment.id,
          "disapproved",
          false,
        );

        // Update the calendar appointments state with our newly updated list
        setCalendarAppointments(updatedAppointments as Appointment[]);

        setIsGeneratingMessage(false);
        toast.error("Care instructions have been declined.");
        setShowEditDialog(false);
        setEditingAppointment(null);
        setEditedMessage("");
      }, 1000);
    }
  };

  return (
    <div className="bg-white rounded-lg border flex flex-col h-[calc(100vh-8rem)]">
      <CalendarHeader
        date={date}
        view={view}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onDateChange={(newDate) => {
          setDate(newDate);
          onDateChange?.(newDate);
        }}
        onViewChange={setView}
        isDatePickerOpen={isDatePickerOpen}
        setIsDatePickerOpen={setIsDatePickerOpen}
      />

      {/* Day View - Scrollable Container */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {view === "day" ? (
            <DayView
              date={date}
              appointments={calendarAppointments}
              isDragging={isDragging}
              dragStart={dragStart}
              dragEnd={dragEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => setIsDragging(false)}
              getSelectionStyles={getSelectionStyles}
              getOverlappingAppointments={getOverlappingAppointments}
              filterAppointmentsByDate={filterAppointmentsByDate}
              getAppointmentStyle={getAppointmentStyle}
              getAppointmentColors={getAppointmentColors}
              getAvatarColors={getAvatarColors}
              getAppointmentTextColor={getAppointmentTextColor}
              onAppointmentClick={handleAppointmentClick}
            />
          ) : view === "week" ? (
            <WeekView
              date={date}
              appointments={calendarAppointments}
              isDragging={isDragging}
              dragStart={dragStart}
              dragEnd={dragEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => setIsDragging(false)}
              getSelectionStyles={getSelectionStyles}
              getOverlappingAppointments={getOverlappingAppointments}
              filterAppointmentsByDate={filterAppointmentsByDate}
              getAppointmentStyle={getAppointmentStyle}
              getAppointmentColors={getAppointmentColors}
              getAvatarColors={getAvatarColors}
              getAppointmentTextColor={getAppointmentTextColor}
              onAppointmentClick={handleAppointmentClick}
            />
          ) : view === "month" ? (
            <MonthView
              date={date}
              appointments={calendarAppointments}
              onDateSelect={(selectedDate) => {
                setDate(selectedDate);
                setView("day");
              }}
              onAppointmentClick={handleAppointmentClick}
              getAppointmentColors={getAppointmentColors}
              filterAppointmentsByDate={filterAppointmentsByDate}
            />
          ) : null}
        </div>
      </div>

      {/* Appointment Dialogs */}
      <AppointmentDialog
        mode="new"
        open={showNewAppointmentDialog}
        onOpenChange={setShowNewAppointmentDialog}
        dragStart={dragStart}
        dragEnd={dragEnd}
        onSave={handleSaveAppointment}
        resetDragSelection={resetDragSelection}
      />

      <AppointmentDialog
        mode="edit"
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        appointment={editingAppointment}
        onSave={handleSaveAppointment}
        onDelete={handleDeleteAppointment}
        onApproveAndSend={handleApproveAndSend}
        onDeclineAndRegenerate={handleDeclineAndRegenerate}
        generateCareInstructions={generateCareInstructions}
      />
    </div>
  );
}
