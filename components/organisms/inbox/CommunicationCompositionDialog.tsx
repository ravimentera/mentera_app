"use client";

import {
  type CreateCommunicationRequest,
  useCreateCommunicationMutation,
} from "@/lib/store/api/communicationsApi";
import { getLoggedInUserProviderId } from "@/utils/provider.utils";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CommunicationCompositionPage } from "./CommunicationCompositionPage";

interface SidebarToggleEvent extends Event {
  detail: { collapsed: boolean };
}

interface CommunicationCompositionDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog should be closed */
  onOpenChange: (open: boolean) => void;
  /** Patient ID */
  patientId: string;
  /** Patient full name */
  patientName: string;
  /** Patient email address */
  recipientEmail: string;
  /** Patient phone number */
  recipientPhone: string;
  /** Initial communication channel */
  initialChannel?: "SMS" | "EMAIL";
  /** Callback when message is sent */
  onSend?: (channel: "SMS" | "EMAIL", subject: string, message: string) => void;
  /** AI generation function */
  onGenerateAIMessage?: (
    context: {
      patientId: string;
      patientName: string;
      channel: "SMS" | "EMAIL";
    },
    callbacks?: {
      onMessageGenerated?: (message: string) => void;
      onSubjectGenerated?: (subject: string) => void;
    },
  ) => Promise<void>;
  /** AI generation loading state */
  isGeneratingAI?: boolean;
}

/**
 * Full-screen dialog for composing communications to patients.
 * Renders the CommunicationCompositionPage within a dialog that takes up
 * the full available content area (respecting the app sidebar and layout).
 */
export function CommunicationCompositionDialog({
  open,
  onOpenChange,
  patientId,
  patientName,
  recipientEmail,
  recipientPhone,
  initialChannel = "SMS",
  onSend,
  onGenerateAIMessage,
  isGeneratingAI = false,
}: CommunicationCompositionDialogProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [createCommunication, { isLoading: isCreating }] = useCreateCommunicationMutation();

  useEffect(() => {
    // Check for sidebar collapsed state in localStorage on mount
    const storedState = localStorage.getItem("sidebarCollapsed");
    if (storedState) {
      setIsSidebarCollapsed(storedState === "true");
    }

    // Listen for sidebar toggle events
    const handleSidebarToggle = (e: SidebarToggleEvent) => {
      setIsSidebarCollapsed(e.detail.collapsed);
    };

    window.addEventListener("sidebarToggle", handleSidebarToggle as EventListener);

    return () => {
      window.removeEventListener("sidebarToggle", handleSidebarToggle as EventListener);
    };
  }, []);

  const handleBack = () => {
    onOpenChange(false);
  };

  const handleSend = async (channel: "SMS" | "EMAIL", subject: string, message: string) => {
    try {
      const providerId = getLoggedInUserProviderId();

      const request: CreateCommunicationRequest = {
        patientId,
        providerId,
        channel,
        content: message,
        messageType: "GENERAL",
        ...(channel === "EMAIL" && subject && { subject }),
      };

      const result = await createCommunication(request).unwrap();

      // Call the provided onSend callback for any additional handling
      if (onSend) {
        onSend(channel, subject, message);
      }

      toast.success(`${channel === "EMAIL" ? "Email" : "Message"} sent successfully!`);

      // After successful send, close the dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error(`Failed to send ${channel === "EMAIL" ? "email" : "message"}. Please try again.`);
    }
  };

  if (!open) return null;

  // Calculate sidebar width based on collapsed state
  const sidebarWidth = isSidebarCollapsed ? 60 : 240; // w-15 = 60px, w-60 = 240px

  return (
    <div
      className="fixed top-0 right-0 bottom-0 z-10 bg-white transition-all duration-300 ease-in-out"
      style={{ left: `${sidebarWidth}px` }}
    >
      <CommunicationCompositionPage
        patientId={patientId}
        patientName={patientName}
        recipientEmail={recipientEmail}
        recipientPhone={recipientPhone}
        initialChannel={initialChannel}
        onBack={handleBack}
        onSend={handleSend}
        isLoading={isCreating}
        onGenerateAIMessage={onGenerateAIMessage}
        isGeneratingAI={isGeneratingAI}
      />
    </div>
  );
}
