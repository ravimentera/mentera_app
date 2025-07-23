"use client";

import { Button } from "@/components/atoms";
import { Tabs, TabsList, TabsTrigger } from "@/components/molecules";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  VoiceRecording,
} from "@/components/organisms";
import { PatientOverview } from "@/components/organisms/approvals/PatientOverview";
import {
  useApproveChartMutation,
  useGenerateSOAPMutation,
  useGetChartDetailQuery,
  useGetPatientsByProviderQuery,
  useUpdateChartContentMutation,
} from "@/lib/store/api";
import { useAppSelector } from "@/lib/store/hooks";
import { selectUser } from "@/lib/store/slices/authSlice";
import { Copy, Edit, Mail, Mic, Phone, RefreshCcw, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChartContentEditor } from "./ChartContentEditor";

interface ChartDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chartId?: string;
  patientId?: string;
}

export function ChartDetailDrawer({
  open,
  onOpenChange,
  chartId,
  patientId,
}: ChartDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<"prechart" | "postchart">("prechart");
  const [isEditing, setIsEditing] = useState(false);
  const [pendingContent, setPendingContent] = useState<string>("");
  const [showVoiceRecording, setShowVoiceRecording] = useState(false);
  const [isRecordingInProgress, setIsRecordingInProgress] = useState(false);
  const [hasCompletedRecording, setHasCompletedRecording] = useState(false);
  const [transcriptionSessionId, setTranscriptionSessionId] = useState<string | null>(null);

  // Reset editing state when drawer closes
  useEffect(() => {
    if (!open) {
      console.log("Resetting isEditing due to drawer close");
      setIsEditing(false);
      setPendingContent("");
      // Reset recording states when drawer closes
      setShowVoiceRecording(false);
      setIsRecordingInProgress(false);
      setHasCompletedRecording(false);
      setTranscriptionSessionId(null);
    }
  }, [open]);

  // Reset editing state when switching between charts
  useEffect(() => {
    if (chartId) {
      console.log("chartId changed, resetting isEditing state:", chartId);
      setIsEditing(false);
      setPendingContent("");
    }
  }, [chartId]);

  // Get current user from auth state
  const user = useAppSelector(selectUser);
  const providerId = user?.providerId || "PR-2001";

  // API calls
  const {
    data: chart,
    isLoading: isLoadingChart,
    error: chartError,
  } = useGetChartDetailQuery(chartId || "", {
    skip: !chartId || !open,
  });

  const { data: patients = [] } = useGetPatientsByProviderQuery(providerId);

  // Add the update mutation
  const [updateChartContent, { isLoading: isSaving }] = useUpdateChartContentMutation();

  // Add the approve mutation
  const [approveChart, { isLoading: isApproving }] = useApproveChartMutation();

  // Add the generate SOAP mutation
  const [generateSOAP, { isLoading: isGeneratingSOAP }] = useGenerateSOAPMutation();

  // Find patient data
  const patient = patients.find((p) => p.patientId === (patientId || chart?.patientId));

  const handleCopySection = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Content copied to clipboard");
  };

  const handleApprove = async () => {
    if (!chartId) {
      toast.error("No chart selected for approval");
      return;
    }

    try {
      console.log("Approving chart:", chartId);

      // Call the API to approve the chart
      await approveChart({
        chartId,
        approved: true,
      }).unwrap();

      toast.success("Chart approved successfully");

      // Close the drawer after successful approval
      onOpenChange(false);
    } catch (error: any) {
      console.error("Failed to approve chart:", error);
      toast.error(error?.data?.message || "Failed to approve chart. Please try again.");
    }
  };

  const handleRegenerate = () => {
    toast.success("Chart regeneration started");
  };

  const handleContentSave = async (content: string) => {
    if (!chartId) {
      toast.error("No chart selected for saving");
      return;
    }

    try {
      console.log("Saving content to API:", content);
      console.log("Setting isEditing to false from handleContentSave");

      // Call the API to update chart content
      await updateChartContent({
        chartId,
        content,
      }).unwrap();

      toast.success("Chart content saved successfully");
      setIsEditing(false);
    } catch (error: any) {
      console.error("Failed to save chart content:", error);
      toast.error(error?.data?.message || "Failed to save chart content. Please try again.");
    }
  };

  const handleContentCancel = () => {
    console.log("Setting isEditing to false from handleContentCancel");
    setIsEditing(false);
  };

  const handleContentEdit = () => {
    console.log("Edit button clicked, setting isEditing to true");
    setIsEditing(true);
  };

  const handleFooterSave = () => {
    // Use the pending content from the editor
    console.log("Footer save clicked");
    handleContentSave(pendingContent || chart?.content || "");
  };

  const handleFooterCancel = () => {
    console.log("Footer cancel clicked, setting isEditing to false");
    setPendingContent("");
    setIsEditing(false);
  };

  const handleGenerateSOAP = async () => {
    if (!transcriptionSessionId) {
      toast.error("No transcription session available for SOAP generation");
      return;
    }

    try {
      console.log("Generating SOAP notes for session:", transcriptionSessionId);

      const response = await generateSOAP({
        sessionId: transcriptionSessionId,
        body: {
          templateId: "2736d184-08dc-4c18-8a7d-3487503bd799",
          treatmentId: "cb1aef45-2b3f-44f1-b5d0-9e7f5f6de4e7",
          aiOptions: {
            tone: "professional",
            detail: "brief",
          },
        },
      }).unwrap();

      // Format SOAP sections into chart content
      const soapSections = response.data.soapSections;
      const soapContent = `**SOAP Notes (Generated)**

**Subjective:**
${soapSections.subjective}

**Objective:**
${soapSections.objective}

**Assessment:**
${soapSections.assessment}

**Plan:**
${soapSections.plan}`;

      // Update chart content with SOAP notes
      const newContent = chart?.content ? `${chart.content}\n\n${soapContent}` : soapContent;

      await handleContentSave(newContent);
      toast.success("SOAP notes generated and added to chart!");

      // Reset recording states
      setHasCompletedRecording(false);
      setShowVoiceRecording(false);
      setTranscriptionSessionId(null);
    } catch (error: any) {
      console.error("Failed to generate SOAP notes:", error);
      toast.error(error?.data?.message || "Failed to generate SOAP notes. Please try again.");
    }
  };

  // Parse chart content into SOAP sections
  const parseChartContent = (content: string) => {
    // For now, we'll display the content as is since the API returns a single content field
    // In a real implementation, this would parse structured SOAP data
    return {
      subjective: content,
      objective: "Physical examination findings would go here.",
      assessment: "Clinical assessment would be documented here.",
      plan: "Treatment plan and next steps would be outlined here.",
    };
  };

  const soapSections = chart ? parseChartContent(chart.content) : null;

  // Early return must come AFTER all hooks
  if (!open) return null;

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange} direction="right">
        <DrawerContent size="wide" direction="right">
          {/* Header */}
          <DrawerHeader className="border-b border-gray-200 px-5 py-3">
            <DrawerTitle className="sr-only">
              Chart Details for {patient?.firstName} {patient?.lastName}
            </DrawerTitle>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-lg">
                    {patient?.firstName?.[0]}
                    {patient?.lastName?.[0]}
                  </span>
                </div>

                {/* Patient Info */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {patient?.firstName} {patient?.lastName}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{patient?.patientId}</span>
                    <span>|</span>
                    <Phone className="w-4 h-4" />
                    <span>{patient?.phone}</span>
                    <span>|</span>
                    <Mail className="w-4 h-4" />
                    <span>{patient?.email}</span>
                  </div>
                </div>
              </div>

              <DrawerClose asChild>
                <button type="button" className="text-text">
                  <X className="h-6 w-6" />
                </button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="flex flex-1 overflow-hidden">
            {/* Left Panel - Chart Content */}
            <div className="flex-1 flex flex-col overflow-hidden border-r border-gray-200">
              {/* Chart Tabs */}
              <div className="px-6 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <Tabs
                    value={activeTab}
                    defaultValue="prechart"
                    onValueChange={(value) => setActiveTab(value as "prechart" | "postchart")}
                  >
                    <TabsList className="flex py-1.5 bg-ui-background-subtle">
                      <TabsTrigger
                        value="prechart"
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg border ${
                          activeTab === "prechart"
                            ? "bg-brand-blue-light text-brand-blue border-brand-blue"
                            : "text-text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50"
                        }`}
                      >
                        Pre chart
                      </TabsTrigger>
                      <TabsTrigger
                        value="postchart"
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg border ${
                          activeTab === "postchart"
                            ? "bg-brand-blue-light text-brand-blue border-brand-blue"
                            : "text-text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50"
                        }`}
                      >
                        Post-chart
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="flex items-center gap-2">
                    {!showVoiceRecording && !isEditing && (
                      <button
                        type="button"
                        onClick={handleContentEdit}
                        disabled={isSaving || isApproving}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                      >
                        <Edit className="w-5 h-5 text-gray-600" />
                      </button>
                    )}
                    {!showVoiceRecording && (
                      <button
                        type="button"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Copy
                          className="w-5 h-5 text-gray-600"
                          onClick={() => handleCopySection(chart?.content || "")}
                        />
                      </button>
                    )}
                    {!showVoiceRecording && (
                      <Button
                        size="sm"
                        onClick={() => {
                          console.log("Record button clicked!");
                          setShowVoiceRecording(true);
                          setIsRecordingInProgress(true);
                          setHasCompletedRecording(false); // Reset completed state
                        }}
                      >
                        <Mic className="w-4 h-4 mr-2" />
                        Record
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Chart Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {showVoiceRecording ? (
                  /* Voice Recording Interface replaces the content */
                  <div className="h-full">
                    <VoiceRecording
                      onClose={() => {
                        console.log("VoiceRecording onClose called");
                        setShowVoiceRecording(false);
                        setIsRecordingInProgress(false);
                        // Don't set hasCompletedRecording to true if user just cancels
                      }}
                      onRecordingStateChange={setIsRecordingInProgress}
                      onRecordingComplete={() => {
                        console.log("VoiceRecording onRecordingComplete called");
                        setHasCompletedRecording(true);
                      }}
                      onSessionCreated={setTranscriptionSessionId}
                      patientId={patientId || chart?.patientId || "PT-1001"}
                      chartType={activeTab}
                    />
                  </div>
                ) : isLoadingChart ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">Loading chart...</div>
                  </div>
                ) : chartError ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-red-500">Error loading chart</div>
                  </div>
                ) : chart?.content ? (
                  <>
                    {console.log("Rendering ChartContentEditor with isEditing:", isEditing)}
                    <ChartContentEditor
                      key={`chart-editor-${chartId}`}
                      content={chart.content}
                      isEditing={isEditing}
                      onSave={handleContentSave}
                      onCancel={handleContentCancel}
                      onEdit={handleContentEdit}
                      onContentChange={setPendingContent}
                    />
                  </>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">No chart content available</div>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="border-t border-gray-200 p-6 py-4 bg-white shadow-lg min-h-[68px] flex items-center">
                <div className="flex items-center gap-3">
                  {showVoiceRecording ? (
                    /* Hide all buttons when voice recording interface is active */
                    isRecordingInProgress ? /* Hide buttons during recording */
                    null : hasCompletedRecording ? (
                      /* Show Generate SOAP button only after recording is completed */
                      <Button
                        onClick={handleGenerateSOAP}
                        disabled={isGeneratingSOAP}
                        className="bg-brand-blue hover:bg-brand-blue-dark text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGeneratingSOAP ? "Generating SOAP..." : "Generate SOAP"}
                      </Button>
                    ) : /* No buttons when showing start recording card */
                    null
                  ) : isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleFooterCancel}
                        disabled={isSaving || isApproving}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleFooterSave}
                        disabled={isSaving || isApproving}
                        className="bg-brand-blue hover:bg-brand-blue-dark text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSaving ? "Saving..." : "Save"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={handleApprove}
                        disabled={isApproving}
                        className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isApproving ? "Approving..." : "Approve"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleRegenerate}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Regenerate
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="w-96">
              <PatientOverview
                patientId={patientId || chart?.patientId || ""}
                showHeader={true}
                className="h-full"
              />
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
