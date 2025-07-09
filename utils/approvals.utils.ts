import type {
  MedicalHistoryResponse,
  PatientDetailsResponse,
  VisitsResponse,
} from "@/lib/store/api/patientsApi";
import type {
  ApprovalItem as APIApprovalItem,
  CommunicationMessage,
  ConversationResponse,
} from "@/lib/store/types";
import type { ApprovalItem as MockApprovalItem } from "@/mock/approvals.data";
import type { Message } from "@/mock/conversations.data";

// Transform API approval item to mock approval item format
export const transformAPIApprovalToMockApproval = (
  apiApproval: APIApprovalItem,
  patientData?: PatientDetailsResponse,
  visitsData?: VisitsResponse,
  medicalData?: MedicalHistoryResponse,
): MockApprovalItem => {
  return {
    id: apiApproval.id,
    patientId: apiApproval.patient.id,
    patientExtras: {
      phone: apiApproval.patient.phone || "N/A",
      email: apiApproval.patient.email || "N/A",
      isVip: false, // API doesn't provide VIP status, default to false
    },
    type: mapAPITypeToMockType(apiApproval.communication.type),
    message: apiApproval.communication.content,
    status: mapAPIStatusToMockStatus(apiApproval.status),
    timestamp: new Date(apiApproval.createdAt),
    conversationSummary: apiApproval.context.aiContext.conversationContext.summary || "N/A",
    aiSuggestion: "Tera Suggest", // Default value
    appointmentDetails: {
      procedure: apiApproval.communication.type || "N/A",
      date: "N/A",
      time: "N/A",
      provider: apiApproval.context.aiContext.providerContext.name || "N/A",
    },
    nextAppointments: transformVisitsToNextAppointments(visitsData),
    medicalSummary: transformMedicalDataToSummary(medicalData, patientData),
    activePackages: transformVisitsToActivePackages(visitsData),
    campaigns: {
      lastEmail: "N/A",
      lastSms: "N/A",
    },
    communication: {
      emailNotifications: patientData?.data?.communicationPreference?.emailOptIn || true,
      smsReminders: patientData?.data?.communicationPreference?.smsOptIn || true,
    },
  };
};

// Transform visits data to next appointments
const transformVisitsToNextAppointments = (
  visitsData?: VisitsResponse,
): MockApprovalItem["nextAppointments"] => {
  if (!visitsData?.data?.appointments?.upcomingAppointments) {
    return [];
  }

  return visitsData.data.appointments.upcomingAppointments.map((appointment: any) => ({
    procedure: appointment.treatmentType || "N/A",
    date: appointment.appointmentDate
      ? new Date(appointment.appointmentDate).toLocaleDateString()
      : "N/A",
    time: appointment.appointmentDate
      ? new Date(appointment.appointmentDate).toLocaleTimeString()
      : "N/A",
    provider: appointment.providerName || "N/A",
  }));
};

// Transform medical data to medical summary
const transformMedicalDataToSummary = (
  medicalData?: MedicalHistoryResponse,
  patientData?: PatientDetailsResponse,
): MockApprovalItem["medicalSummary"] => {
  const allergies: MockApprovalItem["medicalSummary"] = [];

  // Add allergies from patient data
  if (patientData?.data?.allergies && patientData.data.allergies.length > 0) {
    patientData.data.allergies.forEach((allergy: any) => {
      allergies.push({
        allergy: allergy.allergen || allergy || "N/A",
        reaction: allergy.reaction || "N/A",
      });
    });
  }

  // Add conditions from medical history
  if (medicalData?.data?.conditions && medicalData.data.conditions.length > 0) {
    medicalData.data.conditions.forEach((condition: any) => {
      allergies.push({
        allergy: condition.condition || condition.name || "N/A",
        reaction: condition.status || "N/A",
      });
    });
  }

  // Default if no data
  if (allergies.length === 0) {
    allergies.push({
      allergy: "No known allergies",
      reaction: "None",
    });
  }

  return allergies;
};

// Transform visits data to active packages
const transformVisitsToActivePackages = (
  visitsData?: VisitsResponse,
): MockApprovalItem["activePackages"] => {
  if (!visitsData?.data?.packages?.activePackages) {
    return [];
  }

  return visitsData.data.packages.activePackages.map((pkg: any) => ({
    name: pkg.packageName || "N/A",
    sessionsCompleted: pkg.sessionsUsed || 0,
    totalSessions: pkg.totalSessions || 0,
    progress: pkg.totalSessions > 0 ? (pkg.sessionsUsed / pkg.totalSessions) * 100 : 0,
  }));
};

