"use client";

import ChatMessages from "@/app/components/ChatMessages";
import { mockAppointments, updateAppointmentNotificationStatus } from "@/mock/appointments.data";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, RefreshCw, Sparkles, ThumbsDown, ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Message interface for chat history
interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
  isOutbound: boolean;
}

interface ApprovalCard {
  id: string;
  patientName: string;
  patientId: string;
  isVip: boolean;
  time: string;
  subject: string;
  message: string;
  notificationType: "pre-care" | "post-care";
  aiGeneratedMessage?: string;
  chatHistory?: Message[]; // Added chat history field
}

// Helper function to get today's appointments that need approval
const getTodayApprovals = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get appointments scheduled today with pending notification status
  return mockAppointments
    .filter((appointment) => {
      const appointmentDate = new Date(appointment.startTime);
      appointmentDate.setHours(0, 0, 0, 0);

      // Include appointments from today that have pending notifications
      return (
        appointmentDate.getTime() === today.getTime() &&
        appointment.notificationStatus &&
        appointment.notificationStatus.status === "pending"
      );
    })
    .map((appointment, index) => {
      const isPatientVIP = Number.parseInt(appointment.patientId.replace(/\D/g, "")) % 3 === 0; // Arbitrary VIP rule
      const time = appointment.startTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });

      // Generate appropriate subject based on notification type
      let subject = "";
      if (appointment.notificationStatus?.type === "pre-care") {
        subject = `Reminder for upcoming ${appointment.treatmentNotes.procedure}`;
      } else {
        subject = `Follow up on recent ${appointment.treatmentNotes.procedure} treatment`;
      }

      // Generate personalized AI message alternative
      const aiGeneratedMessage = generatePersonalizedAIMessage(
        appointment.patient.firstName,
        appointment.treatmentNotes.procedure,
        appointment.notificationStatus?.type || "pre-care",
        appointment.treatmentNotes.observations,
      );

      return {
        id: appointment.id,
        patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
        patientId: appointment.patientId,
        isVip: isPatientVIP,
        time: `Today, ${time}`,
        subject: subject,
        message: appointment.notificationStatus?.message || "",
        notificationType: appointment.notificationStatus?.type || "pre-care",
        aiGeneratedMessage,
        chatHistory: appointment.chatHistory,
      };
    });
};

// Generate a personalized AI message based on patient details
function generatePersonalizedAIMessage(
  patientName: string,
  procedure: string,
  messageType: "pre-care" | "post-care",
  observations?: string,
): string {
  if (messageType === "pre-care") {
    const preCareMessages = [
      `Hi ${patientName}! I'm looking forward to your ${procedure} treatment. I've set aside extra time to ensure we achieve optimal results. Please arrive 10 minutes early to prepare, and remember to drink plenty of water beforehand for better treatment outcomes!`,

      `${patientName}, just a quick reminder about tomorrow's ${procedure}. Based on your profile, I've prepared a customized treatment plan that will address your specific concerns. Can't wait to see the results we'll achieve!`,

      `Hello ${patientName}! Your ${procedure} appointment is confirmed. I've reviewed your treatment history and have some new techniques I think will work wonderfully for you. Did you have any questions before your visit?`,

      `${patientName}, I've been reviewing your treatment plan for tomorrow's ${procedure} session and I'm excited about the progress we'll make! I've allocated extra time for addressing any concerns you might have.`,
    ];

    // Select a message based on a hash of patient name and procedure
    const hash = (patientName.length + procedure.length) % preCareMessages.length;
    return preCareMessages[hash];
  }

  // Post-care messages
  const postCareMessages = [
    `${patientName}, I've been thinking about your recent ${procedure} treatment. Based on what we observed during your session ${observations?.substring(0, 50) || "and your skin's response"}, I'd like to recommend a special follow-up regimen to maximize your results.`,

    `I've been reviewing the notes from your ${procedure} treatment, ${patientName}. Given your specific responses, I'd suggest focusing on hydration and gentle skin care for the next few days. I've seen remarkable results with this approach for similar cases.`,

    `${patientName}, after analyzing the results of your ${procedure}, I believe we're on an excellent path! I've customized some aftercare recommendations specifically for your skin type and concerns that will enhance your results even further.`,

    `I've been thinking about your ${procedure} results, ${patientName}. Based on how well you responded to the treatment, I'd love to discuss a complementary therapy at your follow-up that could further enhance your results!`,
  ];

  // Select a message based on a hash of patient name and procedure
  const hash = (patientName.length + procedure.length) % postCareMessages.length;
  return postCareMessages[hash];
}

