import { patients } from "./patients.data";

export interface ApprovalItem {
  id: string;
  patientId: string;
  patientExtras: {
    phone: string;
    email: string;
    isVip: boolean;
  };
  type: "follow-up" | "reminder" | "consultation" | "pre-care" | "post-care";
  message: string;
  status: "pending" | "approved" | "declined";
  timestamp: Date;
  conversationSummary?: string;
  aiSuggestion?: string;
  appointmentDetails?: {
    procedure: string;
    date: string;
    time: string;
    provider: string;
  };
  nextAppointments?: Array<{
    procedure: string;
    date: string;
    time: string;
    provider: string;
  }>;
  medicalSummary?: Array<{
    allergy: string;
    reaction: string;
  }>;
  activePackages?: Array<{
    name: string;
    sessionsCompleted: number;
    totalSessions: number;
    progress: number;
  }>;
  campaigns?: {
    lastEmail?: string;
    lastSms?: string;
  };
  communication?: {
    emailNotifications: boolean;
    smsReminders: boolean;
  };
}

// Helper function to get patient by ID
export const getPatientById = (patientId: string) => {
  return patients.find((patient) => patient.patientId === patientId);
};

// Helper function to get complete patient info for approval
export const getApprovalPatientInfo = (approvalItem: ApprovalItem) => {
  const patient = getPatientById(approvalItem.patientId);
  if (!patient) return null;

  return {
    firstName: patient.profile.firstName,
    lastName: patient.profile.lastName,
    phone: approvalItem.patientExtras.phone,
    email: approvalItem.patientExtras.email,
    avatar: patient.profile.avatar.large,
    isVip: approvalItem.patientExtras.isVip,
  };
};

// Generate realistic phone numbers and emails based on patient data
const generateContactInfo = (firstName: string, lastName: string) => {
  const phoneNumbers = [
    "+16898798897",
    "+14155552345",
    "+13235551234",
    "+19175554567",
    "+12135558901",
  ];
  const domains = ["gmail.com", "yahoo.com", "outlook.com", "icloud.com"];

  return {
    phone: phoneNumbers[Math.floor(Math.random() * phoneNumbers.length)],
    email: `${firstName.toLowerCase()}@${domains[Math.floor(Math.random() * domains.length)]}`,
  };
};

