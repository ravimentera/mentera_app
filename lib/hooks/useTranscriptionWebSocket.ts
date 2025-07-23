import { useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

import { useAppDispatch } from "@/lib/store/hooks";
import {
  appendTranscription,
  setConnectionStatus,
  setError,
  setFinalTranscript,
  setRecordingState,
  setSessionId,
} from "@/lib/store/slices/transcriptionSlice";

interface UseTranscriptionWebSocketProps {
  onSessionCreated?: (sessionId: string) => void;
  onRecordingComplete?: () => void;
}

export function useTranscriptionWebSocket({
  onSessionCreated,
  onRecordingComplete,
}: UseTranscriptionWebSocketProps = {}) {
  const dispatch = useAppDispatch();

  // WebSocket and audio references
  const audioWsRef = useRef<WebSocket | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const inputRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isCleaningUpRef = useRef<boolean>(false);

  // Convert Float32 PCM to Int16 PCM
  const convertFloat32ToInt16 = useCallback((float32Array: Float32Array): Int16Array => {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return int16Array;
  }, []);

  // Initialize audio recording
  const initializeAudioRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 48000,
          channelCount: 2,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      streamRef.current = stream;
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 48000,
      });
      audioContextRef.current = audioContext;
      const input = audioContext.createMediaStreamSource(stream);
      inputRef.current = input;
      const processor = audioContext.createScriptProcessor(4096, 2, 2);
      processorRef.current = processor;

      input.connect(processor);
      processor.connect(audioContext.destination);

      processor.onaudioprocess = (e) => {
        if (!audioWsRef.current || audioWsRef.current.readyState !== WebSocket.OPEN) return;

        // Get stereo audio data and convert to mono
        const leftChannel = e.inputBuffer.getChannelData(0);
        const rightChannel = e.inputBuffer.getChannelData(1);
        const monoPCM = new Float32Array(leftChannel.length);

        for (let i = 0; i < leftChannel.length; i++) {
          monoPCM[i] = (leftChannel[i] + rightChannel[i]) / 2;
        }

        // Convert to Int16 and send as base64
        const int16Buffer = convertFloat32ToInt16(monoPCM);
        const uint8Array = new Uint8Array(int16Buffer.buffer);
        const binaryString = Array.from(uint8Array, (byte) => String.fromCharCode(byte)).join("");
        const base64Audio = btoa(binaryString);

        if (sessionIdRef.current) {
          const audioMsg = {
            type: "audio_data",
            sessionId: sessionIdRef.current,
            data: { data: base64Audio },
            timestamp: new Date().toISOString(),
            messageId: uuidv4(),
          };
          audioWsRef.current.send(JSON.stringify(audioMsg));
        }
      };

      dispatch(setRecordingState(true));
    } catch (error) {
      console.error("Failed to initialize audio recording:", error);
      dispatch(setError("Failed to access microphone"));
    }
  }, [dispatch, convertFloat32ToInt16]);

  // Connect to WebSocket
  const connectWebSocket = useCallback(
    async (transcriptionEndpoint: string, newSessionId: string) => {
      dispatch(setConnectionStatus("connecting"));
      dispatch(setSessionId(newSessionId));
      sessionIdRef.current = newSessionId;
      isCleaningUpRef.current = false;

      if (onSessionCreated) {
        onSessionCreated(newSessionId);
      }

      try {
        // Extract token from transcriptionEndpoint and build WebSocket URL
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://34.204.48.222:5004";
        const wsBaseUrl = apiBaseUrl.replace(/^http/, "ws");
        const wsUrl = `${wsBaseUrl}${transcriptionEndpoint}`;

        console.log("Connecting to WebSocket:", wsUrl);

        const ws = new WebSocket(wsUrl);
        audioWsRef.current = ws;
        ws.binaryType = "arraybuffer";

        ws.onopen = () => {
          console.log("WebSocket connection opened");
          dispatch(setConnectionStatus("connected"));
          dispatch(setError(null));
        };

        ws.onmessage = async (event) => {
          try {
            const msg = JSON.parse(event.data);
            console.log("WebSocket message received:", msg);

            if (msg.type === "status_update" && msg.data.status === "connected") {
              console.log("WebSocket connected, associating session and starting audio...");

              // Associate session
              const associateMsg = {
                type: "associate_session",
                sessionId: sessionIdRef.current,
                timestamp: new Date().toISOString(),
                messageId: uuidv4(),
              };
              ws.send(JSON.stringify(associateMsg));

              // Start audio recording
              await initializeAudioRecording();
            } else if (msg.type === "session_associated") {
              console.log("Session associated successfully");
            } else if (msg.type === "transcript_partial") {
              console.log("Partial transcript:", msg.data.transcript);
              dispatch(appendTranscription(msg.data.transcript));
            } else if (msg.type === "transcript_complete") {
              console.log("Complete transcript:", msg.data.transcript);
              dispatch(setFinalTranscript(msg.data.transcript));
            } else if (msg.type === "error") {
              console.error("WebSocket error:", msg.data.error);
              dispatch(setError(msg.data.error || "WebSocket error"));
            }
          } catch (e) {
            console.error("Failed to parse WebSocket message:", e);
            dispatch(setError("Failed to parse WebSocket message"));
          }
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          dispatch(setError("WebSocket connection failed"));
          dispatch(setConnectionStatus("error"));
        };

        ws.onclose = (event) => {
          console.log("WebSocket closed:", event.code, event.reason);

          // Only update state if we're not in the middle of cleanup
          if (!isCleaningUpRef.current) {
            dispatch(setConnectionStatus("disconnected"));

            if (!event.wasClean && event.code !== 1000) {
              dispatch(setError(`Connection closed unexpectedly (${event.code})`));
            }
          }
        };
      } catch (error) {
        console.error("Failed to create WebSocket:", error);
        dispatch(setError("Failed to create WebSocket connection"));
        dispatch(setConnectionStatus("error"));
      }
    },
    [dispatch, onSessionCreated, initializeAudioRecording],
  );

  // Stop audio recording
  const stopAudioRecording = useCallback(() => {
    console.log("Stopping audio recording...");
    dispatch(setRecordingState(false));

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current.onaudioprocess = null;
      processorRef.current = null;
    }
    if (inputRef.current) {
      inputRef.current.disconnect();
      inputRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, [dispatch]);

  // Disconnect WebSocket cleanly
  const disconnectWebSocket = useCallback(() => {
    console.log("Disconnecting WebSocket...");
    isCleaningUpRef.current = true;

    if (audioWsRef.current && audioWsRef.current.readyState === WebSocket.OPEN) {
      // Send a close message to the server if needed
      audioWsRef.current.close(1000, "Recording stopped by user");
    }

    // Clean up references
    audioWsRef.current = null;
    sessionIdRef.current = null;

    if (onRecordingComplete) {
      onRecordingComplete();
    }
  }, [onRecordingComplete]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (isCleaningUpRef.current) {
      console.log("Cleanup already in progress, skipping...");
      return;
    }

    console.log("Cleaning up transcription session...");
    isCleaningUpRef.current = true;

    stopAudioRecording();

    if (audioWsRef.current) {
      if (audioWsRef.current.readyState === WebSocket.OPEN) {
        audioWsRef.current.close(1000, "Component unmounted");
      }
      audioWsRef.current = null;
    }

    sessionIdRef.current = null;
  }, [stopAudioRecording]);

  return {
    connectWebSocket,
    stopAudioRecording,
    disconnectWebSocket,
    cleanup,
  };
}