const alternativeMessages = [
  "Would you like me to suggest some alternative times that might work better with your schedule?",
  "I can also provide more information about our new treatment options if you're interested.",
  "We have some special packages available for our valued patients - would you like to learn more?",
  "I'd be happy to discuss any concerns or questions you might have about the treatment.",
];

export default function ApprovalsPage() {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [cards, setCards] = useState<ApprovalCard[]>([]);
  const [messageVariant, setMessageVariant] = useState(0);
  const [showCopyMessage, setShowCopyMessage] = useState(false);
  const [showTeraCompose, setShowTeraCompose] = useState(false);
  const [usedAIMessages, setUsedAIMessages] = useState<Record<string, string>>({});
  const [toasts, setToasts] = useState<
    { id: number; title: string; description: string; status: "success" | "error" }[]
  >([]);
  const [newChatMessage, setNewChatMessage] = useState("");

  // Load cards from today's appointments on mount and load any saved AI messages
  useEffect(() => {
    const approvalCards = getTodayApprovals();

    // Ensure the third card (index 2) has chat history for demo purposes
    if (approvalCards.length > 2) {
      // First, ensure third card has chat history
      const thirdCard = approvalCards[2];
      if (!thirdCard.chatHistory || thirdCard.chatHistory.length === 0) {
        console.log("Adding demo chat history to the 3rd card");
        const now = new Date();
        const threeDaysAgo = new Date(now);
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        approvalCards[2] = {
          ...thirdCard,
          chatHistory: [
            {
              id: "demo-1",
              text: `Hi ${thirdCard.patientName.split(" ")[0]}, I noticed you've scheduled a treatment. Is there anything specific you'd like to address during the session?`,
              sender: "provider",
              timestamp: new Date(threeDaysAgo.getTime() + 3600000), // 1 hour after start
              isOutbound: false,
            },
            {
              id: "demo-2",
              text: "Yes, I'm mainly concerned about the results from my last treatment. I didn't get the results I expected.",
              sender: "patient",
              timestamp: new Date(threeDaysAgo.getTime() + 4000000), // A bit later
              isOutbound: true,
            },
            {
              id: "demo-3",
              text: "I understand your concerns. I've looked at your record from the previous session. We'll definitely focus on improving upon your previous treatment results.",
              sender: "provider",
              timestamp: new Date(threeDaysAgo.getTime() + 4500000),
              isOutbound: false,
            },
            {
              id: "demo-4",
              text: "That sounds great! I've also been wondering if there are any pre-treatment recommendations I should follow?",
              sender: "patient",
              timestamp: new Date(threeDaysAgo.getTime() + 86400000), // Next day
              isOutbound: true,
            },
            {
              id: "demo-5",
              text: "Absolutely! I recommend following the standard preparation instructions we discussed previously. This will help optimize your results.",
              sender: "provider",
              timestamp: new Date(threeDaysAgo.getTime() + 90000000),
              isOutbound: false,
            },
          ],
        };
      }

      // Remove chat history from non-third cards
      approvalCards.forEach((card, index) => {
        if (index !== 2 && card.chatHistory) {
          console.log(`Removing chat history from card index ${index}`);
          card.chatHistory = undefined;
        }
      });
    }

    // Load any saved AI messages from localStorage
    try {
      const savedMessages = localStorage.getItem("usedAIMessages");
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        setUsedAIMessages(parsedMessages);

        // Apply saved messages to the cards
        const updatedCards = approvalCards.map((card) => {
          if (parsedMessages[card.id]) {
            return {
              ...card,
              message: parsedMessages[card.id],
            };
          }
          return card;
        });

        setCards(updatedCards);
      } else {
        setCards(approvalCards);
      }

      // Debug: Log the chat histories in the approval cards
      console.log(
        "Approval cards with chat histories:",
        approvalCards.map((card, idx) => ({
          index: idx,
          id: card.id,
          hasChatHistory: !!card.chatHistory,
          chatHistoryLength: card.chatHistory?.length,
        })),
      );

      // Show Tera Compose initially only on the second card
      if (currentCardIndex === 1 && approvalCards.length > 1) {
        setShowTeraCompose(true);
      } else {
        setShowTeraCompose(false);
      }
    } catch (error) {
      console.error("Error loading saved AI messages:", error);
      setCards(approvalCards);
    }
  }, [currentCardIndex]);

  const handleNavigate = (direction: "up" | "down") => {
    let newIndex = currentCardIndex;

    if (direction === "up" && currentCardIndex > 0) {
      newIndex = currentCardIndex - 1;
    } else if (direction === "down" && currentCardIndex < cards.length - 1) {
      newIndex = currentCardIndex + 1;
    } else {
      return; // No change
    }

    // Update current card index
    setCurrentCardIndex(newIndex);

    // Reset message variant
    setMessageVariant(0);

    // Show Tera Compose only on 2nd card (index 1)
    setShowTeraCompose(newIndex === 1);

    console.log(`Navigated to card index: ${newIndex}, showing Tera Compose: ${newIndex === 1}`);
  };

  const handleAction = async (action: "approve" | "decline") => {
    if (cards.length === 0) return;

    const currentCard = cards[currentCardIndex];

    // If we're using the AI generated message variant, use that message
    let messageToSend = currentCard.message;
    if (messageVariant === 1) {
      messageToSend = currentCard.aiGeneratedMessage || currentCard.message;
    } else if (messageVariant > 1) {
      messageToSend = alternativeMessages[messageVariant - 1];
    }

    // Update the appointment in our mock data
    updateAppointmentNotificationStatus(
      currentCard.id,
      action === "approve" ? "approved" : "disapproved",
      action === "approve", // sent is true for approve, false for decline
      action === "approve" ? messageToSend : undefined,
    );

    // Remove the processed card
    const newCards = [...cards];
    newCards.splice(currentCardIndex, 1);

    // Show toast
    toast[action === "approve" ? "success" : "error"](
      `Message ${action === "approve" ? "approved" : "declined"} successfully`,
    );

    // Animate card removal
    await new Promise((resolve) => setTimeout(resolve, 300));

    setCards(newCards);

    // Adjust current index if needed
    if (currentCardIndex >= newCards.length) {
      setCurrentCardIndex(Math.max(0, newCards.length - 1));
    }

    // Show confetti if no cards left
    if (newCards.length === 0) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const handleRegenerate = () => {
    // Don't show Tera Compose on the 3rd card (index 2)
    if (currentCardIndex === 2) {
      console.log("Regenerate clicked on 3rd card - not showing Tera Compose");
      return;
    }

    // Show the Tera Compose box when regenerate is clicked
    setShowTeraCompose(true);

    // Cycle through: original → AI generated → alternative messages
    setMessageVariant((prev) => {
      // If we're about to go past the last alternative, reset to 0
      if (prev === alternativeMessages.length) {
        return 0;
      }
      return prev + 1;
    });
  };

  // Get the message to display in the Tera Compose box
  const getTeraComposeMessage = () => {
    if (cards.length === 0) return "";

    if (messageVariant === 0) {
      return cards[currentCardIndex].aiGeneratedMessage || cards[currentCardIndex].message;
    }

    return alternativeMessages[messageVariant - 1];
  };

  // Handle the "Use this copy" button click
  const handleUseCopy = () => {
    const currentCardId = cards[currentCardIndex].id;
    const selectedMessage = getTeraComposeMessage();

    // Update the usedAIMessages state with the selected message
    const updatedUsedMessages = {
      ...usedAIMessages,
      [currentCardId]: selectedMessage,
    };
    setUsedAIMessages(updatedUsedMessages);

    // Save to localStorage
    localStorage.setItem("usedAIMessages", JSON.stringify(updatedUsedMessages));

    // Update the card message in the cards array
    const updatedCards = cards.map((card, index) => {
      if (index === currentCardIndex) {
        return {
          ...card,
          message: selectedMessage,
        };
      }
      return card;
    });
    setCards(updatedCards);

    // Hide Tera Compose after using the copy
    setShowTeraCompose(false);

    // Reset message variant
    setMessageVariant(0);

    // Show toast notification
    const toast = {
      id: new Date().getTime(),
      title: "Message Updated",
      description: "The approval message has been updated.",
      status: "success" as const,
    };
    setToasts((prev) => [...prev, toast]);
  };

  // Determine badge type based on notification type
  const getBadgeType = (type: "pre-care" | "post-care") => {
    return type === "pre-care" ? "Reminder" : "Follow-up";
  };

  // Get current message to display based on messageVariant
  const getCurrentMessage = () => {
    if (cards.length === 0) return "";

    // Always show the card's current message in the parent display
    return cards[currentCardIndex].message;
  };

  // Handle sending a chat message
  const handleSendChatMessage = () => {
    if (!newChatMessage.trim() || !cards[currentCardIndex].chatHistory) return;

    // Create a new message
    const newMessage = {
      id: `msg-${Date.now()}`,
      text: newChatMessage,
      sender: "provider",
      timestamp: new Date(),
      isOutbound: false,
    };

    // Update the card's chat history
    const updatedCards = [...cards];
    updatedCards[currentCardIndex] = {
      ...updatedCards[currentCardIndex],
      chatHistory: [...(updatedCards[currentCardIndex].chatHistory || []), newMessage],
    };

    setCards(updatedCards);
    setNewChatMessage("");
  };

  return (
    <div className="p-6 max-w-[1206px] mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#111827] mb-1">Approvals</h1>
          <p className="text-sm text-[#6B7280]">Review and Approve Daily Patient Interactions</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-base text-[#71717A]">{cards.length} records</span>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleNavigate("up")}
              disabled={currentCardIndex === 0 || cards.length === 0}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#E4E4E7] bg-white disabled:opacity-50"
            >
              <ChevronUp size={20} />
            </button>
            <button
              type="button"
              onClick={() => handleNavigate("down")}
              disabled={currentCardIndex === cards.length - 1 || cards.length === 0}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#E4E4E7] bg-white disabled:opacity-50"
            >
              <ChevronDown size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-md shadow-md flex items-center gap-2 ${
              toast.status === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {toast.status === "success" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <div>
              <p className="font-medium">{toast.title}</p>
              <p className="text-sm">{toast.description}</p>
            </div>
            <button
              type="button"
              className="ml-auto text-gray-500 hover:text-gray-700"
              onClick={() => setToasts(toasts.filter((t) => t.id !== toast.id))}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Approval cards */}
      <div className="grid grid-cols-1 gap-8">
        {cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[600px] text-center">
            <h2 className="text-2xl font-semibold mb-2">All Done! 🎉</h2>
            <p className="text-[#71717A]">There are no more messages to review.</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={cards[currentCardIndex].id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]"
            >
              <div className="p-6 bg-[#FAFAFA] h-[calc(100vh-130px)] flex justify-center overflow-auto">
                <div className="max-w-[600px] flex flex-col">
                  <div></div>
                  <div className="p-4 bg-[#FAE8FF] border-b border-[#E4E4E7] rounded-t-2xl overflow-auto">
                    <div className="flex justify-between">
                      <h2 className="text-xl font-semibold text-[#09090B]">
                        {cards[currentCardIndex].subject}
                      </h2>
                      <div className="flex flex-col items-center gap-2">
                        <span className="px-1 bg-[#F0FDF4] text-[#047857] text-sm font-medium rounded-sm">
                          {getBadgeType(cards[currentCardIndex].notificationType)}
                        </span>
                        <span className="text-xs text-[#71717A]">
                          {cards[currentCardIndex].time}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 overflow-auto bg-white rounded-b-xl flex-1 flex flex-col justify-between">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-[#EFF6FF] rounded-full flex items-center justify-center text-lg font-medium">
                          {cards[currentCardIndex].patientName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-[#09090B]">
                              {cards[currentCardIndex].patientName}
                            </h3>
                            {cards[currentCardIndex].isVip && (
                              <span className="px-2 py-1 bg-[#EFF6FF] text-[#2563EB] rounded text-sm font-medium">
                                VIP
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-[#71717A]">
                            {cards[currentCardIndex].patientId}
                          </p>
                        </div>
                      </div>
                      <p className="text-[#09090B] text-sm mb-4">{getCurrentMessage()}</p>

                      {/* Chat history section - shown ONLY for the 3rd card (index 2) */}
                      {currentCardIndex === 2 &&
                        cards[currentCardIndex]?.chatHistory &&
                        cards[currentCardIndex]?.chatHistory.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-[#71717A] mb-2">
                              Previous Conversation
                            </h4>
                            <div className="border border-gray-200 rounded-lg bg-white h-[220px] overflow-y-auto">
                              <ChatMessages messages={cards[currentCardIndex].chatHistory} />
                            </div>
                          </div>
                        )}
                    </div>

                    <div>
                      <div className="flex flex-col justify-between">
                        {showTeraCompose && (
                          <div className="relative">
                            <div className="bg-[#FAFAFA] rounded-lg border border-gradient-purple mb-4">
                              <div className="flex items-center gap-1 mb-2 absolute -top-2 left-2 bg-gradient-to-r from-[#111A53] to-[#BD05DD] rounded-sm px-2 py-1">
                                <Sparkles className="w-4 h-4 text-white" />
                                <span className="text-white font-semibold text-xs">
                                  Tera Compose
                                </span>
                              </div>
                              <p className="text-[#09090B] text-sm p-4 pb-0 pt-6 flex-1">
                                {getTeraComposeMessage()}
                              </p>
                              <button
                                type="button"
                                onClick={handleUseCopy}
                                className="m-4 text-[#8A03D3] text-sm font-medium hover:underline"
                              >
                                Use this copy
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleAction("approve")}
                            className="flex-1 flex items-center justify-center gap-2 p-2 bg-[#DCFCE7] text-[#15803D] rounded-lg hover:bg-green-100 transition-colors"
                          >
                            <ThumbsUp size={20} />
                            <span className="text-sm">Approve & Send</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAction("decline")}
                            className="flex-1 flex items-center justify-center gap-2 p-2 bg-[#FFE4E6] text-[#BE123C] rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <ThumbsDown size={20} />
                            <span className="text-sm">Decline</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleRegenerate}
                            className="flex-1 flex items-center justify-center gap-2 p-2 border border-[#8A03D3] text-[#8A03D3] rounded-lg hover:bg-purple-50 transition-colors"
                          >
                            <RefreshCw size={20} />
                            <span className="text-sm">Regenerate</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

// Helper function to create a shortened version of a message for the Tera Compose box
function getShortenedMessage(message: string): string {
  if (!message) return "";

  // Split into sentences
  const sentences = message.split(/(?<=[.!?])\s+/);

  // If very short, just return the whole message
  if (sentences.length <= 2 || message.length < 120) return message;

  // Take the first 1-2 sentences and the last sentence
  const firstPart = sentences.slice(0, Math.min(2, Math.ceil(sentences.length / 3))).join(" ");
  const lastPart = sentences[sentences.length - 1];

  // If still too long, truncate middle
  if ((firstPart + lastPart).length > 200) {
    return firstPart.substring(0, 120) + "... " + lastPart;
  }

  return firstPart + " ... " + lastPart;
}
