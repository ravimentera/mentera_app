"use client";

import { VoiceVisualizer, useVoiceVisualizer } from "@hasma/react-voice-visualizer";
import { Pause, Play, Square } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/atoms";
import { useTranscriptionWebSocket } from "@/lib/hooks/useTranscriptionWebSocket";
import {
  useGenerateSOAPMutation,
  useStartTranscriptionMutation,
  useStopTranscriptionMutation,
} from "@/lib/store/api";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  resetSession,
  resetTranscription,
  selectConnectionStatus,
  selectFinalTranscript,
  selectIsRecording,
  selectSessionId,
  selectTranscription,
  selectTranscriptionError,
} from "@/lib/store/slices/transcriptionSlice";

interface VoiceRecordingProps {
  onClose: () => void;
  onRecordingStateChange?: (isRecording: boolean) => void;
  onRecordingComplete?: () => void;
  onSessionCreated?: (sessionId: string) => void;
  patientId?: string;
  chartType?: "prechart" | "postchart";
}

export function VoiceRecording({
  onClose,
  onRecordingStateChange,
  onRecordingComplete,
  onSessionCreated,
  patientId = "PT-1001",
  chartType = "prechart",
}: VoiceRecordingProps) {
  const [showGenerateSOAP, setShowGenerateSOAP] = useState(false);
  const [isGeneratingSOAP, setIsGeneratingSOAP] = useState(false);
  const [hasStartedTranscription, setHasStartedTranscription] = useState(false);
  const [preservedTranscript, setPreservedTranscript] = useState("");
  const [finalRecordingTime, setFinalRecordingTime] = useState("");
  const [micPermissionError, setMicPermissionError] = useState<string | null>(null);

  const dispatch = useAppDispatch();

  // Get transcription state from store
  const transcription = useAppSelector(selectTranscription);
  const finalTranscript = useAppSelector(selectFinalTranscript);
  const error = useAppSelector(selectTranscriptionError);
  const connectionStatus = useAppSelector(selectConnectionStatus);
  const isRecordingFromStore = useAppSelector(selectIsRecording);
  const sessionId = useAppSelector(selectSessionId);

  // API mutations
  const [startTranscription] = useStartTranscriptionMutation();
  const [stopTranscription] = useStopTranscriptionMutation();
  const [generateSOAP] = useGenerateSOAPMutation();

  // WebSocket hook
  const { connectWebSocket, stopAudioRecording, disconnectWebSocket, cleanup } =
    useTranscriptionWebSocket({
      onSessionCreated,
      onRecordingComplete,
    });

  // Check microphone permissions
  const checkMicrophonePermission = useCallback(async () => {
    try {
      setMicPermissionError(null);

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Microphone access is not supported in this browser");
      }

      // Try to get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Stop the stream immediately as we're just checking permission
      stream.getTracks().forEach((track) => track.stop());

      return true;
    } catch (error: any) {
      console.error("Microphone permission error:", error);

      let errorMessage = "Microphone access is required for voice recording";

      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        errorMessage =
          "Microphone permission denied. Please allow microphone access and try again.";
      } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        errorMessage = "No microphone found. Please connect a microphone and try again.";
      } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
        errorMessage =
          "Microphone is being used by another application. Please close other apps and try again.";
      } else if (error.name === "NotSupportedError") {
        errorMessage = "Microphone access is not supported in this browser.";
      }

      setMicPermissionError(errorMessage);
      return false;
    }
  }, []);

  // Start transcription flow
  const handleStartTranscription = useCallback(async () => {
    console.log("Starting transcription flow...");

    dispatch(resetTranscription());
    setShowGenerateSOAP(false);
    setHasStartedTranscription(true);
    setPreservedTranscript(""); // Clear previous transcript
    setFinalRecordingTime(""); // Clear previous recording time

    try {
      // Step 1: Start session via REST API
      const response = await startTranscription({
        patientId,
        chartType,
      }).unwrap();

      const { sessionId: newSessionId, transcriptionEndpoint } = response.data;

      // Step 2: Connect to WebSocket
      connectWebSocket(transcriptionEndpoint, newSessionId);
    } catch (error: any) {
      console.error("Failed to start transcription:", error);
      setHasStartedTranscription(false);
      dispatch(resetSession());
    }
  }, [dispatch, startTranscription, patientId, chartType, connectWebSocket]);

  // Initialize the voice visualizer
  const recorderControls = useVoiceVisualizer({
    onStartRecording: () => {
      console.log("Voice visualizer onStartRecording triggered");
      // Don't do async operations here - handle in handleStartRecording instead
    },
    onStopRecording: () => {
      console.log("User stopped recording - stopping transcription...");
      // We'll handle this through handleStopRecording function below
    },
    onPausedRecording: () => console.log("Recording paused"),
    onResumedRecording: () => console.log("Recording resumed"),
  });

  const {
    error: visualizerError,
    formattedRecordingTime,
    isRecordingInProgress,
    isPausedRecording,
    startRecording,
    togglePauseResume,
    stopRecording,
  } = recorderControls;

  // Custom start recording handler with permission check
  const handleStartRecording = useCallback(async () => {
    console.log("handleStartRecording called");

    // Check microphone permission first
    const hasPermission = await checkMicrophonePermission();
    if (!hasPermission) {
      console.log("Permission denied, not starting recording");
      return; // Error is shown in UI via micPermissionError state
    }

    console.log("Permission granted, starting voice visualizer");
    // If permission is granted, start the voice visualizer
    startRecording();

    // Then start transcription
    handleStartTranscription();
  }, [checkMicrophonePermission, startRecording, handleStartTranscription]);

  // Stop transcription flow - now we have access to formattedRecordingTime
  const handleStopTranscription = useCallback(async () => {
    console.log("Stopping transcription flow...");

    // Capture final recording time before stopping
    setFinalRecordingTime(formattedRecordingTime);

    // Step 1: Stop audio recording first
    stopAudioRecording();

    // Step 2: Stop transcription session via REST API
    try {
      if (sessionId) {
        const response = await stopTranscription(sessionId).unwrap();
        console.log("Session stopped successfully:", response.data);

        // Show generate SOAP button after successful stop
        setShowGenerateSOAP(true);
      }
    } catch (error) {
      console.error("Error stopping transcription session:", error);
    }

    // Step 3: Disconnect WebSocket cleanly
    disconnectWebSocket();
    setHasStartedTranscription(false);
  }, [
    stopAudioRecording,
    stopTranscription,
    disconnectWebSocket,
    sessionId,
    formattedRecordingTime,
  ]);

  // Generate SOAP note
  const handleGenerateSOAP = useCallback(async () => {
    if (!sessionId) return;

    setIsGeneratingSOAP(true);
    try {
      const response = await generateSOAP({
        sessionId,
        body: {
          templateId: "2736d184-08dc-4c18-8a7d-3487503bd799", // TODO: change to dynamic templateId
          treatmentId: "cb1aef45-2b3f-44f1-b5d0-9e7f5f6de4e7", // TODO: change to dynamic treatmentId
          aiOptions: {
            tone: "professional",
            detail: "brief",
          },
        },
      }).unwrap();

      console.log("SOAP note generated:", response);
      // Parent component will handle fetching the notes
      if (onRecordingComplete) {
        onRecordingComplete();
      }
    } catch (error) {
      console.error("Error generating SOAP note:", error);
    } finally {
      setIsGeneratingSOAP(false);
    }
  }, [sessionId, generateSOAP, onRecordingComplete]);

  // Handle visualizer errors
  useEffect(() => {
    if (visualizerError) {
      console.error("Recording error:", visualizerError);
    }
  }, [visualizerError]);

  // Track recording state changes
  useEffect(() => {
    const isActivelyRecording =
      isRecordingInProgress || isRecordingFromStore || hasStartedTranscription;
    if (onRecordingStateChange) {
      onRecordingStateChange(isActivelyRecording);
    }
  }, [
    isRecordingInProgress,
    isRecordingFromStore,
    hasStartedTranscription,
    onRecordingStateChange,
  ]);

  // Preserve transcript content
  useEffect(() => {
    const currentTranscript = finalTranscript || transcription;
    if (currentTranscript) {
      setPreservedTranscript(currentTranscript);
    }
  }, [finalTranscript, transcription]);

  // Reset preserved transcript when starting new recording
  useEffect(() => {
    if (hasStartedTranscription && !preservedTranscript) {
      setPreservedTranscript("");
    }
  }, [hasStartedTranscription, preservedTranscript]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Only cleanup if there's an active session
      if (hasStartedTranscription && sessionId) {
        console.log("Cleaning up transcription session on unmount");
        cleanup();
        dispatch(resetSession());
      }
    };
  }, [cleanup, dispatch, hasStartedTranscription, sessionId]);

  const handleStopRecording = () => {
    stopRecording();
    // The visualizer's onStopRecording will be called, then we call our handler
    handleStopTranscription();
  };

  const isTranscribing = connectionStatus === "connecting" || connectionStatus === "connected";
  const hasActiveSession = hasStartedTranscription || isTranscribing || sessionId;

  // Initial state - show start recording button
  if (!isRecordingInProgress && !hasActiveSession && !showGenerateSOAP) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="bg-white rounded-2xl p-6 w-96 space-y-4 border border-gray-200 shadow-lg">
          <h3 className="text-lg font-semibold text-center">Start Recording</h3>
          <p className="text-gray-600 text-center">
            Click the button below to begin voice recording and transcription
          </p>

          {/* Microphone Permission Error */}
          {micPermissionError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 text-red-600 mt-0.5">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-red-800 text-sm">Microphone Access Required</div>
                  <div className="text-red-700 text-sm mt-1">{micPermissionError}</div>
                </div>
              </div>

              <div className="bg-red-100 border border-red-200 rounded p-3 text-sm text-red-800">
                <div className="font-medium mb-2">How to enable microphone access:</div>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Look for the microphone icon in your browser&apos;s address bar</li>
                  <li>Click on it and select &quot;Allow&quot; for microphone access</li>
                  <li>Or go to browser Settings → Privacy → Microphone → Allow this site</li>
                  <li>Refresh the page if needed and try again</li>
                </ol>
              </div>
            </div>
          )}

          {/* General API/Connection Error */}
          {error && !micPermissionError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (micPermissionError) {
                  // Clear error and retry permission check
                  setMicPermissionError(null);

                  // Check permission again
                  const hasPermission = await checkMicrophonePermission();
                  if (hasPermission) {
                    // If permission is now granted, start recording
                    handleStartRecording();
                  }
                  // If still no permission, error will be shown again
                } else {
                  // Normal start recording flow
                  handleStartRecording();
                }
              }}
              className="bg-brand-blue hover:bg-brand-blue-dark"
            >
              {micPermissionError ? "Retry" : "Start Recording"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="bg-white w-full space-y-6 overflow-hidden">
        {/* Voice Visualization Section */}
        {(isRecordingInProgress || preservedTranscript) && (
          <div className="rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between gap-6">
              {/* Left: Voice Visualizer */}
              <div className="flex-1">
                <VoiceVisualizer
                  controls={recorderControls}
                  height={80}
                  width="100%"
                  backgroundColor="transparent"
                  mainBarColor="#3b82f6"
                  secondaryBarColor="#93c5fd"
                  speed={2}
                  barWidth={2}
                  gap={1}
                  rounded={3}
                  isControlPanelShown={false}
                  isDownloadAudioButtonShown={false}
                  isDefaultUIShown={false}
                  isProgressIndicatorShown={false}
                  isAudioProcessingTextShown={false}
                />
              </div>

              {/* Right: Control Buttons - Only show when actively recording */}
              {isRecordingInProgress && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={togglePauseResume}
                    disabled={!isRecordingInProgress}
                    className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    {isPausedRecording ? (
                      <Play className="w-6 h-6 text-gray-800" fill="currentColor" />
                    ) : (
                      <Pause className="w-6 h-6 text-gray-800" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleStopRecording}
                    disabled={!isRecordingInProgress && !isTranscribing}
                    className="w-12 h-12 bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    <Square className="w-6 h-6 text-red-600" fill="currentColor" />
                  </button>
                </div>
              )}
            </div>

            {/* Bottom: Recording Info */}
            <div className="flex items-center justify-between mt-4">
              <span className="text-gray-700 font-medium">
                {isRecordingInProgress
                  ? formattedRecordingTime
                  : finalRecordingTime
                    ? `Recording completed (${finalRecordingTime})`
                    : "Recording completed"}
              </span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      connectionStatus === "connected"
                        ? "bg-green-500"
                        : connectionStatus === "connecting"
                          ? "bg-yellow-500"
                          : connectionStatus === "error"
                            ? "bg-red-500"
                            : preservedTranscript
                              ? "bg-gray-500"
                              : "bg-gray-300"
                    }`}
                  />
                  <span className="text-xs text-gray-500 capitalize">
                    {isRecordingInProgress
                      ? connectionStatus
                      : preservedTranscript
                        ? "completed"
                        : "idle"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Real-time Transcription Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {isTranscribing ? "Real-time Transcription" : "Transcription"}
            </h3>
            {/* Show Generate SOAP button when recording is complete */}
            {showGenerateSOAP && finalTranscript && (
              <Button
                onClick={handleGenerateSOAP}
                disabled={isGeneratingSOAP}
                className="bg-brand-blue hover:bg-brand-blue-dark"
              >
                {isGeneratingSOAP ? "Generating..." : "Generate SOAP"}
              </Button>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              <div className="font-medium">Error:</div>
              <div>{error}</div>
            </div>
          )}

          <div className="rounded-lg min-h-[100px] max-h-[300px] overflow-y-auto">
            <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
              {preservedTranscript ||
                (isTranscribing ? "Listening..." : "Start recording to see transcription")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
