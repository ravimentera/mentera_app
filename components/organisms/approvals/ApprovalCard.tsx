import { Avatar, AvatarFallback, Badge, Button } from "@/components/atoms";
import { CommunicationToggle } from "@/components/molecules/CommunicationToggle";
import { ApprovalItem } from "@/mock/approvals.data";
import { Check, Mail, Paperclip, Phone, Sparkles, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Define the patient type based on the structure from patients.data.ts
type Patient = {
  patientId: string;
  profile: {
    firstName: string;
    lastName: string;
    gender: string;
    avatar: {
      large: string;
      medium: string;
      thumbnail: string;
    };
  };
  chartId: string;
  visitDate: string;
  provider: string;
  treatmentNotes: {
    procedure: string;
    areasTreated: string[];
    [key: string]: any; // Allow for flexible additional properties
    observations: string;
    providerRecommendations: string;
  };
  preProcedureCheck: {
    medications: string[];
    consentSigned: boolean;
    allergyCheck: string;
  };
  postProcedureCare: {
    instructionsProvided: boolean;
    followUpRecommended: string;
    productsRecommended: string[];
  };
  nextTreatment: string;
  followUpDate: string;
  alerts: string[];
  providerSpecialty: string;
  treatmentOutcome: string;
};

interface ApprovalCardProps {
  approval: ApprovalItem;
  patient: Patient;
  onApproval: (action: "approved" | "declined") => void;
  className?: string;
}

export function ApprovalCard({ approval, patient, onApproval, className }: ApprovalCardProps) {
  const [activeCommMethod, setActiveCommMethod] = useState<"chat" | "email">("chat");
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [editedMessage, setEditedMessage] = useState(approval.message);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleMessageClick = () => {
    setIsEditingMessage(true);
    setEditedMessage(approval.message);
  };

  const handleSaveMessage = () => {
    // Here you would typically update the approval message in your state/backend
    approval.message = editedMessage;
    setIsEditingMessage(false);
  };

  const handleCancelEdit = () => {
    setEditedMessage(approval.message);
    setIsEditingMessage(false);
  };

  const handleGenerateWithTera = () => {
    // Update the message with Tera generated prefix
    const teraGeneratedMessage = `Tera generated: ${approval.message}`;
    approval.message = teraGeneratedMessage;
    setEditedMessage(teraGeneratedMessage);

    // If currently editing, keep it in edit mode with the new message
    if (isEditingMessage) {
      // The message is already updated in editedMessage state
    } else {
      // Force a re-render by updating the component state
      setEditedMessage(teraGeneratedMessage);
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
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-foreground">
              Follow up on recent {approval.appointmentDetails?.procedure || "treatment"}.
            </h3>
            <div className="flex items-center gap-4">
              <Badge variant="success">{approval.type}</Badge>
              <span className="text-sm text-muted-foreground">
                {approval.timestamp
                  ? new Date(approval.timestamp).toLocaleString()
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
                <div className="text-sm font-semibold text-muted-foreground">
                  {approval.patientId}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                <textarea
                  ref={textareaRef}
                  value={editedMessage}
                  onChange={(e) => setEditedMessage(e.target.value)}
                  className="w-full min-h-[120px] resize-none border-none outline-none text-foreground leading-relaxed bg-transparent"
                  placeholder="Enter your message..."
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={handleCancelEdit} className="h-8">
                    <X className="w-3 h-3 mr-1" />
                    Cancel
                  </Button>
                  <Button variant="default" size="sm" onClick={handleSaveMessage} className="h-8">
                    <Check className="w-3 h-3 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className="flex-1 border border-ui-border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors group"
                onClick={handleMessageClick}
              >
                <p className="text-foreground leading-relaxed group-hover:text-gray-700">
                  {approval.message}
                </p>
                <div className="mt-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to edit message
                </div>
              </div>
            )}

            {/* Attach Files Button */}
            <Button variant="secondary" size="sm" className="w-fit">
              <Paperclip className="w-4 h-4 mr-2" />
              Attach Files
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <div className="bg-gradient-to-r from-brand-purple-hover to-brand-purple-darkest p-[1px] rounded-lg">
              <Button
                variant="gradient-light"
                size="default"
                className="border-0"
                onClick={handleGenerateWithTera}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate with Tera
              </Button>
            </div>

            <div className="flex gap-2">
              <Button variant="danger-light" onClick={() => onApproval("declined")} size="default">
                <ThumbsDown className="w-4 h-4 mr-2" />
                Decline
              </Button>
              <Button
                variant="success-light"
                onClick={() => onApproval("approved")}
                size="default"
                className="min-w-[184px]"
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                Approve & Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
