// lib/hooks/useChatMockHandler.ts
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { v4 as uuid } from "uuid";

import type { AppDispatch } from "@/lib/store";
import { fetchDynamicLayout } from "@/lib/store/dynamicLayoutSlice";
import { addMessage } from "@/lib/store/messagesSlice";
import { updateThreadLastMessageAt } from "@/lib/store/threadsSlice";

import { sanitizeMarkdown } from "@/lib/utils";
import { patientDatabase as mockPatientDatabase } from "@/mock/chat.data";
import { generateMockAiResponse } from "@/mock/mockTera/chatWebSocketMockLogic";

/* ------------------------------------------------------------------ */
/*  Feature-flag                                                      */
/* ------------------------------------------------------------------ */
const IS_DEV = process.env.NODE_ENV === "development";
// export const ENABLE_MOCK_CHAT = true;
export const ENABLE_MOCK_CHAT = IS_DEV && process.env.NEXT_PUBLIC_ENABLE_MOCK_CHAT === "true";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */
interface Props {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  currentPatientId: keyof typeof mockPatientDatabase;
  isPatientContextEnabled: boolean;
}

interface Return {
  isMockActive: boolean;
  initialMockConnectedState: boolean;
  mockSendMessage: ((text: string, threadId: string) => void) | null;
}

/* ------------------------------------------------------------------ */
/*  Hook                                                              */
/* ------------------------------------------------------------------ */
export function useChatMockHandler({
  setLoading,
  currentPatientId,
  isPatientContextEnabled,
}: Props): Return {
  const dispatch = useDispatch<AppDispatch>();

  /* ---- internal helper to publish the AI reply ---------------- */
  const publishAssistantMessage = useCallback(
    (content: string, threadId: string) => {
      const clean = sanitizeMarkdown(content);

      const aiMsg = {
        id: uuid(),
        threadId,
        sender: "assistant" as const,
        text: clean,
        createdAt: Date.now(),
      };

      dispatch(addMessage(aiMsg));
      dispatch(updateThreadLastMessageAt({ threadId, timestamp: aiMsg.createdAt }));

      if (clean.trim()) dispatch(fetchDynamicLayout(clean));
    },
    [dispatch],
  );

  /* ---- the function returned to useWebSocketChat --------------- */
  const mockSendMessage = useCallback(
    (text: string, threadId: string) => {
      if (!ENABLE_MOCK_CHAT) return;

      setLoading(true);

      /* generate fake answer based on patient context (if enabled) */
      const patient = mockPatientDatabase[currentPatientId];
      const context = isPatientContextEnabled && patient ? { id: patient.id } : undefined;
      const rawReply = generateMockAiResponse(text, context);

      /* simulate latency 0.6 – 1.5 s */
      setTimeout(
        () => {
          publishAssistantMessage(rawReply, threadId);
          setLoading(false);
        },
        600 + Math.random() * 900,
      );
    },
    [currentPatientId, isPatientContextEnabled, publishAssistantMessage, setLoading],
  );

  return {
    isMockActive: ENABLE_MOCK_CHAT,
    initialMockConnectedState: ENABLE_MOCK_CHAT, // pretend “connected”
    mockSendMessage: ENABLE_MOCK_CHAT ? mockSendMessage : null,
  };
}