export const approvalItems: ApprovalItem[] = [
  {
    id: "APR-001",
    patientId: "PT-1005",
    patientExtras: {
      ...generateContactInfo("Yashodha", "Prabhu"),
      isVip: true,
    },
    type: "follow-up",
    message:
      "Hi Yashodha! Just checking in about your CoolSculpting treatment. How's the recovery? Most see initial results in 2-3 weeks. Are you noticing any changes? If you're ready, we can schedule your follow-up assessment for early next month. Should I reserve a spot for you?",
    status: "pending",
    timestamp: new Date("2025-01-29T09:30:00"),
    conversationSummary:
      "Yashodha had a CoolSculpting session last week and was experiencing some mild discomfort, which is normal. She was advised to continue wearing the compression garment and avoid vigorous exercise. Then requested a follow-up appointment for assessment, and booked a slot for 3:00 PM next Friday. Later, she received a reminder for her next CoolSculpting session scheduled for 2:00 PM tomorrow.",
    aiSuggestion: "Tera Suggest",
    appointmentDetails: {
      procedure: "CoolSculpting Follow-up",
      date: "Tomorrow",
      time: "2:00 PM",
      provider: "Jessica Brown",
    },
    nextAppointments: [
      {
        procedure: "CoolSculpting Assessment",
        date: "Tomorrow",
        time: "2:00 PM",
        provider: "Jessica Brown",
      },
      {
        procedure: "CoolSculpting Additional Cycles",
        date: "2025-04-09",
        time: "2:00 PM",
        provider: "Jessica Brown",
      },
    ],
    medicalSummary: [
      {
        allergy: "Aspirin",
        reaction: "Sensitivity",
      },
    ],
    activePackages: [
      {
        name: "CoolSculpting Package",
        sessionsCompleted: 1,
        totalSessions: 3,
        progress: 33.3,
      },
    ],
    campaigns: {
      lastEmail: "Follow - Up",
      lastSms: "New Year Offer",
    },
    communication: {
      emailNotifications: true,
      smsReminders: false,
    },
  },
  {
    id: "APR-002",
    patientId: "PT-1001",
    patientExtras: {
      ...generateContactInfo("Nikolaj", "Larsen"),
      isVip: false,
    },
    type: "pre-care",
    message:
      "Hi Nikolaj! Your Botox appointment is coming up tomorrow at 2:30 PM. Please remember to avoid alcohol and blood-thinning medications 24 hours before your treatment. Also, please arrive 15 minutes early for pre-treatment consultation. Looking forward to seeing you!",
    status: "pending",
    timestamp: new Date("2025-01-29T10:15:00"),
    conversationSummary:
      "Nikolaj is scheduled for his second Botox session. His first treatment showed excellent results with minimal side effects. He's been following post-care instructions well and is ready for the next session.",
    appointmentDetails: {
      procedure: "Botox Treatment",
      date: "Tomorrow",
      time: "2:30 PM",
      provider: "Rachel Garcia",
    },
    nextAppointments: [
      {
        procedure: "Glabellar lines",
        date: "2025-06-10",
        time: "2:30 PM",
        provider: "Rachel Garcia",
      },
    ],
    medicalSummary: [
      {
        allergy: "No known allergies",
        reaction: "None",
      },
    ],
    activePackages: [
      {
        name: "Botox Package",
        sessionsCompleted: 1,
        totalSessions: 3,
        progress: 33.3,
      },
    ],
    campaigns: {
      lastEmail: "Pre-treatment Instructions",
      lastSms: "Appointment Reminder",
    },
    communication: {
      emailNotifications: true,
      smsReminders: true,
    },
  },
  {
    id: "APR-003",
    patientId: "PT-1008",
    patientExtras: {
      ...generateContactInfo("Willow", "Robinson"),
      isVip: false,
    },
    type: "post-care",
    message:
      "Hi Willow! Thank you for choosing us for your IPL treatment yesterday. You may notice some darkening of spots - this is completely normal and shows the treatment is working! Please continue using SPF 50+ and avoid direct sun exposure for the next 2 weeks. Any concerns, please don't hesitate to reach out!",
    status: "pending",
    timestamp: new Date("2025-01-29T11:00:00"),
    conversationSummary:
      "Willow completed her first IPL photofacial session yesterday. Treatment went smoothly with minimal discomfort. She was advised about expected darkening of pigmented spots and proper sun protection.",
    appointmentDetails: {
      procedure: "IPL Photofacial",
      date: "Yesterday",
      time: "3:00 PM",
      provider: "Sarah Johnson",
    },
    nextAppointments: [
      {
        procedure: "IPL Session 2",
        date: "2025-04-03",
        time: "3:00 PM",
        provider: "Sarah Johnson",
      },
    ],
    medicalSummary: [
      {
        allergy: "No photosensitivity reported",
        reaction: "None",
      },
    ],
    activePackages: [
      {
        name: "IPL Package",
        sessionsCompleted: 1,
        totalSessions: 4,
        progress: 25,
      },
    ],
    campaigns: {
      lastEmail: "Post-treatment Care",
      lastSms: "Sun Protection Reminder",
    },
    communication: {
      emailNotifications: true,
      smsReminders: true,
    },
  },
  {
    id: "APR-004",
    patientId: "PT-1012",
    patientExtras: {
      ...generateContactInfo("Malthe", "Nielsen"),
      isVip: true,
    },
    type: "reminder",
    message:
      "Hi Malthe! This is a friendly reminder that your next PRP hair restoration session is scheduled for next Monday at 1:00 PM. Please ensure you're well-hydrated and have eaten before your appointment. We're excited to continue your hair restoration journey!",
    status: "pending",
    timestamp: new Date("2025-01-29T14:30:00"),
    conversationSummary:
      "Malthe is progressing well with his PRP hair restoration treatment. He's completed one session with good platelet concentration and minimal discomfort. Ready for his second monthly treatment.",
    appointmentDetails: {
      procedure: "PRP Hair Restoration",
      date: "Next Monday",
      time: "1:00 PM",
      provider: "Robert Kim",
    },
    nextAppointments: [
      {
        procedure: "PRP Session 2",
        date: "2025-04-17",
        time: "1:00 PM",
        provider: "Robert Kim",
      },
    ],
    medicalSummary: [
      {
        allergy: "No contraindications",
        reaction: "None",
      },
    ],
    activePackages: [
      {
        name: "PRP Hair Package",
        sessionsCompleted: 1,
        totalSessions: 3,
        progress: 33.3,
      },
    ],
    campaigns: {
      lastEmail: "Treatment Progress Update",
      lastSms: "Appointment Reminder",
    },
    communication: {
      emailNotifications: true,
      smsReminders: true,
    },
  },
  {
    id: "APR-005",
    patientId: "PT-1014",
    patientExtras: {
      ...generateContactInfo("Käthe", "Baier"),
      isVip: false,
    },
    type: "follow-up",
    message:
      "Hi Käthe! Your microblading is healing beautifully! As discussed, your touch-up appointment is scheduled for next week. Please continue following the aftercare instructions - no picking or scratching, and keep the area dry. Can't wait to see the final results!",
    status: "pending",
    timestamp: new Date("2025-01-29T16:45:00"),
    conversationSummary:
      "Käthe's microblading procedure went excellently with natural hair-stroke pattern achieved and good pigment retention. She's following aftercare instructions well and is ready for her touch-up session.",
    appointmentDetails: {
      procedure: "Microblading Touch-up",
      date: "Next Week",
      time: "2:30 PM",
      provider: "Kevin Martinez",
    },
    nextAppointments: [
      {
        procedure: "Microblading Touch-up",
        date: "2025-05-07",
        time: "2:30 PM",
        provider: "Kevin Martinez",
      },
    ],
    medicalSummary: [
      {
        allergy: "Patch test completed",
        reaction: "No reactions",
      },
    ],
    activePackages: [
      {
        name: "Microblading Package",
        sessionsCompleted: 1,
        totalSessions: 2,
        progress: 50,
      },
    ],
    campaigns: {
      lastEmail: "Aftercare Instructions",
      lastSms: "Healing Progress Check",
    },
    communication: {
      emailNotifications: true,
      smsReminders: false,
    },
  },
];

// Helper function to get approval item by ID
export const getApprovalItemById = (id: string): ApprovalItem | undefined => {
  return approvalItems.find((item) => item.id === id);
};

// Helper function to get pending approvals
export const getPendingApprovals = (): ApprovalItem[] => {
  return approvalItems.filter((item) => item.status === "pending");
};

// Helper function to update approval status
export const updateApprovalStatus = (
  id: string,
  status: "approved" | "declined",
): ApprovalItem | null => {
  const item = approvalItems.find((item) => item.id === id);
  if (item) {
    item.status = status;
    return item;
  }
  return null;
};
