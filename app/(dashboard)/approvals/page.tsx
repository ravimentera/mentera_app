"use client";

import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, RefreshCw, Sparkles, ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ApprovalCard {
  id: string;
  patientName: string;
  patientId: string;
  isVip: boolean;
  time: string;
  subject: string;
  message: string;
}

const initialCards: ApprovalCard[] = [
  {
    id: "1",
    patientName: "Olivia Parker",
    patientId: "PT-1005",
    isVip: true,
    time: "Today, 9:30 AM",
    subject: "Follow up on recent Botox treatment",
    message:
      "Hi Olivia! Just checking in about your recent Botox treatment. How's that mild bruising we discussed? Most patients see it completely fade within 5-7 days. Your results should be fully visible by now - are you loving the smoother appearance? If you're ready, we'd love to schedule your maintenance appointment for 3-4 months from now. Based on your specific treatment areas, early August would be perfect timing. Would you like me to reserve a spot for you?",
  },
  {
    id: "2",
    patientName: "Emma Thompson",
    patientId: "PT-1006",
    isVip: false,
    time: "Today, 10:15 AM",
    subject: "Dermal filler follow-up",
    message:
      "Hi Emma! I wanted to check in on how you're feeling after your dermal filler treatment. Has the initial swelling subsided? Remember to avoid strenuous exercise for the next 24 hours. Your results will continue to settle and improve over the next few days. Please don't hesitate to reach out if you have any questions!",
  },
  {
    id: "3",
    patientName: "Sarah Williams",
    patientId: "PT-1007",
    isVip: true,
    time: "Today, 11:00 AM",
    subject: "Chemical peel aftercare",
    message:
      "Hi Sarah! How are you feeling after your chemical peel? Remember to keep your skin hydrated and protected from the sun. The peeling process is completely normal and should last 5-7 days. Would you like to schedule your next maintenance peel for 6 weeks from now?",
  },
  {
    id: "4",
    patientName: "Michael Brown",
    patientId: "PT-1008",
    isVip: false,
    time: "Today, 11:45 AM",
    subject: "Post-treatment check-in",
    message:
      "Hi Michael! I hope you're enjoying the results of your treatment. As discussed, you might experience some sensitivity for the next few days. Please continue with the aftercare routine we provided. Would you like to schedule your follow-up appointment for next week?",
  },
];

const alternativeMessages = [
  "Would you like me to suggest some alternative times that might work better with your schedule?",
  "I can also provide more information about our new treatment options if you're interested.",
  "We have some special packages available for our valued patients - would you like to learn more?",
  "I'd be happy to discuss any concerns or questions you might have about the treatment.",
];

export default function ApprovalsPage() {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [cards, setCards] = useState(initialCards);
  const [messageVariant, setMessageVariant] = useState(0);
  const [showCopyMessage, setShowCopyMessage] = useState(false);

  const handleNavigate = (direction: "up" | "down") => {
    if (direction === "up" && currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1);
    } else if (direction === "down" && currentCardIndex < cards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
    }
  };

  const handleAction = async (action: "approve" | "decline") => {
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
    setMessageVariant((prev) => (prev + 1) % alternativeMessages.length);
  };

  const handleUseCopy = () => {
    setShowCopyMessage(true);
    setTimeout(() => setShowCopyMessage(false), 2000);
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
              disabled={currentCardIndex === 0}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#E4E4E7] bg-white disabled:opacity-50"
            >
              <ChevronUp size={20} />
            </button>
            <button
              type="button"
              onClick={() => handleNavigate("down")}
              disabled={currentCardIndex === cards.length - 1}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#E4E4E7] bg-white disabled:opacity-50"
            >
              <ChevronDown size={20} />
            </button>
          </div>
        </div>
      </div>

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
                        Follow-up
                      </span>
                      <span className="text-xs text-[#71717A]">{cards[currentCardIndex].time}</span>
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
                    <p className="text-[#09090B] text-sm mb-4">
                      {messageVariant === 0
                        ? cards[currentCardIndex].message
                        : alternativeMessages[messageVariant]}
                    </p>
                  </div>

                  <div>
                    <div className="flex flex-col justify-between">
                      <div className="relative">
                        <div className="bg-[#FAFAFA] rounded-lg border border-gradient-purple mb-4">
                          <div className="flex items-center gap-1 mb-2 absolute -top-2 left-2 bg-gradient-to-r from-[#111A53] to-[#BD05DD] rounded-sm px-2 py-1">
                            <Sparkles className="w-4 h-4 text-white" />
                            <span className="text-white font-semibold text-xs">Tera Compose</span>
                          </div>
                          <p className="text-[#09090B] text-sm p-4 pb-0 pt-6 flex-1">
                            Hi Olivia! Just checking in about your Botox treatment. How's the
                            bruising? Most fades in 5-7 days. Are you loving the smoother look? If
                            you're ready, we can schedule your maintenance appointment for early
                            August. Should I reserve a spot for you?
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
  );
}
