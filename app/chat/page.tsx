"use client";

import { Button, Input, Label } from "@/components/atoms";
import { getWebSocketUrl } from "@/lib/getWebSocketUrl";
import { useFormik } from "formik";
import WebSocket from "isomorphic-ws";
import { useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import { ChatMessage, Patient, WebSocketResponseMessage } from "./types";

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
          case "chat_stream_complete":
            setMessages((prev) => [
              ...prev,
              { id: uuid(), sender: "ai", text: String(message.response?.content || "") },
            ]);
            setStreamBuffer("");
            logMetadata(message.response?.metadata);
            break;
          case "chat_response":
            setMessages((prev) => [
              ...prev,
              { id: uuid(), sender: "ai", text: extractChunk(message.response?.content) },
            ]);
            logMetadata(message.response?.metadata);
            break;
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
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white border rounded shadow-lg">
      <div className="p-2 border-b flex gap-4 items-center text-sm bg-gray-50">
        <label>
          Patient:
          <select
            className="ml-2 border px-2 py-1 rounded"
            value={currentPatientId}
            onChange={(e) => setCurrentPatientId(e.target.value as keyof typeof patientDatabase)}
          >
            {Object.keys(patientDatabase).map((id) => (
              <option key={id}>{id}</option>
            ))}
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            checked={isPatientContextEnabled}
            onChange={() => setIsPatientContextEnabled((v) => !v)}
          />
          <span className="ml-1">Patient Context</span>
        </label>
        <label>
          <input type="checkbox" checked={forceFresh} onChange={() => setForceFresh((v) => !v)} />
          <span className="ml-1">Force Fresh</span>
        </label>
        <label>
          <input type="checkbox" checked={cacheDebug} onChange={() => setCacheDebug((v) => !v)} />
          <span className="ml-1">Cache Debug</span>
        </label>
      </div>

      <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[75%] px-4 py-2 rounded-lg whitespace-pre-wrap ${
              msg.sender === "user" ? "bg-blue-100 self-end text-right" : "bg-gray-100 self-start"
            }`}
          >
            {msg.text}
          </div>
        ))}
        {streamBuffer && (
          <div className="max-w-[75%] px-4 py-2 rounded-lg bg-gray-100 self-start animate-pulse">
            {streamBuffer}
          </div>
        )}
      </div>

      <form onSubmit={formik.handleSubmit} className="border-t p-4 space-y-4">
        <div>
          <Label htmlFor="message">Your Message</Label>
          <Input
            id="message"
            name="message"
            type="text"
            placeholder="Type your message..."
            value={formik.values.message}
            onChange={formik.handleChange}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={!formik.values.message.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
