import { Avatar, AvatarFallback, Badge, Button, Skeleton } from "@/components/atoms";
import { CommunicationToggle } from "@/components/molecules/CommunicationToggle";
import {
  useApproveApprovalMutation,
  useDeclineApprovalMutation,
  useEditApproveApprovalMutation,
  useGenerateAutomatedMessageMutation,
} from "@/lib/store/api/communicationsApi";
import { ApprovalItem } from "@/mock/approvals.data";
import type { PatientWithProfile } from "@/types/user.types";
import { formatApprovalTimestamp } from "@/utils/date.utils";
import { Check, Mail, Phone, Sparkles, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ApprovalCardProps {
  approval: ApprovalItem;
  patient: PatientWithProfile;
  providerId: string;
  onApproval: (action: "approved" | "declined") => void;
  className?: string;
}

export function ApprovalCard({
  approval,
  patient,
  providerId,
  onApproval,
  className,
}: ApprovalCardProps) {
  const [activeCommMethod, setActiveCommMethod] = useState<"chat" | "email">("chat");
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [editedMessage, setEditedMessage] = useState(approval.message);
  const [isGenerating, setIsGenerating] = useState(false);
  const [originalMessage] = useState(approval.message); // Store original message for fallback
  const [wasManuallyEdited, setWasManuallyEdited] = useState(false); // Track if message was manually edited
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // API mutations
  const [generateAutomatedMessage] = useGenerateAutomatedMessageMutation();
  const [approveApproval] = useApproveApprovalMutation();
  const [editApproveApproval] = useEditApproveApprovalMutation();
  const [declineApproval] = useDeclineApprovalMutation();

  const handleMessageClick = () => {
    setIsEditingMessage(true);
    setEditedMessage(approval.message);
  };

  const handleSaveMessage = () => {
    // Mark as manually edited if the content changed
    if (editedMessage !== approval.message) {
      setWasManuallyEdited(true);
    }

    // Update the approval message
    approval.message = editedMessage;
    setIsEditingMessage(false);
  };

  const handleCancelEdit = () => {
    setEditedMessage(approval.message);
    setIsEditingMessage(false);
  };

  const handleGenerateWithTera = async () => {
    try {
      setIsGenerating(true);

      // Prepare the API request
      const requestData = {
        patientId: approval.patientId,
        providerId: providerId,
        eventType: "APPOINTMENT_MISSED", // Default event type - could be dynamic based on approval type
        channel: activeCommMethod === "chat" ? ("SMS" as const) : ("EMAIL" as const),
        priority: "HIGH" as const,
      };

      // Call the API
      const response = await generateAutomatedMessage(requestData).unwrap();

      // Update the message with the generated content
      if (response.success && response.data.content) {
        const generatedMessage = response.data.content;
        approval.message = generatedMessage;
        setEditedMessage(generatedMessage);

        // Reset manual edit flag since this was AI generated
        setWasManuallyEdited(false);
      }
    } catch (error) {
      console.error("Failed to generate automated message:", error);

      // Fallback to original message in case of error
      approval.message = originalMessage;
      setEditedMessage(originalMessage);
      setWasManuallyEdited(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApproval = async (action: "approved" | "declined") => {
    try {
      if (action === "declined") {
        await declineApproval({ approvalId: approval.id }).unwrap();
      } else {
        // Check if message was manually edited
        if (wasManuallyEdited || editedMessage !== originalMessage) {
          await editApproveApproval({
            approvalId: approval.id,
            body: {
              content: editedMessage,
              // scheduledFor is optional and undefined by default
            },
          }).unwrap();
        } else {
          await approveApproval({ approvalId: approval.id }).unwrap();
        }
      }

      // Call the parent component's onApproval handler
      onApproval(action);
    } catch (error) {
      console.error(`Failed to ${action} approval:`, error);
    }
  };

  useEffect(() => {
    if (isEditingMessage && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditingMessage]);

  return (
    <div className={className}>
      <div className="bg-white rounded-lg border border-ui-border space-y-4">
        {/* Header */}
        <div className="p-4 border-b border-ui-border bg-ui-background-gray">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-semibold text-foreground">
              Follow up on recent {approval.appointmentDetails?.procedure || "treatment"}.
            </h3>
            <div className="flex flex-col items-end gap-1">
              <Badge variant="success">{approval.type}</Badge>
              <span className="text-sm text-muted-foreground">
                {approval.timestamp
                  ? formatApprovalTimestamp(approval.timestamp)
                  : "Today, 9:30 AM"}
              </span>
            </div>
          </div>
        </div>

        {/* Patient Info and Message */}
        <div className="p-4 space-y-4">
          <div className="flex flex-col gap-4">
            <div className="flex gap-4 flex-1">
              {/* Avatar */}
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-blue-50 text-muted-foreground text-lg font-medium">
                  {patient.profile.firstName.charAt(0)}
                  {patient.profile.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>

              {/* Patient Details */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-4">
                  <h4 className="text-xl font-semibold text-foreground">
                    {patient.profile.firstName} {patient.profile.lastName}
                  </h4>
                  {approval.patientExtras.isVip && <Badge variant="accent">VIP</Badge>}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="text-sm font-semibold text-muted-foreground">
                    {approval.patientId}
                  </div>
                  <span>|</span>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{approval.patientExtras.phone}</span>
                    <span>|</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{approval.patientExtras.email}</span>
                  </div>
                </div>
              </div>

              {/* Communication Method Toggle */}
              <CommunicationToggle
                activeMethod={activeCommMethod}
                onMethodChange={setActiveCommMethod}
                className="h-fit"
              />
            </div>

            {/* Message */}
            {isEditingMessage ? (
              <div className="flex-1 border border-ui-border rounded-lg p-4 space-y-3">
                {isGenerating ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ) : (
                  <textarea
                    ref={textareaRef}
                    value={editedMessage}
                    onChange={(e) => setEditedMessage(e.target.value)}
                    className="w-full min-h-30 resize-none border-none outline-none text-foreground leading-relaxed bg-transparent"
                    placeholder="Enter your message..."
                  />
                )}
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                    className="h-8"
                    disabled={isGenerating}
                  >
                    <X className="w-3 h-3 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSaveMessage}
                    className="h-8"
                    disabled={isGenerating}
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className={`flex-1 border border-ui-border rounded-lg p-4 transition-colors ${
                  isGenerating ? "" : "cursor-pointer hover:bg-gray-50 group"
                }`}
                onClick={!isGenerating ? handleMessageClick : undefined}
              >
                {isGenerating ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ) : (
                  <>
                    <p className="text-foreground leading-relaxed group-hover:text-gray-700">
                      {approval.message}
                    </p>
                    <div className="mt-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to edit message
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Attach Files Button */}
            {/* <Button variant="secondary" size="sm" className="w-fit">
              <Paperclip className="w-4 h-4 mr-2" />
              Attach Files
            </Button> */}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <div className="bg-gradient-to-r from-gradient-dark-start to-gradient-dark-end p-px rounded-lg">
              <Button
                variant="gradient-light"
                size="default"
                className="border-0"
                onClick={handleGenerateWithTera}
                disabled={isGenerating}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isGenerating ? "Generating..." : "Generate with Tera"}
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="danger-light"
                onClick={() => handleApproval("declined")}
                size="default"
                disabled={isGenerating}
              >
                <ThumbsDown className="w-4 h-4 mr-2" />
                Decline
              </Button>
              <Button
                variant="success-light"
                onClick={() => handleApproval("approved")}
                size="default"
                className="min-w-46"
                disabled={isGenerating}
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
