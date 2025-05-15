import { mockAppointments as initialMockAppointments } from "@/mock/appointments.data";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { AppDispatch, RootState } from "./index"; // Assuming AppDispatch is exported for thunks if any

// Component-facing Appointment type (dates are Date objects)
export interface Appointment {
  id: string;
  patientId: string;
  chartId: string;
  patient: {
    firstName: string;
    lastName: string;
    condition?: string;
  };
  provider: {
    providerId: string;
    firstName: string;
    lastName: string;
    specialties: string[];
  };
  startTime: Date; // Strictly Date
  endTime: Date; // Strictly Date
  status: "scheduled" | "completed" | "cancelled" | "pending";
  notes?: string;
  type: "therapy" | "consultation" | "followup" | "general";
  notificationStatus?: {
    status: "pending" | "approved" | "disapproved";
    sent: boolean;
    message?: string;
    type: "pre-care" | "post-care";
    editedMessage?: string;
  };
  chatHistory?: {
    id: string;
    text: string;
    sender: string;
    timestamp: Date; // Strictly Date
    isOutbound: boolean;
  }[];
}

// Internal type for Redux store (dates are ISO strings for serializability)
interface StoredAppointment {
  id: string;
  patientId: string;
  chartId: string;
  patient: {
    firstName: string;
    lastName: string;
    condition?: string;
  };
  provider: {
    providerId: string;
    firstName: string;
    lastName: string;
    specialties: string[];
  };
  startTime: string; // Stored as ISO string
  endTime: string; // Stored as ISO string
  status: "scheduled" | "completed" | "cancelled" | "pending";
  notes?: string;
  type: "therapy" | "consultation" | "followup" | "general";
  notificationStatus?: {
    status: "pending" | "approved" | "disapproved";
    sent: boolean;
    message?: string;
    type: "pre-care" | "post-care";
    editedMessage?: string;
  };
  chatHistory?: {
    id: string;
    text: string;
    sender: string;
    timestamp: string; // Stored as ISO string
    isOutbound: boolean;
  }[];
}

export interface AppointmentsState {
  items: StoredAppointment[];
}

// Parameter is now strictly Appointment. Non-null assertions are removed.
const serializeAppointmentDates = (appointment: Appointment): StoredAppointment => {
  return {
    // Spread required fields first
    id: appointment.id,
    patientId: appointment.patientId,
    chartId: appointment.chartId,
    patient: appointment.patient,
    provider: appointment.provider,
    startTime: new Date(appointment.startTime).toISOString(), // Ensure input is treated as Date
    endTime: new Date(appointment.endTime).toISOString(), // Ensure input is treated as Date
    status: appointment.status,
    type: appointment.type,
    // Conditionally spread optional fields
    ...(appointment.notes && { notes: appointment.notes }),
    ...(appointment.notificationStatus && { notificationStatus: appointment.notificationStatus }),
    ...(appointment.chatHistory && {
      chatHistory: appointment.chatHistory.map((chat) => ({
        ...chat,
        timestamp: new Date(chat.timestamp).toISOString(), // Ensure input is treated as Date
      })),
    }),
  };
};

const deserializeAppointmentDates = (storedAppointment: StoredAppointment): Appointment => {
  const deserializedChatHistory = storedAppointment.chatHistory
    ? storedAppointment.chatHistory.map((chatEntry) => {
        // Explicitly construct the new chat entry object for type correctness
        const { timestamp, ...restOfChat } = chatEntry;
        return {
          ...restOfChat,
          timestamp: new Date(timestamp),
        };
      })
    : undefined;

  return {
    // Spread all properties from storedAppointment
    ...storedAppointment,
    // Explicitly overwrite date fields with Date objects
    startTime: new Date(storedAppointment.startTime),
    endTime: new Date(storedAppointment.endTime),
    // Assign the correctly typed chatHistory
    chatHistory: deserializedChatHistory,
  };
};

const initialState: AppointmentsState = {
  // Ensure initialMockAppointments conform to the Appointment type (with Date objects)
  // before serialization. Your mock data utility already creates Date objects.
  items: initialMockAppointments.map((apt) => serializeAppointmentDates(apt as Appointment)),
};

export const appointmentsSlice = createSlice({
  name: "appointments",
  initialState,
  reducers: {
    setAppointments: (state, action: PayloadAction<Appointment[]>) => {
      state.items = action.payload.map(serializeAppointmentDates);
    },
    addAppointment: (state, action: PayloadAction<Appointment>) => {
      const newAppointment = serializeAppointmentDates(action.payload);
      const existingIndex = state.items.findIndex((item) => item.id === newAppointment.id);
      if (existingIndex === -1) {
        state.items.push(newAppointment);
      } else {
        console.warn(
          `Appointment with ID ${newAppointment.id} already exists. Not adding duplicate.`,
        );
      }
    },
    updateAppointment: (
      state,
      action: PayloadAction<{ id: string; changes: Partial<Appointment> }>,
    ) => {
      const { id, changes } = action.payload;
      const index = state.items.findIndex((apt) => apt.id === id);
      if (index !== -1) {
        const existingAppointmentWithDates = deserializeAppointmentDates(state.items[index]);
        const updatedAppointmentData: Appointment = {
          ...existingAppointmentWithDates,
          ...changes,
          ...(changes.startTime && { startTime: new Date(changes.startTime) }),
          ...(changes.endTime && { endTime: new Date(changes.endTime) }),
          ...(changes.chatHistory && {
            chatHistory: changes.chatHistory.map((chat) => ({
              ...chat,
              timestamp: new Date(chat.timestamp),
            })),
          }),
        };
        state.items[index] = serializeAppointmentDates(updatedAppointmentData);
      }
    },
    deleteAppointment: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((apt) => apt.id !== action.payload);
    },
    updateAppointmentNotification: (
      state,
      action: PayloadAction<{
        appointmentId: string;
        status: "pending" | "approved" | "disapproved";
        sent: boolean;
        editedMessage?: string;
      }>,
    ) => {
      const { appointmentId, status, sent, editedMessage } = action.payload;
      const index = state.items.findIndex((apt) => apt.id === appointmentId);
      if (index !== -1) {
        const currentAppointment = state.items[index];
        if (!currentAppointment.notificationStatus) {
          currentAppointment.notificationStatus = {
            status,
            sent,
            editedMessage: editedMessage || "",
            type: "pre-care",
            message: "",
          };
        } else {
          currentAppointment.notificationStatus.status = status;
          currentAppointment.notificationStatus.sent = sent;
          if (editedMessage !== undefined) {
            currentAppointment.notificationStatus.editedMessage = editedMessage;
          }
        }
      }
    },
  },
});

export const {
  setAppointments,
  addAppointment,
  updateAppointment,
  deleteAppointment,
  updateAppointmentNotification,
} = appointmentsSlice.actions;

export const selectAllAppointments = (state: RootState): Appointment[] =>
  state.appointments.items.map(deserializeAppointmentDates);

export const selectAppointmentById = (
  state: RootState,
  appointmentId: string,
): Appointment | undefined => {
  const appointment = state.appointments.items.find((apt) => apt.id === appointmentId);
  return appointment ? deserializeAppointmentDates(appointment) : undefined;
};

export default appointmentsSlice.reducer;
