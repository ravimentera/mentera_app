"use client";

import {
  addDays,
  addMonths,
  addWeeks,
  parseISO,
  set,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import type { AppDispatch, RootState } from "@/lib/store";
import {
  Appointment,
  addAppointment,
  deleteAppointment,
  selectAllAppointments,
  updateAppointment,
  updateAppointmentNotification,
} from "@/lib/store/appointmentsSlice";
// Redux imports
import { useDispatch, useSelector } from "react-redux";

// Component and utility imports
import { useAppointmentForm } from "../hooks/useAppointmentForm"; // Path to your hook
import { AppointmentDialog } from "./AppointmentDialog";
import { CalendarHeader } from "./CalendarHeader";
import { DayView } from "./DayView";
import { MonthView } from "./MonthView";
import { WeekView } from "./WeekView";
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
  appointments?: Appointment[]; // Prop to provide additional appointments to append
  onAppointmentClick?: (appointment: Appointment) => void;
  onDateChange?: (date: Date) => void;
  initialView?: "day" | "week" | "month";
}

export function AppointmentCalendar({
  appointments: appointmentsProp,
  onAppointmentClick,
  onDateChange,
  initialView = "week",
}: AppointmentCalendarProps) {
  const dispatch = useDispatch<AppDispatch>();
  const calendarAppointments = useSelector(selectAllAppointments);

  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<"day" | "week" | "month">(initialView);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragEnd, setDragEnd] = useState<number | null>(null);
  const [showNewAppointmentDialog, setShowNewAppointmentDialog] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);
  const [editedMessage, setEditedMessage] = useState<string>("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Ref to track the last processed appointmentsProp instance
  const processedAppointmentsPropRef = useRef<Appointment[] | undefined>();

  const {
    formData,
    setFormData,
    editFormData,
    setEditFormData,
    formError,
    validateForm,
    resetForm,
    createAppointment: createAppointmentFromHook,
    updateAppointment: updateAppointmentFromHook,
  } = useAppointmentForm({
    mode: showNewAppointmentDialog ? "new" : showEditDialog ? "edit" : "new",
    appointment: editingAppointment,
    dragStart,
    dragEnd,
  });

  const titleInputRef = useRef<HTMLInputElement>(null);

  // Effect to append appointments from props to the Redux store
  useEffect(() => {
    // Only process if appointmentsProp is new and different from the last one processed
    if (
      appointmentsProp &&
      appointmentsProp !== processedAppointmentsPropRef.current &&
      appointmentsProp.length > 0
    ) {
      console.log(
        "AppointmentCalendar: New appointmentsProp instance detected, dispatching addAppointment for each.",
      );
      appointmentsProp.forEach((aptProp) => {
        const processedApt = {
          ...aptProp,
          startTime:
            typeof aptProp.startTime === "string" ? parseISO(aptProp.startTime) : aptProp.startTime,
          endTime:
            typeof aptProp.endTime === "string" ? parseISO(aptProp.endTime) : aptProp.endTime,
          chatHistory: aptProp.chatHistory?.map((chat) => ({
            ...chat,
            timestamp:
              typeof chat.timestamp === "string" ? parseISO(chat.timestamp) : chat.timestamp,
          })),
        };
        dispatch(addAppointment(processedApt as Appointment));
      });
      // Mark this instance of appointmentsProp as processed
      processedAppointmentsPropRef.current = appointmentsProp;
    } else if (appointmentsProp && appointmentsProp === processedAppointmentsPropRef.current) {
      console.log(
        "AppointmentCalendar: appointmentsProp is the same instance, already processed by this effect.",
      );
    }
  }, [appointmentsProp, dispatch]);

  useEffect(() => {
    if (showNewAppointmentDialog && titleInputRef.current) {
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 0);
    }
  }, [showNewAppointmentDialog]);

  const getTimeFromMousePosition = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const y = event.clientY - rect.top;
      const totalMinutes = Math.floor((y / rect.height) * 24 * 60);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = Math.floor((totalMinutes % 60) / 15) * 15;
      return set(date, { hours, minutes });
    },
    [date],
  );

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>, selectedDay?: Date) => {
    const target = event.target as HTMLElement;
    if (target.closest('[data-appointment="true"]')) return;
    if (selectedDay) setDate(selectedDay);
    const startTime = getTimeFromMousePosition(event);
    setIsDragging(true);
    const startTimestamp = startTime.getTime();
    setDragStart(startTimestamp);
    setDragEnd(startTimestamp + 15 * 60 * 1000);
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

  const getSelectionStyles = () => {
    if (!dragStart || !dragEnd) return undefined;
    const start = new Date(dragStart);
    const end = new Date(dragEnd);
    const startPercent = ((start.getHours() * 60 + start.getMinutes()) / (24 * 60)) * 100;
    const endPercent = ((end.getHours() * 60 + end.getMinutes()) / (24 * 60)) * 100;
    const top = Math.min(startPercent, endPercent);
    const height = Math.abs(endPercent - startPercent);
    return { top: `${top}%`, height: `${height}%` } as const;
  };

  const handleSaveAppointment = () => {
    if (showNewAppointmentDialog) {
      const newAppointmentPayload = createAppointmentFromHook();
      if (newAppointmentPayload) {
        dispatch(addAppointment(newAppointmentPayload));
        toast.success("Appointment created successfully!");
        setShowNewAppointmentDialog(false);
        resetDragSelection();
        resetForm();
      } else {
        // Form error is handled by useAppointmentForm and should be displayed in AppointmentDialog
        toast.error("Failed to create appointment. Please check form data.");
      }
    } else if (showEditDialog && editingAppointment) {
      const updatedAppointmentPayload = updateAppointmentFromHook();
      if (updatedAppointmentPayload) {
        // updateAppointment action expects { id, changes }
        // updateAppointmentFromHook returns the entire updated appointment
        const { id, ...changes } = updatedAppointmentPayload;
        dispatch(updateAppointment({ id, changes }));
        toast.success("Appointment updated successfully!");
        setShowEditDialog(false);
        setEditingAppointment(null);
        resetForm();
      } else {
        // Form error is handled by useAppointmentForm and should be displayed in AppointmentDialog
        toast.error("Failed to update appointment. Please check form data.");
      }
    }
  };

  const handleCalendarAppointmentClick = (appointment: Appointment) => {
    // Ensure dates are Date objects for the form hook and dialog
    const appointmentWithDateObjects = {
      ...appointment,
      startTime: new Date(appointment.startTime),
      endTime: new Date(appointment.endTime),
    };
    setEditingAppointment(appointmentWithDateObjects); // This will trigger useAppointmentForm's effect
    setShowEditDialog(true);
    onAppointmentClick?.(appointmentWithDateObjects); // Call prop callback
  };

  const handleDeleteAppointmentDialog = (appointmentToDelete: Appointment) => {
    if (appointmentToDelete?.id) {
      dispatch(deleteAppointment(appointmentToDelete.id));
      toast.error("Appointment deleted");
      setShowEditDialog(false);
      setEditingAppointment(null);
    }
  };

  const handleApproveAndSendDialog = (appointment: Appointment, message: string) => {
    if (appointment?.id) {
      dispatch(
        updateAppointmentNotification({
          appointmentId: appointment.id,
          status: "approved",
          sent: true,
          editedMessage: message,
        }),
      );
      toast.success("Care instructions approved and sent.");
      setShowEditDialog(false);
      setEditingAppointment(null);
      setEditedMessage(""); // Reset local state for edited message
    }
  };

  const handleDeclineAndRegenerateDialog = (appointment: Appointment) => {
    if (appointment?.id) {
      setIsGeneratingMessage(true);
      // Simulate message regeneration
      setTimeout(() => {
        // const newInstructions = generateCareInstructions(appointment); // Ensure this is pure
        dispatch(
          updateAppointmentNotification({
            appointmentId: appointment.id,
            status: "disapproved",
            sent: false,
            // editedMessage: newInstructions.message, // If pre-filling
          }),
        );
        setIsGeneratingMessage(false);
        toast.error("Care instructions declined.");
        setEditedMessage(""); // Reset local state
      }, 1000);
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

  return (
    <div className="bg-card text-card-foreground rounded-lg border flex flex-col h-[calc(100vh-8rem)]">
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

      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {view === "day" && (
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
              onAppointmentClick={handleCalendarAppointmentClick}
            />
          )}
          {view === "week" && (
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
              onAppointmentClick={handleCalendarAppointmentClick}
            />
          )}
          {view === "month" && (
            <MonthView
              date={date}
              appointments={calendarAppointments}
              onDateSelect={(selectedDate) => {
                setDate(selectedDate);
                setView("day");
              }}
              onAppointmentClick={handleCalendarAppointmentClick}
              getAppointmentColors={getAppointmentColors}
              filterAppointmentsByDate={filterAppointmentsByDate}
            />
          )}
        </div>
      </div>

      {/*
        AppointmentDialog needs to be passed the relevant state and setters from useAppointmentForm.
        For "new" mode: formData, setFormData, formError, validateForm.
        For "edit" mode: editFormData, setEditFormData, formError, validateForm.
        The onSave prop will now call handleSaveAppointment which relies on the hook's internal state.
      */}
      <AppointmentDialog
        mode="new"
        open={showNewAppointmentDialog}
        onOpenChange={setShowNewAppointmentDialog}
        dragStart={dragStart}
        dragEnd={dragEnd}
        onSave={handleSaveAppointment} // This now calls the calendar's save handler
        resetDragSelection={resetDragSelection}
        // Props to pass from useAppointmentForm for "new" mode:
        // initialFormData={formData}
        // onFormDataChange={setFormData}
        // formError={formError}
        // validateForm={validateForm}
        // titleInputRef={titleInputRef} // If dialog uses it
      />

      <AppointmentDialog
        mode="edit"
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        appointment={editingAppointment}
        onSave={handleSaveAppointment} // This now calls the calendar's save handler
        onDelete={handleDeleteAppointmentDialog}
        onApproveAndSend={handleApproveAndSendDialog}
        onDeclineAndRegenerate={handleDeclineAndRegenerateDialog}
        generateCareInstructions={generateCareInstructions}
        // Props to pass from useAppointmentForm for "edit" mode:
        // initialFormData={editFormData} // Or pass `appointment` and let dialog sync with hook's effect
        // onFormDataChange={setEditFormData}
        // formError={formError}
        // validateForm={validateForm}
      />
    </div>
  );
}
