"use client";

import {
  ApprovalCard,
  ApprovalsHeader,
  ConversationSummary,
  EmptyState,
  NavigationControls,
  PatientOverview,
} from "@/components/organisms/approvals";
import { ApprovalItem, approvalItems, getPatientById } from "@/mock/approvals.data";
import confetti from "canvas-confetti";
import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";

export default function ApprovalsPage() {
  const [currentApprovalIndex, setCurrentApprovalIndex] = useState(0);
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);

  useEffect(() => {
    // Get pending approvals
    const pendingApprovals = approvalItems.filter((item) => item.status === "pending");
    setApprovals(pendingApprovals);

    // Trigger confetti if no approvals on initial load
    if (pendingApprovals.length === 0) {
      setTimeout(() => {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }, 500);
    }
  }, []);

  const currentApproval = approvals[currentApprovalIndex];
  const currentPatient = currentApproval ? getPatientById(currentApproval.patientId) : null;

  const handleApproval = (action: "approved" | "declined") => {
    if (!currentApproval) return;

    const updatedApprovals = approvals.filter((_, index) => index !== currentApprovalIndex);
    setApprovals(updatedApprovals);

    // Adjust current index if needed
    if (currentApprovalIndex >= updatedApprovals.length && updatedApprovals.length > 0) {
      setCurrentApprovalIndex(updatedApprovals.length - 1);
    } else if (updatedApprovals.length === 0) {
      setCurrentApprovalIndex(0);
      // Trigger confetti when all approvals are processed
      setTimeout(() => {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }, 300);
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

  if (approvals.length === 0) {
    return (
      <>
        <Toaster richColors position="top-right" />
        <EmptyState className="h-full w-full flex items-center justify-center" />
      </>
    );
  }

  if (!currentApproval || !currentPatient) {
    return null;
  }

  return (
    <>
      <Toaster richColors position="top-right" />
      <div className="h-full w-full p-6">
        {/* Header */}
        <ApprovalsHeader className="flex flex-col items-start mb-6" />

        <div className="flex gap-6 h-[calc(100vh-8rem)]">
          {/* Approval Section */}
          <div className="flex-1 space-y-6">
            {/* Conversation Summary */}
            <ConversationSummary conversationSummary={currentApproval.conversationSummary || ""} />

            {/* Approval Card */}
            <div className="flex flex-col gap-4">
              <ApprovalCard
                approval={currentApproval}
                patient={currentPatient}
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

          {/* Patient Overview Section */}
          <PatientOverview approval={currentApproval} />
        </div>
      </div>
    </>
  );
}
