"use client";

import { Thread } from "@/components/assistant-ui/thread";
import { patientDatabase } from "@/mock/chat.data";
import { useState } from "react";
import { ChatTopbar } from "./ChatTopbar";
import { TeraRuntimeProvider } from "./TeraRuntimeProvider";

export default function ChatClient() {
  const [currentPatientId, setCurrentPatientId] = useState<keyof typeof patientDatabase>("PT-1004");
  const [isPatientContextEnabled, setIsPatientContextEnabled] = useState(true);
  const [forceFresh, setForceFresh] = useState(false);
  const [cacheDebug, setCacheDebug] = useState(false);

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
        <TeraRuntimeProvider
          currentPatientId={currentPatientId}
          isPatientContextEnabled={isPatientContextEnabled}
          forceFresh={forceFresh}
          cacheDebug={cacheDebug}
        >
          <Thread />
        </TeraRuntimeProvider>
      </div>
    </div>
  );
}
