import { generatePendingNotifications } from "@/lib/utils/appointment-generator";
import { PayloadAction, createSelector, createSlice } from "@reduxjs/toolkit";
import type { AppDispatch, RootState } from "../index";
import type { Appointment, ApprovalCardData, ApprovalChatMessage, ApprovalsState } from "../types";
import { updateAppointmentNotification } from "./appointmentsSlice";

// Helper to transform Appointment to ApprovalCardData
export const transformAppointmentToApprovalCard = (
  appointment: Appointment,
): ApprovalCardData | null => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const appointmentDate = new Date(appointment.startTime); // Assuming startTime is Date object
  appointmentDate.setHours(0, 0, 0, 0);

  // Always show today's appointments regardless of date check to support our new requirement
  if (appointment.notificationStatus && appointment.notificationStatus.status === "pending") {
    const isPatientVIP = Number.parseInt(appointment.patientId.replace(/\D/g, "")) % 3 === 0;
    const time = new Date(appointment.startTime).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    let subject = "";
    if (appointment.notificationStatus?.type === "pre-care") {
      subject = `Reminder for upcoming ${appointment.patient.condition || "appointment"}`;
    } else {
      subject = `Follow up on recent ${appointment.patient.condition || "appointment"}`;
    }

    const { patient } = appointment;
    const patientName = patient.firstName;
    const procedure = patient.condition || "appointment";

    return {
      id: appointment.id,
      appointmentId: appointment.id,
      patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
      patientId: appointment.patientId,
      isVip: isPatientVIP,
      time: `Today, ${time}`,
      subject: subject,
      message: appointment.notificationStatus?.message || "",
      originalMessage: appointment.notificationStatus?.message || "",
      notificationType: appointment.notificationStatus?.type || "pre-care",
      aiGeneratedMessage: generatePersonalizedAIMessageForSlice(
        appointment.patient.firstName,
        procedure,
        appointment.notificationStatus?.type || "pre-care",
        appointment.notes || "",
      ),
      chatHistory: appointment.chatHistory?.map((chat) => ({
        ...chat,
        timestamp:
          typeof chat.timestamp === "string"
            ? chat.timestamp
            : new Date(chat.timestamp).toISOString(),
      })),
      messageVariant: 0,
      showTeraCompose: false,
    };
  }
  return null;
};

function generatePersonalizedAIMessageForSlice(
  patientName: string,
  procedure: string,
  messageType: "pre-care" | "post-care",
  observations?: string,
): string {
  if (messageType === "pre-care") {
    return `AI Suggestion for ${patientName}: Remember your ${procedure} pre-care!`;
  }
  return `AI Suggestion for ${patientName}: Hope your ${procedure} recovery is going well! ${observations ? `Regarding ${observations.substring(0, 30)}...` : ""}`;
}

// Generate approvals using our new utility
const generatedAppointments = generatePendingNotifications(new Date(), 5);
const initialApprovalItems: ApprovalCardData[] = generatedAppointments
  .map(transformAppointmentToApprovalCard)
  .filter((card): card is ApprovalCardData => card !== null);

const initialState: ApprovalsState = {
  items: initialApprovalItems,
  currentCardIndex: 0,
  isLoading: false,
  error: null,
};

