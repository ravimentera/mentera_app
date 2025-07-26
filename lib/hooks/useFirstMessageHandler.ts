import { AppDispatch, RootState } from "@/lib/store";
import { getThreadById, updateThreadName } from "@/lib/store/slices/threadsSlice";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

/**
 * Custom hook to handle first message processing for threads
 * Automatically marks threads as processed and updates thread name
 * when the first user message is sent
 */
export const useFirstMessageHandler = () => {
  const dispatch = useDispatch<AppDispatch>();

  /**
   * Truncates text to a reasonable thread title length
   */
  const generateThreadTitle = useCallback((text: string): string => {
    const maxLength = 50;
    const cleaned = text.trim().replace(/\s+/g, " ");

    if (cleaned.length <= maxLength) {
      return cleaned;
    }

    // Find the last complete word within the limit
    const truncated = cleaned.substring(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(" ");

    if (lastSpaceIndex > maxLength * 0.7) {
      return truncated.substring(0, lastSpaceIndex) + "...";
    }

    return truncated + "...";
  }, []);

  /**
   * Processes the first message for a thread
   * - Updates the thread name with a truncated version of the message
   * - Does NOT mark as processed (let WebSocket classification handle that)
   */
  const processFirstMessage = useCallback(
    (threadId: string, messageText: string) => {
      const state = store.getState() as RootState;
      const thread = state.threads.threads.find((t) => t.id === threadId);

      // Only process if this is truly the first message
      if (thread && !thread.isFirstQueryProcessed) {
        const newTitle = generateThreadTitle(messageText);

        console.log(`[useFirstMessageHandler] Updated thread name: "${newTitle}" for ${threadId}`);

        // Only update thread name, let WebSocket chat handle isFirstQueryProcessed
        dispatch(updateThreadName({ id: threadId, name: newTitle }));
      } else if (thread) {
        console.log(`[useFirstMessageHandler] Thread ${threadId} already processed, skipping`);
      } else {
        console.log(`[useFirstMessageHandler] Thread ${threadId} not found in state`);
      }
    },
    [dispatch, generateThreadTitle],
  );

  /**
   * Checks if a thread needs first message processing
   */
  const needsFirstMessageProcessing = useCallback((threadId: string): boolean => {
    const state = store.getState() as RootState;
    const thread = state.threads.threads.find((t) => t.id === threadId);
    return thread ? !thread.isFirstQueryProcessed : false;
  }, []);

  return {
    processFirstMessage,
    needsFirstMessageProcessing,
    generateThreadTitle,
  };
};

// For cases where we need to access the store directly
import { store } from "@/lib/store";
