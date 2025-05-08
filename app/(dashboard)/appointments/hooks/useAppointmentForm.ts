import { useState } from "react";
import { Appointment } from "../components/types";

interface NewAppointmentForm {
  title: string;
  description: string;
  type: Appointment["type"];
}

interface EditAppointmentForm extends NewAppointmentForm {
  startTime: Date;
  endTime: Date;
}

interface UseAppointmentFormProps {
  mode: "new" | "edit";
  appointment?: Appointment | null;
  dragStart?: number | null;
  dragEnd?: number | null;
}

export function useAppointmentForm({
  mode,
  appointment,
  dragStart,
  dragEnd,
}: UseAppointmentFormProps) {
  const [formData, setFormData] = useState<NewAppointmentForm>({
    title: "",
    description: "",
    type: "general",
  });

  const [editFormData, setEditFormData] = useState<EditAppointmentForm>({
    title: "",
    description: "",
    type: "general",
    startTime: new Date(),
    endTime: new Date(),
  });

  const [formError, setFormError] = useState<string | null>(null);

  const validateForm = (data: NewAppointmentForm | EditAppointmentForm) => {
    if (!data.title.trim()) {
      setFormError("Title is required");
      return false;
    }

    if ("startTime" in data && "endTime" in data) {
      if (data.startTime >= data.endTime) {
        setFormError("End time must be after start time");
        return false;
      }
    }

    setFormError(null);
    return true;
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "general",
    });
    setEditFormData({
      title: "",
      description: "",
      type: "general",
      startTime: new Date(),
      endTime: new Date(),
    });
    setFormError(null);
  };

  const createAppointment = (): Appointment | null => {
    if (!dragStart || !dragEnd) return null;

    if (!validateForm(formData)) return null;

    const startTime = new Date(Math.min(dragStart, dragEnd));
    const endTime = new Date(Math.max(dragStart, dragEnd));

    if (startTime.getTime() === endTime.getTime()) {
      endTime.setMinutes(endTime.getMinutes() + 15); // Add 15 minutes
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      patientId: "temp-patient-id",
      chartId: "temp-chart-id",
      patient: {
        firstName: formData.title,
        lastName: "",
      },
      provider: {
        providerId: "temp-provider-id",
        firstName: "Dr.",
        lastName: "Provider",
        specialties: [],
      },
      title: formData.title,
      startTime,
      endTime,
      status: "scheduled",
      notes: formData.description,
      type: formData.type,
    };
  };

  const updateAppointment = (): Appointment | null => {
    if (!appointment) return null;

    if (!validateForm(editFormData)) return null;

    return {
      ...appointment,
      patient: {
        ...appointment.patient,
        firstName: editFormData.title,
      },
      startTime: editFormData.startTime,
      endTime: editFormData.endTime,
      notes: editFormData.description,
      type: editFormData.type,
    };
  };

  return {
    formData,
    setFormData,
    editFormData,
    setEditFormData,
    formError,
    setFormError,
    validateForm,
    resetForm,
    createAppointment,
    updateAppointment,
  };
}
