interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
  isOutbound: boolean;
  channel?: string; // Optional channel for filtering (SMS, EMAIL)
}

interface ConversationData {
  messages: Message[];
}

// Mock conversation data matching Figma design
export const mockConversationData: ConversationData = {
  messages: [
    {
      id: "1",
      text: "Hi Emma, just checking in—how's your skin feeling after your microneedling session last week? 😊",
      sender: "staff",
      timestamp: new Date("2025-01-21T10:30:00"),
      isOutbound: false,
    },
    {
      id: "2",
      text: "Hey!\nIt's looking a bit dry but no redness. Is that normal?",
      sender: "patient",
      timestamp: new Date("2025-01-21T11:15:00"),
      isOutbound: true,
    },
    {
      id: "3",
      text: "Yes, totally normal. Keep using the hyaluronic serum we gave you and avoid exfoliating for a few more days.",
      sender: "staff",
      timestamp: new Date("2025-01-21T11:20:00"),
      isOutbound: false,
    },
    {
      id: "4",
      text: "Hi! I'd like to book a follow-up for my filler touch-up. Do you have anything next Friday?",
      sender: "patient",
      timestamp: new Date("2025-01-21T14:45:00"),
      isOutbound: true,
    },
    {
      id: "5",
      text: "Hi Jessica!\n\nYes, we have openings at 11:30am and 3:00pm. Which one works better?",
      sender: "staff",
      timestamp: new Date("2025-01-28T09:00:00"),
      isOutbound: false,
    },
    {
      id: "6",
      text: "3:00pm is perfect. Thank you!",
      sender: "patient",
      timestamp: new Date("2025-01-28T09:15:00"),
      isOutbound: true,
    },
    {
      id: "7",
      text: "You're all set for Friday at 3:00pm! See you then 💉✨",
      sender: "staff",
      timestamp: new Date("2025-01-28T09:20:00"),
      isOutbound: false,
    },
    {
      id: "8",
      text: "Thank you. I will be on time.",
      sender: "patient",
      timestamp: new Date("2025-01-28T09:25:00"),
      isOutbound: true,
    },
    {
      id: "9",
      text: "Hi Jessica! Just a friendly reminder about your Botox appt tomorrow at 2pm. Can't wait to see you! 😊 -Rachel from Radiance",
      sender: "staff",
      timestamp: new Date("2025-01-29T16:30:00"),
      isOutbound: false,
    },
  ],
};

export type { ConversationData, Message };
