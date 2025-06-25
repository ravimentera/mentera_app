import { PayloadAction, createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../index";
import type { Appointment, NotificationUpdate, StoredAppointment } from "../types";

// Create the adapter for our appointments
const appointmentsAdapter = createEntityAdapter<Appointment>();

// Define initial state with some default appointments
const initialState = appointmentsAdapter.getInitialState();

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

// Create the appointments slice
export const appointmentsSlice = createSlice({
  name: "appointments",
  initialState,
  reducers: {
    addAppointment: appointmentsAdapter.addOne,
    updateAppointment: appointmentsAdapter.updateOne,
    deleteAppointment: appointmentsAdapter.removeOne,
    clearAllAppointments: appointmentsAdapter.removeAll,
    // Add a new action to clear appointments and set new ones
    setAppointments: (state, action: PayloadAction<Appointment[]>) => {
      appointmentsAdapter.removeAll(state);
      appointmentsAdapter.addMany(state, action.payload);
    },
    updateAppointmentNotification: (state, action: PayloadAction<NotificationUpdate>) => {
      const { appointmentId, status, sent, editedMessage } = action.payload;
      const appointment = state.entities[appointmentId];

      if (appointment?.notificationStatus) {
        appointment.notificationStatus.status = status;
        appointment.notificationStatus.sent = sent;

        if (editedMessage) {
          appointment.notificationStatus.editedMessage = editedMessage;
        }
      }
    },
  },
});

// Export actions
export const {
  addAppointment,
  updateAppointment,
  deleteAppointment,
  clearAllAppointments,
  setAppointments,
  updateAppointmentNotification,
} = appointmentsSlice.actions;

// Export selectors
export const { selectAll: selectAllAppointments, selectById: selectAppointmentById } =
  appointmentsAdapter.getSelectors<RootState>((state) => state.appointments);

export default appointmentsSlice.reducer;