// Map API approval type to mock approval type
const mapAPITypeToMockType = (apiType: string): MockApprovalItem["type"] => {
  switch (apiType.toLowerCase()) {
    case "appointment_missed":
      return "follow-up";
    case "pre_care":
      return "pre-care";
    case "post_care":
      return "post-care";
    case "reminder":
      return "reminder";
    case "consultation":
      return "consultation";
    default:
      return "follow-up";
  }
};

// Map API status to mock status
const mapAPIStatusToMockStatus = (apiStatus: string): MockApprovalItem["status"] => {
  switch (apiStatus) {
    case "PENDING_APPROVAL":
      return "pending";
    case "APPROVED":
      return "approved";
    case "DECLINED":
      return "declined";
    default:
      return "pending";
  }
};

// Transform API conversation messages to mock conversation messages
export const transformAPIConversationToMockConversation = (
  apiConversation: ConversationResponse,
): { messages: Message[] } => {
  const messages = apiConversation.data.conversation.messages.map((msg: CommunicationMessage) => ({
    id: msg.id,
    // Show actual content unless it's the placeholder text for pending approvals
    text:
      msg.content === "AI-generated message pending approval"
        ? `[${msg.metadata.messageType || "Message"} - Pending Approval]`
        : msg.content,
    sender: msg.sender.type === "patient" ? "patient" : "staff",
    timestamp: new Date(msg.timestamp),
    isOutbound: msg.direction === "OUTBOUND",
    // Add channel for filtering
    channel: msg.channel,
  }));

  return { messages };
};

// Filter messages by communication channel
export const filterMessagesByChannel = (
  messages: Message[],
  activeChannel: "chat" | "email",
): Message[] => {
  // Map UI channel names to API channel names
  const channelMap = {
    chat: "SMS",
    email: "EMAIL",
  };

  const apiChannel = channelMap[activeChannel];

  return messages.filter((message: any) => {
    // If message doesn't have channel info, include it in both filters for backward compatibility
    if (!message.channel) return true;
    return message.channel === apiChannel;
  });
};

// Get patient name from API approval (prioritizing patient API data when available)
export const getPatientNameFromApproval = (
  apiApproval: APIApprovalItem,
  patientData?: PatientDetailsResponse,
): string => {
  // First priority: Patient API data (most accurate)
  if (patientData?.data?.firstName || patientData?.data?.lastName) {
    const firstName = patientData.data.firstName || "";
    const lastName = patientData.data.lastName || "";
    return `${firstName} ${lastName}`.trim() || "N/A";
  }

  // Second priority: Patient context from approval (fallback)
  if (
    apiApproval.context.aiContext.patientContext.name &&
    apiApproval.context.aiContext.patientContext.name !== "Unknown Patient"
  ) {
    return apiApproval.context.aiContext.patientContext.name;
  }

  // Last priority: Basic patient name from approval
  return apiApproval.patient.name || "N/A";
};

// Mock patient data for components that expect patient data
export const createMockPatientFromApproval = (
  apiApproval: APIApprovalItem,
  patientData?: PatientDetailsResponse,
) => {
  // Get consistent patient name
  const fullPatientName = getPatientNameFromApproval(apiApproval, patientData);
  const [firstName = "N/A", lastName = ""] = fullPatientName.split(" ");

  // Use patient API data if available, otherwise parse from full name
  const actualFirstName = patientData?.data?.firstName || firstName;
  const actualLastName = patientData?.data?.lastName || lastName;

  return {
    patientId: apiApproval.patient.id,
    profile: {
      firstName: actualFirstName,
      lastName: actualLastName,
      gender: patientData?.data?.gender || "other",
      avatar: {
        large: "https://randomuser.me/api/portraits/men/1.jpg",
        medium: "https://randomuser.me/api/portraits/med/men/1.jpg",
        thumbnail: "https://randomuser.me/api/portraits/thumb/men/1.jpg",
      },
    },
    chartId: `CH-${apiApproval.patient.id.replace("PT-", "5")}`,
    visitDate: "N/A",
    provider: apiApproval.context.aiContext.providerContext.name || "N/A",
    treatmentNotes: {
      procedure: apiApproval.communication.type || "N/A",
      areasTreated: ["N/A"],
      unitsUsed: null,
      observations: "N/A",
      providerRecommendations: "N/A",
    },
    preProcedureCheck: {
      medications: ["N/A"],
      consentSigned: true,
      allergyCheck: "N/A",
    },
    postProcedureCare: {
      instructionsProvided: true,
      followUpRecommended: "N/A",
      productsRecommended: ["N/A"],
    },
    nextTreatment: "N/A",
    followUpDate: "N/A",
    alerts: [],
    providerSpecialty: apiApproval.context.aiContext.providerContext.specialty || "N/A",
    treatmentOutcome: "N/A",
  };
};
