"use client";

import { Button, Input } from "@/components/atoms";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/molecules";
import {
  useGenerateAutomatedMessageMutation,
  useGetPatientDetailsQuery,
  useGetPatientsByProviderQuery,
} from "@/lib/store/api";
import { useAppSelector } from "@/lib/store/hooks";
import { selectUser } from "@/lib/store/slices/authSlice";
import { getLoggedInUserProviderId } from "@/utils/provider.utils";
import { Mail, MessageSquare, Phone, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue?: (selectedPatient: string, conversationId?: string) => void;
  onCommunicationCompose?: (
    patientId: string,
    patientName: string,
    email: string,
    phone: string,
    channel: "SMS" | "EMAIL",
  ) => void;
}

// Format phone number helper
const formatPhone = (phone: string) => {
  // Remove +1 and format as needed
  const cleaned = phone.replace(/^\+1/, "");
  if (cleaned.length === 10) {
    return `+1 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

export function NewConversationDialog({
  open,
  onOpenChange,
  onContinue,
  onCommunicationCompose,
}: NewConversationDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<"SMS" | "EMAIL">("SMS");
  const [showPatientList, setShowPatientList] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Get current user from auth state
  const user = useAppSelector(selectUser);
  const providerId = user?.providerId || getLoggedInUserProviderId(); // Fallback to logged-in user

  // API calls
  const { data: patients = [], isLoading, error } = useGetPatientsByProviderQuery(providerId);
  const {
    data: patientDetails,
    isLoading: isLoadingDetails,
    error: detailsError,
  } = useGetPatientDetailsQuery(selectedPatient, { skip: !selectedPatient });
  const [generateAutomatedMessage, { isLoading: isGenerating }] =
    useGenerateAutomatedMessageMutation();

  // Get detailed patient information with preferences
  const detailedPatientData = useMemo(() => {
    return patientDetails?.data;
  }, [patientDetails]);

  // Update selected channel based on patient's preferred communication channel
  useEffect(() => {
    if (detailedPatientData?.preferredChannels?.communication) {
      const preferredChannel = detailedPatientData.preferredChannels.communication;
      if (preferredChannel === "SMS" || preferredChannel === "EMAIL") {
        setSelectedChannel(preferredChannel);
      }
    }
  }, [detailedPatientData?.preferredChannels?.communication]);

  // Handle click outside to close patient list
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowPatientList(false);
      }
    };

    if (showPatientList) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPatientList]);

  const handleCancel = () => {
    setSearchQuery("");
    setSelectedPatient("");
    setShowPatientList(false);
    onOpenChange(false);
  };

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setSelectedPatient("");
      setShowPatientList(false);
    }
  }, [open]);

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatient(patientId);
    setShowPatientList(false);
    setSearchQuery("");
  };

  const handleContinue = async () => {
    if (!selectedPatient) return;

    const selectedPatientData = patients.find((patient) => patient.patientId === selectedPatient);
    if (!selectedPatientData) return;

    // If EMAIL or SMS channel is selected, navigate to communication composition page
    if (onCommunicationCompose) {
      const patientName = `${selectedPatientData.firstName} ${selectedPatientData.lastName}`;
      onCommunicationCompose(
        selectedPatient,
        patientName,
        selectedPatientData.email,
        selectedPatientData.phone,
        selectedChannel,
      );
      handleCancel(); // Close dialog
      return;
    }

    try {
      // Generate automated conversation message for SMS
      const conversationRequest = {
        patientId: selectedPatient,
        providerId: providerId,
        eventType: "GENERAL_COMMUNICATION",
        channel: selectedChannel,
        priority: "MEDIUM" as const,
      };

      const result = await generateAutomatedMessage(conversationRequest).unwrap();

      toast.success("Conversation started successfully!");

      if (onContinue) {
        onContinue(selectedPatient, result.data.messageId);
      }

      handleCancel(); // Close and reset
    } catch (error) {
      console.error("Failed to generate conversation:", error);
      toast.error("Failed to generate conversation. Please try again.");
    }
  };

  // Filter patients based on search query
  const filteredPatients = useMemo(() => {
    if (!searchQuery) return patients; // Show all patients when no search query

    const query = searchQuery.toLowerCase();
    return patients.filter((patient) => {
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
      return (
        fullName.includes(query) ||
        patient.phone.includes(query) ||
        patient.email.toLowerCase().includes(query) ||
        patient.patientId.toLowerCase().includes(query)
      );
    });
  }, [patients, searchQuery]);

  // Get selected patient details from basic list
  const selectedPatientData = useMemo(() => {
    return patients.find((patient) => patient.patientId === selectedPatient);
  }, [patients, selectedPatient]);

  // Generate patient initials for avatar
  const getPatientInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`sm:max-w-lg border border-gray-200 shadow-xl rounded-xl p-6 flex flex-col justify-start ${
          showPatientList ? "min-h-[500px]" : ""
        }`}
        hideCloseButton
      >
        <DialogHeader className="relative" hideCloseButton>
          <DialogTitle className="text-lg font-semibold text-left text-gray-900">
            Create New Conversation
          </DialogTitle>
          <DialogDescription className="sr-only">
            {selectedPatientData
              ? "Configure conversation settings"
              : "Select a patient to create a new conversation"}
          </DialogDescription>
          <button
            type="button"
            onClick={handleCancel}
            className="absolute -top-2 -right-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </DialogHeader>

        <div className="py-4 flex-1 flex flex-col justify-start">
          {/* Select Patient Section - Always Visible */}
          <div className="space-y-3 mb-6">
            <label htmlFor="patient-search" className="text-base font-semibold text-gray-900">
              Select Patient
            </label>

            <div className="relative" ref={searchContainerRef}>
              <div className="relative flex items-center">
                <Input
                  id="patient-search"
                  placeholder="Search patient by name or phone…"
                  value={
                    selectedPatientData && !showPatientList
                      ? `${selectedPatientData.firstName} ${selectedPatientData.lastName}`
                      : searchQuery
                  }
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchQuery(e.target.value)
                  }
                  onFocus={() => {
                    setShowPatientList(true);
                    if (selectedPatientData) {
                      setSearchQuery("");
                    }
                  }}
                  className="pl-10 py-2 border-gray-300 h-10 bg-white rounded-lg"
                />
                <div className="absolute left-3 pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Patient List Overlay */}
              {showPatientList && (
                <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  {isLoading ? (
                    <div className="p-4 text-center text-gray-500">Loading patients...</div>
                  ) : error ? (
                    <div className="p-4 text-center text-red-500">Error loading patients</div>
                  ) : filteredPatients.length > 0 ? (
                    filteredPatients.map((patient, index) => (
                      <div
                        key={patient.patientId}
                        className="border-b border-gray-100 last:border-b-0"
                      >
                        <button
                          type="button"
                          className="w-full text-left p-3 hover:bg-gray-50 transition-colors"
                          onClick={() => handlePatientSelect(patient.patientId)}
                        >
                          <div className="space-y-1">
                            <div className="font-normal text-sm text-gray-900">
                              {patient.firstName} {patient.lastName}
                            </div>
                            <div className="flex flex-wrap items-center gap-1 text-xs text-gray-500">
                              <span className="whitespace-nowrap">{patient.patientId}</span>
                              <span>|</span>
                              <span className="whitespace-nowrap">
                                {formatPhone(patient.phone)}
                              </span>
                              <span>|</span>
                              <span className="break-all min-w-0">{patient.email}</span>
                            </div>
                          </div>
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      {searchQuery
                        ? "No patients found matching your search"
                        : "No patients available"}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Patient Details - Shown when patient is selected */}
          {selectedPatientData && (
            <div className="space-y-6 flex-1">
              {/* Patient Info */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                  <span className="text-lg font-medium text-gray-700">
                    {getPatientInitials(
                      selectedPatientData.firstName,
                      selectedPatientData.lastName,
                    )}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {selectedPatientData.firstName} {selectedPatientData.lastName}
                    </h3>
                    {/* VIP Badge - shown conditionally based on tags or status */}
                    {selectedPatientData.tags?.includes("VIP") && (
                      <span className="bg-blue-50 text-blue-600 text-sm font-medium px-2 py-1 rounded">
                        VIP
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                    <span className="whitespace-nowrap">{selectedPatientData.patientId}</span>
                    <span>|</span>
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <Phone className="w-3 h-3" />
                      <span>{formatPhone(selectedPatientData.phone)}</span>
                    </div>
                    <span>|</span>
                    <div className="flex items-center gap-1 min-w-0">
                      <Mail className="w-3 h-3 flex-shrink-0" />
                      <span className="break-all">{selectedPatientData.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Communication Preferences - Loading State */}
              {isLoadingDetails ? (
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </div>
              ) : detailsError ? (
                <div className="text-red-500 text-sm">Error loading patient preferences</div>
              ) : detailedPatientData?.preferredChannels ? (
                /* Show preferred channels if available */
                <div className="space-y-2">
                  {detailedPatientData.preferredChannels.communication && (
                    <p className="text-base text-gray-900">
                      Preferred Communication channel :{" "}
                      {detailedPatientData.preferredChannels.communication}
                    </p>
                  )}
                  {detailedPatientData.preferredChannels.marketing && (
                    <p className="text-base text-gray-900">
                      Preferred Marketing channel :{" "}
                      {detailedPatientData.preferredChannels.marketing}
                    </p>
                  )}
                </div>
              ) : (
                /* Fallback to default display */
                <div className="space-y-2">
                  <p className="text-base text-gray-900">Preferred Communication channel : SMS</p>
                  <p className="text-base text-gray-900">Preferred Marketing channel : Email</p>
                </div>
              )}

              <hr className="border-gray-200" />

              {/* Channel Selector */}
              <div className="space-y-2">
                <span className="text-base font-semibold text-gray-900">Select Channel</span>
                <div className="bg-gray-50 rounded-lg p-1 flex gap-2 w-fit">
                  <button
                    type="button"
                    onClick={() => setSelectedChannel("SMS")}
                    className={`flex items-center gap-2 px-3 py-1 rounded text-sm font-medium transition-colors ${
                      selectedChannel === "SMS"
                        ? "bg-blue-50 text-brand-blue shadow-sm border border-brand-blue"
                        : "text-gray-600 border border-transparent"
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    SMS
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedChannel("EMAIL")}
                    className={`flex items-center gap-2 px-3 py-1 rounded text-sm font-medium transition-colors ${
                      selectedChannel === "EMAIL"
                        ? "bg-blue-50 text-brand-blue border border-brand-blue"
                        : "text-gray-600 border border-transparent"
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-end gap-2.5 mt-auto pt-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isGenerating}
            className="bg-gray-100 text-gray-900 border-0 rounded-lg h-9 px-4"
          >
            Cancel
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!selectedPatientData || isGenerating}
            className={`bg-blue-800 text-white rounded-lg h-9 px-4 ${!selectedPatientData || isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isGenerating ? "Generating..." : "Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
