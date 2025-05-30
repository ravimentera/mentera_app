import { Avatar, AvatarFallback, Badge, Button } from "@/components/atoms";
import { ApprovalItem } from "@/mock/approvals.data";
import { Mail, Paperclip, Phone, Sparkles, ThumbsDown, ThumbsUp } from "lucide-react";

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
            </div>

            {/* Message */}
            <div className="flex-1 border border-ui-border rounded-lg p-4">
              <p className="text-foreground leading-relaxed">{approval.message}</p>
            </div>

            {/* Attach Files Button */}
            <Button variant="secondary" size="sm" className="w-fit">
              <Paperclip className="w-4 h-4 mr-2" />
              Attach Files
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <div className="bg-gradient-to-r from-brand-purple-hover to-brand-purple-darkest p-[1px] rounded-lg">
              <Button variant="gradient-light" size="default" className="border-0">
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