export const approvalsSlice = createSlice({
  name: "approvals",
  initialState,
  reducers: {
    setApprovals: (state, action: PayloadAction<ApprovalCardData[]>) => {
      state.items = action.payload;
      state.currentCardIndex = 0;
    },
    addApprovals: (state, action: PayloadAction<ApprovalCardData[]>) => {
      action.payload.forEach((newApproval) => {
        if (!state.items.find((item) => item.id === newApproval.id)) {
          state.items.unshift(newApproval);
        }
      });
    },
    processApprovalAction: (
      state,
      action: PayloadAction<{
        cardId: string;
        decision: "approved" | "disapproved"; // This 'declined' is local to this action's context
        messageToSend?: string;
      }>,
    ) => {
      const { cardId } = action.payload;
      const cardIndex = state.items.findIndex((item) => item.id === cardId);

      if (cardIndex !== -1) {
        state.items.splice(cardIndex, 1);
        if (state.currentCardIndex >= cardIndex && state.currentCardIndex > 0) {
          state.currentCardIndex -= 1;
        }
        if (state.items.length > 0 && state.currentCardIndex >= state.items.length) {
          state.currentCardIndex = state.items.length - 1;
        } else if (state.items.length === 0) {
          state.currentCardIndex = 0;
        }
      }
    },
    updateApprovalCardMessage: (
      state,
      action: PayloadAction<{ cardId: string; newMessage: string }>,
    ) => {
      const index = state.items.findIndex((item) => item.id === action.payload.cardId);
      if (index !== -1) {
        state.items[index].message = action.payload.newMessage;
        state.items[index].messageVariant = 0;
        state.items[index].showTeraCompose = false;
      }
    },
    cycleMessageVariant: (
      state,
      action: PayloadAction<{ cardId: string; alternativeMessagesCount: number }>,
    ) => {
      const index = state.items.findIndex((item) => item.id === action.payload.cardId);
      if (index !== -1) {
        const card = state.items[index];
        card.messageVariant = (card.messageVariant || 0) + 1;
        if (card.messageVariant > 1 + action.payload.alternativeMessagesCount) {
          card.messageVariant = 0;
        }
        card.showTeraCompose = true;
      }
    },
    setShowTeraComposeForCard: (
      state,
      action: PayloadAction<{ cardId: string; show: boolean }>,
    ) => {
      const index = state.items.findIndex((item) => item.id === action.payload.cardId);
      if (index !== -1) {
        state.items[index].showTeraCompose = action.payload.show;
        if (!action.payload.show) {
          state.items[index].messageVariant = 0;
        }
      }
    },
    navigateToApproval: (state, action: PayloadAction<"up" | "down">) => {
      if (state.items.length === 0) return;
      const current = state.currentCardIndex;
      if (action.payload === "up" && current > 0) {
        state.currentCardIndex -= 1;
      } else if (action.payload === "down" && current < state.items.length - 1) {
        state.currentCardIndex += 1;
      }
      if (state.items[state.currentCardIndex]) {
        state.items[state.currentCardIndex].messageVariant = 0;
        state.items[state.currentCardIndex].showTeraCompose = false;
      }
    },
    addChatMessageToApproval: (
      state,
      action: PayloadAction<{ cardId: string; message: ApprovalChatMessage }>,
    ) => {
      const index = state.items.findIndex((item) => item.id === action.payload.cardId);
      if (index !== -1) {
        if (!state.items[index].chatHistory) {
          state.items[index].chatHistory = [];
        }
        state.items[index].chatHistory?.push(action.payload.message);
      }
    },
  },
});

export const {
  setApprovals,
  addApprovals,
  processApprovalAction,
  updateApprovalCardMessage,
  cycleMessageVariant,
  navigateToApproval,
  setShowTeraComposeForCard,
  addChatMessageToApproval,
} = approvalsSlice.actions;

export const selectAllApprovalCards = (state: RootState) => state.approvals.items;
export const selectCurrentApprovalCardIndex = (state: RootState) =>
  state.approvals.currentCardIndex;

export const selectCurrentApprovalCard = createSelector(
  [selectAllApprovalCards, selectCurrentApprovalCardIndex],
  (items, index) => (items && items.length > index ? items[index] : null),
);

export const selectApprovalsLoading = (state: RootState) => state.approvals.isLoading;
export const selectApprovalsError = (state: RootState) => state.approvals.error;

export default approvalsSlice.reducer;

// Thunk to handle processing an approval (which involves updating another slice)
export const processAndDispatchApproval =
  (cardId: string, decision: "approved" | "disapproved", messageToSend?: string): any =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const approvalCard = state.approvals.items.find((item) => item.id === cardId);
    if (!approvalCard) {
      console.error("Approval card not found for processing:", cardId);
      return;
    }

    // Map "declined" to "disapproved" for the appointmentsSlice
    const notificationStatusUpdate: "approved" | "disapproved" =
      decision === "disapproved" ? "disapproved" : "approved";

    dispatch(
      updateAppointmentNotification({
        appointmentId: cardId,
        status: notificationStatusUpdate, // Use the mapped status
        sent: decision === "approved",
        editedMessage: decision === "approved" ? messageToSend : undefined,
      }),
    );

    dispatch(approvalsSlice.actions.processApprovalAction({ cardId, decision, messageToSend }));
  };
