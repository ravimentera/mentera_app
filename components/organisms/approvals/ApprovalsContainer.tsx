"use client";

import { Button } from "@/components/atoms/button";
import type { AppDispatch, RootState } from "@/lib/store";
import {
  addChatMessageToApproval,
  cycleMessageVariant,
  navigateToApproval,
  processAndDispatchApproval,
  selectAllApprovalCards,
  selectCurrentApprovalCard,
  selectCurrentApprovalCardIndex,
  setShowTeraComposeForCard,
  updateApprovalCardMessage,
} from "@/lib/store/approvalsSlice";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { ApprovalCardComponent } from "./ApprovalCard";

// Define alternative messages here or import from a shared constants file
const alternativeMessages = [
  "Would you like me to suggest some alternative times that might work better with your schedule?",
  "I can also provide more information about our new treatment options if you're interested.",
  "We have some special packages available for our valued patients - would you like to learn more?",
  "I'd be happy to discuss any concerns or questions you might have about the treatment.",
];

export function ApprovalsContainer() {
  const dispatch = useDispatch<AppDispatch>();
  const allCards = useSelector(selectAllApprovalCards);
  const currentCard = useSelector(selectCurrentApprovalCard);
  const currentIndex = useSelector(selectCurrentApprovalCardIndex);

  // Local state for toasts, as it's purely UI and doesn't need to be global
  const [toasts, setToasts] = useState<
    { id: number; title: string; description: string; status: "success" | "error" }[]
  >([]);

  useEffect(() => {
    // Logic to show Tera Compose on the 2nd card initially (index 1)
    // This should ideally be driven by the card's own state in Redux if it's complex,
    // or handled when navigating.
    if (allCards.length > 0 && currentCard) {
      // Example: Show for 2nd card, if it's the current one
      // This logic might need refinement based on how you want TeraCompose to appear.
      // The slice now handles resetting showTeraCompose on navigation.
      // We might want to set it true for specific cards upon loading them.
      if (currentIndex === 1 && !currentCard.showTeraCompose) {
        dispatch(setShowTeraComposeForCard({ cardId: currentCard.id, show: true }));
      } else if (currentIndex !== 1 && currentCard.showTeraCompose) {
        // Optional: hide if navigating away from the 2nd card
        // dispatch(setShowTeraComposeForCard({ cardId: currentCard.id, show: false }));
      }
    }
  }, [currentIndex, allCards, dispatch, currentCard]);

  const handleNavigate = (direction: "up" | "down") => {
    dispatch(navigateToApproval(direction));
  };

  const handleAction = async (
    cardId: string,
    actionType: "approved" | "disapproved",
    messageContent?: string,
  ) => {
    dispatch(processAndDispatchApproval(cardId, actionType, messageContent));

    toast[actionType === "approved" ? "success" : "error"](
      `Message ${actionType === "approved" ? "approved" : "disapproved"} successfully`,
    );

    // Check if it was the last card after processing
    // The state update for allCards will trigger re-render.
    // We need to access the state *after* the dispatch has potentially removed an item.
    // This confetti logic is tricky here because Redux updates are async.
    // It might be better to check `allCards.length` in a `useEffect` that depends on `allCards`.
  };

  useEffect(() => {
    if (allCards.length === 0 && currentIndex === 0) {
      // Check if list became empty
      console.log("All approval cards processed!");
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [allCards, currentIndex]);

  if (allCards.length === 0) {
    return (
      <div className="p-6 max-w-[1206px] mx-auto flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center">
        <h1 className="text-2xl font-semibold text-[#111827] mb-1">Approvals</h1>
        <p className="text-sm text-[#6B7280] mb-6">Review and Approve Daily Patient Interactions</p>
        <h2 className="text-2xl font-semibold mb-2">All Done! 🎉</h2>
        <p className="text-[#71717A]">There are no more messages to review.</p>
      </div>
    );
  }

  if (!currentCard) {
    // This case should ideally not happen if allCards.length > 0 and currentIndex is managed correctly
    return <div className="p-6">Loading approval card...</div>;
  }

  return (
    <div className="p-6 max-w-[1206px] mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#111827] mb-1">Approvals</h1>
          <p className="text-sm text-[#6B7280]">Review and Approve Daily Patient Interactions</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-base text-[#71717A]">{allCards.length} records</span>
          <div className="flex gap-4">
            <Button
              variant="outline" // Using ShadCN variants
              size="icon"
              onClick={() => handleNavigate("up")}
              disabled={currentIndex === 0 || allCards.length === 0}
              className="w-10 h-10 disabled:opacity-50"
            >
              <ChevronUp size={20} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleNavigate("down")}
              disabled={currentIndex === allCards.length - 1 || allCards.length === 0}
              className="w-10 h-10 disabled:opacity-50"
            >
              <ChevronDown size={20} />
            </Button>
          </div>
        </div>
      </div>

      {/* Toast notifications can be handled by <Toaster /> from sonner at a higher level in your app */}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentCard.id} // Ensure key changes for animation
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]"
        >
          <ApprovalCardComponent
            cardData={currentCard}
            alternativeMessages={alternativeMessages}
            onAction={(actionType, messageContent) =>
              handleAction(currentCard.id, actionType, messageContent)
            }
            onRegenerate={() =>
              dispatch(
                cycleMessageVariant({
                  cardId: currentCard.id,
                  alternativeMessagesCount: alternativeMessages.length,
                }),
              )
            }
            onUseCopy={(newMessage) =>
              dispatch(updateApprovalCardMessage({ cardId: currentCard.id, newMessage }))
            }
            onShowTeraCompose={(show) =>
              dispatch(setShowTeraComposeForCard({ cardId: currentCard.id, show }))
            }
            onSendChatMessage={(chatMessageText) =>
              dispatch(
                addChatMessageToApproval({
                  cardId: currentCard.id,
                  message: {
                    id: `msg-${Date.now()}`,
                    text: chatMessageText,
                    sender: "provider", // Assuming provider is sending
                    timestamp: new Date().toISOString(),
                    isOutbound: false,
                  },
                }),
              )
            }
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
