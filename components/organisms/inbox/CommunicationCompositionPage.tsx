"use client";

import { Button, GradientIcon, Input, SVG_MASKS } from "@/components/atoms";
import { Badge } from "@/components/atoms/Badge";
import { PatientOverview } from "@/components/organisms/approvals/PatientOverview";
import { getLoggedInUserFirstName } from "@/utils/provider.utils";
import { ArrowLeft, Mail, MessageSquare, SendHorizonal, Wand2 } from "lucide-react";
import { useState } from "react";

interface CommunicationCompositionPageProps {
  patientId: string;
  patientName: string;
  recipientEmail: string;
  recipientPhone: string;
  initialChannel?: "SMS" | "EMAIL";
  onBack: () => void;
  onSend?: (channel: "SMS" | "EMAIL", subject: string, message: string) => void;
  isLoading?: boolean;
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
  isGeneratingAI?: boolean;
}

export function CommunicationCompositionPage({
  patientId,
  patientName,
  recipientEmail,
  recipientPhone,
  initialChannel = "SMS",
  onBack,
  onSend,
  isLoading = false,
  onGenerateAIMessage,
  isGeneratingAI = false,
}: CommunicationCompositionPageProps) {
  const [selectedChannel, setSelectedChannel] = useState<"SMS" | "EMAIL">(initialChannel);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (onSend) {
      onSend(selectedChannel, subject, message);
    }
  };

  const handleGenerateAI = async () => {
    if (!onGenerateAIMessage) return;

    await onGenerateAIMessage(
      {
        patientId,
        patientName,
        channel: selectedChannel,
      },
      {
        onMessageGenerated: setMessage,
        onSubjectGenerated: setSubject,
      },
    );
  };

  const canSend =
    message.trim() &&
    (selectedChannel === "SMS" || (selectedChannel === "EMAIL" && subject.trim())) &&
    !isLoading &&
    !isGeneratingAI;

  const formatPhone = (phone: string) => {
    // Remove +1 and format as needed
    const cleaned = phone.replace(/^\+1/, "");
    if (cleaned.length === 10) {
      return `+1 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  return (
    <div className="h-full bg-gray-50 flex">
      {/* Main Content */}
      <div className="flex flex-1 h-full">
        {/* Left Panel - Communication Composition */}
        <div className="flex-1 bg-white flex flex-col shadow-sm">
          {/* Communication Header */}
          <div className="p-4 pb-0">
            {/* Back Button and Title */}
            <div className="flex items-center gap-2 mb-4">
              <Button variant="ghost" size="icon" onClick={onBack} className="w-10 h-10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">
                New {selectedChannel === "EMAIL" ? "Mail" : "Message"} to {patientName}
              </h1>
              <Badge
                className={
                  selectedChannel === "EMAIL"
                    ? "bg-yellow-50 text-yellow-600 border-yellow-200"
                    : "bg-cyan-50 text-cyan-600 border-cyan-200"
                }
              >
                {selectedChannel === "EMAIL" ? (
                  <>
                    <Mail className="w-3 h-3 mr-1" />
                    Email
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-3 h-3 mr-1" />
                    SMS
                  </>
                )}
              </Badge>
            </div>
          </div>

          {/* Message Composition Area */}
          <div className="flex-1 w-full p-4 flex items-center flex-col bg-subtle bg-opacity-60">
            <div className="flex-1 w-150 p-4 flex flex-col bg-white max-h-132">
              <div className="mb-3 flex gap-2 items-center">
                <h2 className="text-base font-medium text-gray-900">
                  {getLoggedInUserFirstName()} to {patientName}
                </h2>
                <p className="text-xs text-gray-500">
                  {selectedChannel === "EMAIL" ? recipientEmail : formatPhone(recipientPhone)}
                </p>
              </div>
              {/* Subject Field - Only for Email */}
              {selectedChannel === "EMAIL" && (
                <div className="mb-3">
                  <Input
                    placeholder="Subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="border-gray-200 bg-white rounded-lg h-10"
                  />
                </div>
              )}
              <div className="flex-1 flex flex-col border border-gray-200 rounded-lg">
                <textarea
                  placeholder={
                    selectedChannel === "EMAIL" ? "Write your email..." : "Write your message..."
                  }
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 w-full p-2.5 rounded-lg resize-none border-none outline-none text-text placeholder-gray-400 bg-transparent text-base leading-relaxed min-h-[200px]"
                />

                {/* Action Buttons */}
                <div className="flex justify-between items-center mt-4 p-2.5">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleGenerateAI}
                      disabled={isGeneratingAI}
                      className="rounded-lg hover:bg-gray-200 text-gray-700 h-9 p-2 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGeneratingAI ? (
                        <div className="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <GradientIcon icon={Wand2} size="w-4 h-4" svgMask={SVG_MASKS.WAND2} />
                      )}
                    </Button>
                  </div>

                  <Button
                    variant="flat-transparent"
                    onClick={handleSend}
                    disabled={!canSend}
                    className="bg-transparent text-brand-blue h-9 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <SendHorizonal className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Patient Details */}
        <div className="w-[350px] bg-white border border-gray-200 shadow-sm overflow-hidden">
          <PatientOverview patientId={patientId} showHeader={true} className="h-full" />
        </div>
      </div>
    </div>
  );
}
