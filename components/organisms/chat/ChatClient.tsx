"use client";

import { patientDatabase } from "@/mock/chat.data";
import { useEffect, useRef, useState } from "react";
import { ChatInput } from "./ChatInput";
import { ChatMessageList } from "./ChatMessageList";
import { ChatTopbar } from "./ChatTopbar";
import { useWebSocketChat } from "./useWebSocketChat";

export default function ChatClient() {
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const [currentPatientId, setCurrentPatientId] = useState<keyof typeof patientDatabase>("PT-1003");
  const [isPatientContextEnabled, setIsPatientContextEnabled] = useState(true);
  const [forceFresh, setForceFresh] = useState(false);
  const [cacheDebug, setCacheDebug] = useState(false);

  const { messages, streamBuffer, loading, sendMessage } = useWebSocketChat({
    currentPatientId,
    isPatientContextEnabled,
    forceFresh,
    cacheDebug,
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: reason for ignoring
  useEffect(() => {
    chatContainerRef.current?.scrollTo(0, chatContainerRef.current.scrollHeight);
  }, [messages, streamBuffer]);

  return (
    <div className="flex flex-col h-full w-full bg-white">
      <ChatTopbar
        currentPatientId={currentPatientId}
        setCurrentPatientId={setCurrentPatientId}
        isPatientContextEnabled={isPatientContextEnabled}
        setIsPatientContextEnabled={setIsPatientContextEnabled}
        forceFresh={forceFresh}
        setForceFresh={setForceFresh}
        cacheDebug={cacheDebug}
        setCacheDebug={setCacheDebug}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <ChatMessageList
          messages={messages}
          streamBuffer={streamBuffer}
          loading={loading}
          chatContainerRef={chatContainerRef}
        />

        <div className="shrink-0">
          <ChatInput onSend={sendMessage} />
        </div>
      </div>
    </div>
  );
}
