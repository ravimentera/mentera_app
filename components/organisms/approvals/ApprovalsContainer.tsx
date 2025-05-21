"use client";

import { Button } from "@/components/atoms";
import type { AppDispatch } from "@/lib/store";
import {
  ApprovalCardData,
  addChatMessageToApproval,
  cycleMessageVariant,
  navigateToApproval,
  processAndDispatchApproval,
  selectAllApprovalCards,
  selectCurrentApprovalCardIndex as selectCurrentApprovalCardIndexFromRedux,
  setShowTeraComposeForCard,
  updateApprovalCardMessage,
} from "@/lib/store/approvalsSlice"; // Adjust path as needed
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  cards?: ApprovalCardData[];
  onCardAction?: (cardId: string, actionType: "approved" | "disapproved") => void;
}

export function ApprovalsContainer({ cards: cardsProp, onCardAction }: ApprovalsContainerProps) {
  const dispatch = useDispatch<AppDispatch>();

  const isPropDriven = cardsProp !== undefined;

  // State for cards displayed when prop-driven
  const [displayedPropCards, setDisplayedPropCards] = useState<ApprovalCardData[]>([]);
  const prevDisplayedPropCardsLengthRef = useRef<number>(0); // To track when displayedPropCards becomes empty

  // Ref to track if the cardsProp array reference itself has changed
  const prevCardsPropRef = useRef<ApprovalCardData[] | undefined>();

  const cardsFromRedux = useSelector(selectAllApprovalCards);
  // Determine the source of cards for display
  const cardsToDisplay = isPropDriven ? displayedPropCards : cardsFromRedux;

  const reduxCurrentIndex = useSelector(selectCurrentApprovalCardIndexFromRedux);
  const [localCurrentIndex, setLocalCurrentIndex] = useState(0);

  const currentIndex = isPropDriven ? localCurrentIndex : reduxCurrentIndex;
  const currentCard =
    cardsToDisplay && cardsToDisplay.length > 0 && currentIndex < cardsToDisplay.length
      ? cardsToDisplay[currentIndex]
      : null;

  // Effect to synchronize displayedPropCards with cardsProp when cardsProp changes
  useEffect(() => {
    if (isPropDriven) {
      // Only update if the prop array reference has actually changed
      if (cardsProp !== prevCardsPropRef.current) {
        const newCards = cardsProp || [];
        console.log(
          "ApprovalsContainer: cardsProp instance changed. Syncing displayedPropCards.",
          newCards,
        );
        setDisplayedPropCards(newCards);
        setLocalCurrentIndex(0); // Reset index when the parent provides a new list

        // Check for confetti if the new prop list is empty and the previous wasn't
        if (newCards.length === 0 && (prevCardsPropRef.current?.length || 0) > 0) {
          console.log("Prop-driven approval cards list became empty due to prop update!");
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
        prevCardsPropRef.current = cardsProp; // Store the current prop reference
      }
    }
  }, [isPropDriven, cardsProp]);

  // Effect to adjust localCurrentIndex and trigger confetti if displayedPropCards (local state) changes
  useEffect(() => {
    if (isPropDriven) {
      const currentLength = displayedPropCards.length;

      if (currentLength === 0 && prevDisplayedPropCardsLengthRef.current > 0) {
        console.log(
          "Prop-driven approval cards list (displayedPropCards) is now empty after local action!",
        );
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }

      if (localCurrentIndex >= currentLength && currentLength > 0) {
        setLocalCurrentIndex(currentLength - 1);
      } else if (currentLength === 0) {
        setLocalCurrentIndex(0);
      }
      prevDisplayedPropCardsLengthRef.current = currentLength;
    }
  }, [isPropDriven, displayedPropCards, localCurrentIndex]); // localCurrentIndex added back as it might need to re-validate

  // Effect for TeraCompose visibility (remains largely the same)
  useEffect(() => {
    if (cardsToDisplay.length > 0 && currentCard) {
      const targetIndexForTeraCompose = 1;
      const shouldShowTeraCompose =
        currentIndex === targetIndexForTeraCompose &&
        cardsToDisplay.length > targetIndexForTeraCompose;
      if (currentCard.showTeraCompose !== shouldShowTeraCompose) {
        dispatch(
          setShowTeraComposeForCard({ cardId: currentCard.id, show: shouldShowTeraCompose }),
        );
      }
    }
  }, [currentIndex, cardsToDisplay, dispatch, currentCard]);

  const handleNavigate = (direction: "up" | "down") => {
    let newIndex = currentIndex;
    if (isPropDriven) {
      if (direction === "up" && localCurrentIndex > 0) {
        newIndex = localCurrentIndex - 1;
      } else if (direction === "down" && localCurrentIndex < displayedPropCards.length - 1) {
        newIndex = localCurrentIndex + 1;
      }
      setLocalCurrentIndex(newIndex);
    } else {
      dispatch(navigateToApproval(direction));
      newIndex =
        direction === "up"
          ? Math.max(0, reduxCurrentIndex - 1)
          : Math.min(cardsFromRedux.length - 1, reduxCurrentIndex + 1);
    }

    if (newIndex >= 0 && newIndex < cardsToDisplay.length) {
      const nextCardId = cardsToDisplay[newIndex].id;
      dispatch(setShowTeraComposeForCard({ cardId: nextCardId, show: false }));
    }
  };

  const handleAction = async (
    cardId: string,
    actionType: "approved" | "disapproved",
    messageContent?: string,
  ) => {
    dispatch(processAndDispatchApproval(cardId, actionType, messageContent));
    toast[actionType === "approved" ? "success" : "error"](
      `Message ${actionType === "approved" ? "approved" : "declined"} successfully`,
    );

    if (isPropDriven) {
      onCardAction?.(cardId, actionType); // Notify parent
      // Immediately update the local display list for instant UI feedback
      setDisplayedPropCards((prev) => prev.filter((card) => card.id !== cardId));
      // The useEffect watching displayedPropCards will handle index adjustment and confetti
    }
  };

  useEffect(() => {
    if (!isPropDriven && cardsToDisplay.length === 0 && currentIndex === 0 && !currentCard) {
      console.log("All Redux approval cards processed!");
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  }, [cardsToDisplay, currentIndex, currentCard, isPropDriven]);

  if (cardsToDisplay.length === 0) {
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
    return <div className="p-6 text-center">Loading or adjusting view...</div>;
  }

  const commonCardProps = (cardId: string) => ({
    alternativeMessages: alternativeMessages,
    onAction: (actionType: "approved" | "disapproved", messageContent?: string) =>
      handleAction(cardId, actionType, messageContent),
    onRegenerate: () =>
      dispatch(
        cycleMessageVariant({
          cardId: cardId,
          alternativeMessagesCount: alternativeMessages.length,
        }),
      ),
    onUseCopy: (newMessage: string) =>
      dispatch(updateApprovalCardMessage({ cardId: cardId, newMessage })),
    onShowTeraCompose: (show: boolean) =>
      dispatch(setShowTeraComposeForCard({ cardId: cardId, show })),
    onSendChatMessage: (chatMessageText: string) =>
      dispatch(
        addChatMessageToApproval({
          cardId: cardId,
          message: {
            id: `msg-${Date.now()}`,
            text: chatMessageText,
            sender: "provider",
            timestamp: new Date().toISOString(),
            isOutbound: false,
          },
        }),
      ),
  });

  return (
    <div className="p-6 max-w-[1206px] mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#111827] mb-1">Approvals</h1>
          <p className="text-sm text-[#6B7280]">Review and Approve Daily Patient Interactions</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-base text-[#71717A]">{cardsToDisplay.length} records</span>
          <div className="flex gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleNavigate("up")}
              disabled={currentIndex === 0 || cardsToDisplay.length === 0}
              className="w-10 h-10 disabled:opacity-50"
            >
              <ChevronUp size={20} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleNavigate("down")}
              disabled={currentIndex === cardsToDisplay.length - 1 || cardsToDisplay.length === 0}
              className="w-10 h-10 disabled:opacity-50"
            >
              <ChevronDown size={20} />
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentCard.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]"
        >
          <ApprovalCardComponent cardData={currentCard} {...commonCardProps(currentCard.id)} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
