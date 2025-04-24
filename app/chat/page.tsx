"use client";

import { Button, Input, Label } from "@/components/atoms";
import { Toggle } from "@/components/molecules";
import { getWebSocketUrl } from "@/lib/getWebSocketUrl";
import { clsx } from "clsx";
import { useFormik } from "formik";
import WebSocket from "isomorphic-ws";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { v4 as uuid } from "uuid";
import { ChatMessage, Patient, WebSocketResponseMessage } from "./types";

import "./chat-markdown.css"; // adjust path if needed

const testMedSpa = {
  medspaId: "MS-1001",
  name: "Destination Aesthetics",
  location: "San Francisco",
};

const testNurse = {
  id: "NR-2001",
  email: "rachel.garcia@medspa.com",
  role: "PROVIDER",
  firstName: "Rachel",
  lastName: "Garcia",
  specialties: ["Botox", "Dermal Fillers"],
  medspaId: testMedSpa.medspaId,
};

const patientDatabase: Record<string, Patient> = {
  "PT-1003": {
    id: "PT-1003",
    chartId: "CH-5003",
    treatmentNotes: {
      procedure: "Laser Hair Removal",
      areasTreated: ["Underarms"],
      unitsUsed: null,
      sessionNumber: 3,
      observations:
        "No adverse reactions. Patient reported 80% reduction in hair growth, high satisfaction with results.",
      providerRecommendations:
        "Continue with remaining sessions as planned; assess after session 5 for potential maintenance treatments.",
    },
    preProcedureCheck: {
      medications: ["None"],
      consentSigned: true,
      allergyCheck: "Latex allergy confirmed, precautions taken",
    },
    postProcedureCare: {
      instructionsProvided: true,
      followUpRecommended: "2025-03-27",
      productsRecommended: ["Aloe Vera Gel"],
    },
    nextTreatment: "Laser Hair Removal session 4",
    followUpDate: "2025-03-27",
    alerts: ["Latex allergy"],
    medspaId: testMedSpa.medspaId,
    providerSpecialty: "Laser Hair Removal",
    treatmentOutcome: "Positive",
  },
  "PT-1004": {
    id: "PT-1004",
    chartId: "CH-5004",
    treatmentNotes: {
      procedure: "Chemical Peel",
      areasTreated: ["Face"],
      unitsUsed: null,
      sessionNumber: 2,
      observations:
        "Mild redness post-procedure. Patient showing good progress with acne scarring reduction.",
      providerRecommendations: "Continue series of 6 treatments as planned.",
    },
    preProcedureCheck: {
      medications: ["Tretinoin - discontinued 1 week prior"],
      consentSigned: true,
      allergyCheck: "No known allergies",
    },
    postProcedureCare: {
      instructionsProvided: true,
      followUpRecommended: "2025-04-15",
      productsRecommended: ["Gentle Cleanser", "SPF 50"],
    },
    nextTreatment: "Chemical Peel session 3",
    followUpDate: "2025-04-15",
    alerts: ["Avoid sun exposure"],
    medspaId: testMedSpa.medspaId,
    providerSpecialty: "Chemical Peels",
    treatmentOutcome: "Positive",
  },
};

function sanitizeMarkdown(content: string): string {
  return (
    content
      .trim()
      // Collapse 3+ line breaks → 2
      .replace(/\n{3,}/g, "\n\n")

      // Remove trailing spaces from each line
      .split("\n")
      .map((line) => line.trimEnd())
      .join("\n")

      // Remove blank lines between list items (bullet spacing)
      .replace(/-\s+(.+)\n\s*\n(?=-\s)/g, "- $1\n") // removes single blank lines between `- item` list

      // Optional: normalize multiple blank lines after lists
      .replace(/(\n\s*[-*]\s[^\n]+)+\n{2,}/g, (match) => match.trimEnd() + "\n\n")
  );
}

