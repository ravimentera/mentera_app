"use client";

import { Button } from "@/components/atoms/button";
import type { AppDispatch, RootState } from "@/lib/store";
import {
  ApprovalCardData,
  addApprovals,
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
import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { ApprovalCardComponent } from "./ApprovalCard";

const alternativeMessages = [
  "Would you like me to suggest some alternative times that might work better with your schedule?",
  "I can also provide more information about our new treatment options if you're interested.",
  "We have some special packages available for our valued patients - would you like to learn more?",
  "I'd be happy to discuss any concerns or questions you might have about the treatment.",
];

interface ApprovalsContainerProps {
  cards?: ApprovalCardData[]; // Optional prop to pass in new approval cards
}

export function ApprovalsContainer({ cards: cardsProp }: ApprovalsContainerProps) {
  // Destructure cards as cardsProp
  const dispatch = useDispatch<AppDispatch>();
  const allCards = useSelector(selectAllApprovalCards);

  const currentCard = useSelector(selectCurrentApprovalCard);
  const currentIndex = useSelector(selectCurrentApprovalCardIndex);

  const [toasts, setToasts] = useState<
    { id: number; title: string; description: string; status: "success" | "error" }[]
  >([]);

  // Ref to track the last processed cardsProp instance to avoid duplicate processing
  const processedCardsPropRef = useRef<ApprovalCardData[] | undefined>();

  // Effect to append cards from props to the Redux store
  useEffect(() => {
    // Only process if cardsProp is new and different from the last one processed
    if (cardsProp && cardsProp !== processedCardsPropRef.current && cardsProp.length > 0) {
      console.log("ApprovalsContainer: New cardsProp instance detected, dispatching addApprovals.");
      dispatch(addApprovals(cardsProp));
      // Mark this instance of cardsProp as processed
      processedCardsPropRef.current = cardsProp;
    } else if (cardsProp && cardsProp === processedCardsPropRef.current) {
      console.log(
        "ApprovalsContainer: cardsProp is the same instance, already processed by this effect.",
      );
    }
  }, [cardsProp, dispatch]);

  useEffect(() => {
    if (allCards.length > 0 && currentCard) {
      if (currentIndex === 1 && !currentCard.showTeraCompose && allCards.length > 1) {
        // Ensure there's actually a second card
        dispatch(setShowTeraComposeForCard({ cardId: currentCard.id, show: true }));
      }
      // Removed the else-if to prevent hiding TeraCompose when navigating away from the 2nd card.
      // TeraCompose visibility will now be explicitly managed by other actions (e.g., onUseCopy, cycleMessageVariant).
    }
  }, [currentIndex, allCards, dispatch, currentCard]);

  const handleNavigate = (direction: "up" | "down") => {
    dispatch(navigateToApproval(direction));
  };

  const handleAction = async (
    cardId: string,
    actionType: "approved" | "disapproved", // Corrected type to match thunk
    messageContent?: string,
  ) => {
    dispatch(processAndDispatchApproval(cardId, actionType, messageContent));

    toast[actionType === "approved" ? "success" : "error"](
      `Message ${actionType === "approved" ? "approved" : "declined"} successfully`,
    );
  };

  useEffect(() => {
    // Check if the list became empty *after* an action might have removed the last card.
    // This relies on `allCards` being updated from Redux.
    if (allCards.length === 0 && currentIndex === 0 && !currentCard) {
      console.log("All approval cards processed!");
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [allCards, currentIndex, currentCard]); // Add currentCard to dependency

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
    // This might happen briefly if allCards is not empty but currentIndex is out of bounds
    // or if the selector returns null before state is fully updated.
    return <div className="p-6 text-center">Loading current approval card...</div>;
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
              variant="outline"
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

      {/* Toast notifications can be handled by <Toaster /> from sonner at a higher level */}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentCard.id}
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
                    sender: "provider",
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
