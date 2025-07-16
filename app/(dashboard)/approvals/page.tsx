"use client";

import { ChatMessages } from "@/components/molecules";
import { CommunicationToggle } from "@/components/molecules/CommunicationToggle";
import { Drawer, DrawerClose, DrawerContent, DrawerHeader } from "@/components/organisms";
import {
  ApprovalCard,
  ApprovalsHeader,
  ConversationSummary,
  EmptyState,
  NavigationControls,
  PatientOverview,
} from "@/components/organisms/approvals";
import {
  useGetPatientConversationQuery,
  useGetPatientDetailsQuery,
  useGetPatientMedicalHistoryQuery,
  useGetPatientVisitsQuery,
  useGetPendingApprovalsQuery,
} from "@/lib/store/api";
import { useAppSelector } from "@/lib/store/hooks";
import { selectUser } from "@/lib/store/slices/authSlice";
import {
  createMockPatientFromApproval,
  filterMessagesByChannel,
  transformAPIApprovalToMockApproval,
  transformAPIConversationToMockConversation,
} from "@/utils/approvals.utils";
import confetti from "canvas-confetti";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Toaster, toast } from "sonner";

export default function ApprovalsPage() {
  const [currentApprovalIndex, setCurrentApprovalIndex] = useState(0);
  const [showConversationDrawer, setShowConversationDrawer] = useState(false);
  const [activeCommMethod, setActiveCommMethod] = useState<"chat" | "email">("chat");
  const [hasApprovalErrors, setHasApprovalErrors] = useState(false);

  // Get current user from auth state
  const user = useAppSelector(selectUser);
  const providerId = user?.providerId || "PR-2001"; // Fallback to default

  // API calls for approvals
  const {
    data: approvalsData,
    isLoading: approvalsLoading,
    error: approvalsError,
  } = useGetPendingApprovalsQuery({ providerId, limit: 50, offset: 0 });

  // Get the current approval and extract patient ID from the active approval card
  const currentAPIApproval = approvalsData?.data?.approvals[currentApprovalIndex];
  const currentPatientId = currentAPIApproval?.patient?.id;

  // API calls for patient data using the patient ID from the active approval card
  // These will re-fetch automatically when currentApprovalIndex changes (and thus currentPatientId changes)
  const {
    data: patientDetailsData,
    isLoading: patientDetailsLoading,
    error: patientDetailsError,
  } = useGetPatientDetailsQuery(currentPatientId || "", {
    skip: !currentPatientId,
  });

  const {
    data: patientVisitsData,
    isLoading: patientVisitsLoading,
    error: patientVisitsError,
  } = useGetPatientVisitsQuery(currentPatientId || "", {
    skip: !currentPatientId,
  });

  const {
    data: patientMedicalData,
    isLoading: patientMedicalLoading,
    error: patientMedicalError,
  } = useGetPatientMedicalHistoryQuery(currentPatientId || "", {
    skip: !currentPatientId,
  });

  // Get conversation data for the current patient using the same patient ID
  const {
    data: conversationData,
    isLoading: conversationLoading,
    error: conversationError,
  } = useGetPatientConversationQuery(
    {
      patientId: currentPatientId || "",
      providerId,
    },
    {
      skip: !currentPatientId,
    },
  );

  // Transform API data to component format with enhanced patient data
  const approvals = useMemo(() => {
    if (!approvalsData?.data?.approvals) return [];

    return approvalsData.data.approvals.map((approval, index) => {
      // Only use enhanced patient data for the current approval to avoid unnecessary complexity
      // and ensure we have the most up-to-date data for the active approval
      if (index === currentApprovalIndex) {
        return transformAPIApprovalToMockApproval(
          approval,
          patientDetailsData,
          patientVisitsData,
          patientMedicalData,
        );
      }

      // For non-current approvals, use basic transformation without patient data
      return transformAPIApprovalToMockApproval(approval);
    });
  }, [
    approvalsData,
    currentApprovalIndex,
    patientDetailsData,
    patientVisitsData,
    patientMedicalData,
  ]);

  const currentApproval = approvals[currentApprovalIndex];

  // Create mock patient data from current approval with enhanced patient data
  const currentPatient = currentAPIApproval
    ? createMockPatientFromApproval(currentAPIApproval, patientDetailsData)
    : null;

  // Transform conversation data
  const transformedConversation = conversationData
    ? transformAPIConversationToMockConversation(conversationData)
    : { messages: [] };

  // Filter messages based on active communication method
  const filteredMessages = useMemo(() => {
    return filterMessagesByChannel(transformedConversation.messages, activeCommMethod);
  }, [transformedConversation.messages, activeCommMethod]);

  // Get the actual conversation summary from the API, fallback to approval context summary
  const actualConversationSummary =
    conversationData?.data?.summary?.summary?.summary ||
    currentApproval?.conversationSummary ||
    "N/A";

  useEffect(() => {
    // Reset error flag when new approvals are loaded
    if (approvalsData?.data?.approvals && approvalsData.data.approvals.length > 0) {
      setHasApprovalErrors(false);
    }
  }, [approvalsData]);

  useEffect(() => {
    // Trigger confetti if no approvals on initial load and no errors occurred
    if (!approvalsLoading && approvals.length === 0 && !hasApprovalErrors && !approvalsError) {
      setTimeout(() => {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }, 500);
    }
  }, [approvalsLoading, approvals.length, hasApprovalErrors, approvalsError]);

  const handleApproval = (action: "approved" | "declined", hasError = false) => {
    if (!currentApproval) return;

    if (hasError) {
      // Set error flag to prevent confetti
      setHasApprovalErrors(true);
      toast.error(
        `Failed to ${action === "approved" ? "approve" : "decline"} message. Please try again.`,
      );
      return;
    }

    // Success case - adjust current index if needed
    if (currentApprovalIndex >= approvals.length - 1 && approvals.length > 1) {
      setCurrentApprovalIndex(approvals.length - 2);
    } else if (approvals.length === 1) {
      setCurrentApprovalIndex(0);
      // Trigger confetti when all approvals are processed successfully without errors
      if (!hasApprovalErrors) {
        setTimeout(() => {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }, 300);
      }
    }

    toast.success(
      action === "approved"
        ? "Message approved and sent successfully"
        : "Message declined successfully",
    );
  };

  const handleNavigation = (direction: "prev" | "next") => {
    if (direction === "prev" && currentApprovalIndex > 0) {
      setCurrentApprovalIndex(currentApprovalIndex - 1);
    } else if (direction === "next" && currentApprovalIndex < approvals.length - 1) {
      setCurrentApprovalIndex(currentApprovalIndex + 1);
    }
  };

  const handleViewConversation = () => {
    setShowConversationDrawer(true);
  };

  // Loading state
  if (approvalsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading approvals...</p>
      </div>
    );
  }

  // Error state
  if (approvalsError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">Error loading approvals</p>
      </div>
    );
  }

  // Empty state
  if (approvals.length === 0) {
    return (
      <>
        <Toaster richColors position="top-right" />
        <EmptyState className="h-full w-full flex items-center justify-center" />
      </>
    );
  }

  // No current approval state
  if (!currentApproval || !currentPatient) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">No approval data available</p>
      </div>
    );
  }

  return (
    <>
      <Toaster richColors position="top-right" />
      <div className="h-full w-full">
        <div className="flex">
          {/* Approval Section */}
          <div className="flex-1 space-y-6 p-6 h-screen overflow-y-auto">
            {/* Header */}
            <ApprovalsHeader className="flex flex-col items-start mb-6" />
            <div className="flex justify-center">
              <div className="space-y-6 px-16">
                {/* Conversation Summary */}
                <ConversationSummary
                  conversationSummary={actualConversationSummary}
                  onViewConversation={handleViewConversation}
                />

                {/* Approval Card */}
                <div className="flex flex-col gap-4">
                  <ApprovalCard
                    approval={currentApproval}
                    patient={currentPatient}
                    providerId={providerId}
                    onApproval={handleApproval}
                  />

                  <NavigationControls
                    currentIndex={currentApprovalIndex}
                    totalApprovals={approvals.length}
                    onPrevious={() => handleNavigation("prev")}
                    onNext={() => handleNavigation("next")}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Patient Overview Section */}
          <div className="w-96 max-h-screen overflow-y-auto border-l border-border rounded-xl">
            <PatientOverview patientId={currentApproval.patientId} patient={currentPatient} />
          </div>
        </div>

        {/* Conversation Drawer */}
        <Drawer
          direction="right"
          open={showConversationDrawer}
          onOpenChange={setShowConversationDrawer}
        >
          <DrawerContent className="w-142" direction="right">
            <DrawerHeader className="border-b border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-semibold text-foreground">All Conversations</h2>

                  {/* Communication Method Toggle */}
                  <CommunicationToggle
                    activeMethod={activeCommMethod}
                    onMethodChange={setActiveCommMethod}
                  />
                </div>

                <DrawerClose asChild>
                  <button type="button" className="text-gray-400 hover:text-gray-600">
                    <X className="h-6 w-6" />
                  </button>
                </DrawerClose>
              </div>
            </DrawerHeader>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto">
              {conversationLoading ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-gray-500">Loading conversation...</p>
                </div>
              ) : conversationError ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-red-500">Error loading conversation</p>
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <p className="text-gray-500 text-lg mb-2">
                      No {activeCommMethod === "chat" ? "SMS" : "Email"} conversations found
                    </p>
                    <p className="text-gray-400 text-sm">
                      Try switching to {activeCommMethod === "chat" ? "Email" : "SMS"} to see other
                      conversations
                    </p>
                  </div>
                </div>
              ) : (
                <ChatMessages messages={filteredMessages} />
              )}
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
}