export default function ChatClient() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamBuffer, setStreamBuffer] = useState<string>("");
  const [connected, setConnected] = useState<boolean>(false);
  const [currentPatientId, setCurrentPatientId] = useState<keyof typeof patientDatabase>("PT-1003");
  const [isPatientContextEnabled, setIsPatientContextEnabled] = useState<boolean>(true);
  const [forceFresh, setForceFresh] = useState<boolean>(false);
  const [cacheDebug, setCacheDebug] = useState<boolean>(false);
  const socketRef = useRef<WebSocket | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const conversationId = useRef<string>(`conv_${Date.now()}`);

  const formik = useFormik({
    initialValues: { message: "" },
    onSubmit: ({ message }, { resetForm }) => {
      if (!connected || !socketRef.current) return;

      const patient = patientDatabase[currentPatientId];
      setMessages((prev) => [...prev, { id: uuid(), sender: "user", text: message }]);

      const payload: any = {
        type: "chat",
        nurseId: testNurse.id,
        message,
        conversationId: conversationId.current,
        medspaId: testMedSpa.medspaId,
        medSpaContext: testMedSpa,
        streaming: true,
        cacheControl: { debug: cacheDebug, forceFresh },
        debug: { timestamp: new Date().toISOString() },
      };

      if (isPatientContextEnabled && patient) {
        payload.patientId = patient.id;
        payload.patientInfo = patient;
        payload.debug.activePatientContext = patient.id;
      }

      socketRef.current.send(JSON.stringify(payload));
      resetForm();
    },
  });

  useEffect(() => {
    const connect = async () => {
      const { token } = await fetch("/api/token").then((r) => r.json());
      const socket = new WebSocket(getWebSocketUrl());
      socketRef.current = socket;

      socket.onopen = () => {
        setConnected(true);
        socket.send(JSON.stringify({ type: "auth", token }));
      };

      socket.onmessage = (event: MessageEvent<string>) => {
        const message: WebSocketResponseMessage = JSON.parse(event.data);
        switch (message.type) {
          case "auth_success":
            console.log("Authenticated");
            break;
          case "chat_stream_start":
            setStreamBuffer("");
            break;
          case "chat_stream_chunk":
            setStreamBuffer((prev) => prev + extractChunk(message.chunk));
            break;
          case "chat_stream_complete": {
            const rawContent = (message.response?.content as string) || "";
            const cleaned = sanitizeMarkdown(rawContent);
            setMessages((prev) => [
              ...prev,
              { id: uuid(), sender: "ai", text: String(cleaned || "") },
            ]);
            setStreamBuffer("");
            logMetadata(message.response?.metadata);
            break;
          }
          case "chat_response": {
            const rawContent = (message.response?.content as string) || "";
            const cleaned = sanitizeMarkdown(rawContent);
            setMessages((prev) => [
              ...prev,
              { id: uuid(), sender: "ai", text: extractChunk(cleaned) },
            ]);
            logMetadata(message.response?.metadata);
            break;
          }
          case "error":
            console.error("Error: ", message.error);
            break;
        }
      };

      socket.onerror = (e: Event) => {
        console.error("WebSocket error event triggered");

        if ("message" in e) {
          console.error("WebSocket error message:", (e as any).message);
        } else {
          console.error(e);
        }
      };
      socket.onclose = () => setConnected(false);
    };

    connect();
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <keeping this since we need to scroll to the bottom on every new message>
  useEffect(() => {
    chatContainerRef.current?.scrollTo(0, chatContainerRef.current.scrollHeight);
  }, [messages, streamBuffer]);

  const extractChunk = (chunk: any): string => {
    if (!chunk) return "";
    if (typeof chunk === "string") return chunk;
    if (typeof chunk.content === "string") return chunk.content;
    if (typeof chunk.text === "string") return chunk.text;
    if (chunk.content?.chunk?.text) return chunk.content.chunk.text;
    return "";
  };

  const logMetadata = (meta: any) => {
    if (!meta) return;
    console.log("Model:", meta.model || "unknown");
    console.log("Processing Time:", meta.processingTime, "ms");
    if (meta.cache) {
      console.log("Cache Hit:", meta.cache.hit ? "YES" : "NO");
      if (meta.cache.ttl) console.log("TTL:", meta.cache.ttl);
    }
    if (meta.contextIntegration) {
      console.log("Context Integration:", meta.contextIntegration.score, "%");
    }
  };

  return (
    <div className="flex flex-col h-screen w-full max-w-3xl mx-auto border-x bg-white">
      {/* Topbar */}
      <div className="px-4 py-2 border-b bg-white/80 backdrop-blur-md sticky top-0 z-10 flex items-center gap-4 text-sm">
        <label className="font-medium">
          Patient:
          <select
            className="ml-2 border rounded px-2 py-1 bg-white text-black"
            value={currentPatientId}
            onChange={(e) => setCurrentPatientId(e.target.value as keyof typeof patientDatabase)}
          >
            {Object.keys(patientDatabase).map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-3">
          <Toggle label="Patient Context" />
          <Toggle label="Force Fresh" />
          <Toggle label="Cache Debug" />
        </div>
      </div>

      {/* Chat content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={chatContainerRef}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={clsx(
              "flex flex-col gap-1",
              msg.sender === "user" ? "items-end" : "items-start",
            )}
          >
            <div
              className={clsx(
                "rounded-xl px-4 py-3 max-w-[85%] prose prose-sm whitespace-pre-wrap",
                msg.sender === "user"
                  ? "bg-blue-400 text-black font-medium shadow-sm"
                  : "bg-gray-100 text-gray-900 shadow border border-gray-200",
              )}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
            </div>
          </div>
        ))}

        {streamBuffer && (
          <div className="flex items-start">
            <div className="bg-gray-100 px-4 py-3 rounded-xl max-w-[85%] text-gray-700 animate-pulse prose prose-sm whitespace-pre-wrap">
              {streamBuffer}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={formik.handleSubmit} className="border-t bg-white p-4">
        <div className="flex items-center gap-2">
          <Input
            id="message"
            name="message"
            placeholder="Type your message..."
            value={formik.values.message}
            onChange={formik.handleChange}
            className="flex-1 bg-gray-50 border px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
            required
          />
          <Button
            type="submit"
            disabled={!formik.values.message.trim()}
            className="rounded-lg px-5 py-2 shadow"
          >
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}
