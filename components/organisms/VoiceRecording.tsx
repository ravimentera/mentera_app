"use client";

import { VoiceVisualizer, useVoiceVisualizer } from "@hasma/react-voice-visualizer";
import { Copy, Pause, Play, Square } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/atoms";

interface VoiceRecordingProps {
  onClose: () => void;
  onSave?: (transcription: string) => void;
  onRecordingStateChange?: (isRecording: boolean) => void;
  onRecordingComplete?: () => void;
}

export function VoiceRecording({
  onClose,
  onSave,
  onRecordingStateChange,
  onRecordingComplete,
}: VoiceRecordingProps) {
  const [recordingNumber] = useState(12);
  const [transcription, setTranscription] = useState(
    "Patient reports experiencing mild discomfort in the lower back area for the past three days. Pain is described as a dull ache that worsens with prolonged sitting. No radiation to the legs. Patient denies any recent trauma or injury. Sleep has been slightly affected due to positioning difficulties.\n\nPhysical examination reveals tenderness in the lumbar region with limited range of motion. No neurological deficits noted.",
  );

  // Initialize the voice visualizer with custom callbacks
  const recorderControls = useVoiceVisualizer({
    onStartRecording: () => console.log("Recording started"),
    onStopRecording: () => console.log("Recording stopped"),
    onPausedRecording: () => console.log("Recording paused"),
    onResumedRecording: () => console.log("Recording resumed"),
  });

  const {
    recordedBlob,
    error,
    formattedRecordingTime,
    isRecordingInProgress,
    isPausedRecording,
    startRecording,
    togglePauseResume,
    stopRecording,
  } = recorderControls;

  // Handle recorded audio blob
  useEffect(() => {
    if (!recordedBlob) return;
    console.log("Recorded blob:", recordedBlob);
  }, [recordedBlob]);

  // Handle errors
  useEffect(() => {
    if (!error) return;
    console.error("Recording error:", error);
  }, [error]);

  // Track recording state changes
  useEffect(() => {
    if (onRecordingStateChange) {
      onRecordingStateChange(isRecordingInProgress);
    }
  }, [isRecordingInProgress, onRecordingStateChange]);

  const handleStopRecording = () => {
    stopRecording();
    // Call onRecordingComplete when recording actually stops (not cancelled)
    if (onRecordingComplete) {
      onRecordingComplete();
    }
  };

  const handleCopyTranscription = () => {
    navigator.clipboard.writeText(transcription);
  };

  if (!isRecordingInProgress && !recordedBlob) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="bg-white rounded-2xl p-6 w-96 space-y-4 border border-gray-200 shadow-lg">
          <h3 className="text-lg font-semibold text-center">Start Recording</h3>
          <p className="text-gray-600 text-center">
            Click the button below to begin voice recording
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={startRecording} className="bg-brand-blue hover:bg-brand-blue-dark">
              Start Recording
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="bg-white w-full space-y-6 overflow-hidden">
        {/* Voice Visualization Section - Horizontal Layout */}
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

            {/* Right: Control Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={togglePauseResume}
                className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
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
                className="w-12 h-12 bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center transition-colors"
              >
                <Square className="w-6 h-6 text-red-600" fill="currentColor" />
              </button>
            </div>
          </div>

          {/* Bottom: Recording Info */}
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-medium">{formattedRecordingTime}</span>
            <span className="text-gray-700 font-medium">Recording #{recordingNumber}</span>
          </div>
        </div>

        {/* Real-time Transcription Section */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Real-time Transcription</h3>
            <button
              type="button"
              onClick={handleCopyTranscription}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Copy className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="rounded-lg">
            <p className="text-gray-900 leading-relaxed">{transcription}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
