import { ChatConversation, InboxCounts, PatientDetail } from "@/app/(dashboard)/inbox/types";

// Mock conversations data
export const mockConversations: ChatConversation[] = [
  {
    id: "conv-1",
    patientId: "PT-1005",
    patientName: "Jessica Brown",
    patientInitials: "JB",
    lastMessage:
      "Hi Emma! Just a friendly reminder about your Botox appt tomorrow at 2pm. Can't wait to see you! 😊 -Rachel from Radiance",
    timestamp: new Date("2025-01-22T15:25:00"),
    isRead: false,
    unreadCount: 2,
    channel: "SMS",
    messages: [
      {
        id: "msg-1",
        text: "Hi Emma, just checking in—how's your skin feeling after your microneedling session last week? 😊",
        sender: "provider",
        timestamp: new Date("2025-01-21T10:00:00"),
        isOutbound: false,
      },
      {
        id: "msg-2",
        text: "Hey!\nIt's looking a bit dry but no redness. Is that normal?",
        sender: "user",
        timestamp: new Date("2025-01-21T10:30:00"),
        isOutbound: true,
      },
      {
        id: "msg-3",
        text: "Yes, totally normal. Keep using the hyaluronic serum we gave you and avoid exfoliating for a few more days.",
        sender: "provider",
        timestamp: new Date("2025-01-21T11:00:00"),
        isOutbound: false,
      },
      {
        id: "msg-4",
        text: "Hi! I'd like to book a follow-up for my filler touch-up. Do you have anything next Friday?",
        sender: "user",
        timestamp: new Date("2025-01-22T09:00:00"),
        isOutbound: true,
      },
      {
        id: "msg-5",
        text: "Hi Jessica!\n\nYes, we have openings at 11:30am and 3:00pm. Which one works better?",
        sender: "provider",
        timestamp: new Date("2025-01-22T09:15:00"),
        isOutbound: false,
      },
      {
        id: "msg-6",
        text: "3:00pm is perfect. Thank you!",
        sender: "user",
        timestamp: new Date("2025-01-22T09:20:00"),
        isOutbound: true,
      },
      {
        id: "msg-7",
        text: "You're all set for Friday at 3:00pm! See you then 💉✨",
        sender: "provider",
        timestamp: new Date("2025-01-22T09:25:00"),
        isOutbound: false,
      },
      {
        id: "msg-8",
        text: "Thank you. I will be on time.",
        sender: "user",
        timestamp: new Date("2025-01-22T09:30:00"),
        isOutbound: true,
      },
      {
        id: "msg-9",
        text: "Hi Jessica! Just a friendly reminder about your Botox appt tomorrow at 2pm. Can't wait to see you! 😊 -Rachel from Radiance",
        sender: "provider",
        timestamp: new Date("2025-01-22T15:25:00"),
        isOutbound: false,
      },
    ],
  },
  // Add more mock conversations for the list
  {
    id: "conv-2",
    patientId: "PT-1006",
    patientName: "Jessica Brown",
    patientInitials: "JB",
    lastMessage:
      "Hi Emma! Just a friendly reminder about your Botox appt tomorrow at 2pm. Can't wait to see you! 😊 -Rachel from Radiance",
    timestamp: new Date("2025-01-22T09:10:00"),
    isRead: true,
    unreadCount: 0,
    channel: "Email",
    messages: [],
  },
  {
    id: "conv-3",
    patientId: "PT-1007",
    patientName: "Jessica Brown",
    patientInitials: "JB",
    lastMessage:
      "Hi Emma! Just a friendly reminder about your Botox appt tomorrow at 2pm. Can't wait to see you! 😊 -Rachel from Radiance",
    timestamp: new Date("2025-01-21T16:00:00"),
    isRead: false,
    unreadCount: 2,
    channel: "SMS",
    messages: [],
  },
  {
    id: "conv-4",
    patientId: "PT-1008",
    patientName: "Jessica Brown",
    patientInitials: "JB",
    lastMessage:
      "Hi Emma! Just a friendly reminder about your Botox appt tomorrow at 2pm. Can't wait to see you! 😊 -Rachel from Radiance",
    timestamp: new Date("2025-05-19T14:00:00"),
    isRead: true,
    unreadCount: 0,
    channel: "SMS",
    messages: [],
  },
];

// Mock patient details
export const mockPatientDetails: Record<string, PatientDetail> = {
  "PT-1005": {
    id: "PT-1005",
    name: "Jessica Brown",
    phone: "+16898798897",
    email: "jessica@gmail.com",
    tags: ["VIP", "Botox"],
    treatmentHistory: [
      {
        id: "th-1",
        title: "Follow-Up Scheduled",
        date: "3 days ago",
        status: "scheduled",
      },
      {
        id: "th-2",
        title: "Botox session 2 completed",
        date: "Last week",
        status: "completed",
      },
      {
        id: "th-3",
        title: "Botox session 1 completed",
        date: "Last week",
        status: "completed",
      },
    ],
    nextAppointment: {
      id: "apt-1",
      title: "Botox Treatment",
      date: "Tomorrow",
      time: "2:00 PM",
      provider: "Dr. Sarah Wilson",
      status: "confirmed",
    },
    futureAppointments: [
      {
        id: "apt-2",
        title: "Lip Treatment",
        date: "May 04, 2025",
        time: "2:00 PM",
        provider: "Dr. Sarah Wilson",
        status: "cancelled",
      },
    ],
    medicalInsights: [
      {
        id: "mi-1",
        condition: "Allergies to Amfearmone",
        reaction: "Fever",
      },
      {
        id: "mi-2",
        condition: "Allergies to Paracitamole",
        reaction: "Breathing issue, Rashes",
      },
    ],
  },
};

// Mock inbox counts
export const mockInboxCounts: InboxCounts = {
  all: 26,
  unread: 2,
  read: 24,
};

// Helper function to get patient details
export const getPatientDetails = (patientId: string): PatientDetail | null => {
  return mockPatientDetails[patientId] || null;
};

// Helper function to format time
export const formatMessageTime = (date: Date): string => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday = date.toDateString() === now.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  if (isYesterday) {
    return "Yesterday";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};
