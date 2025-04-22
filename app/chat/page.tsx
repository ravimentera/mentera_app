"use client";

import { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import WebSocket from "isomorphic-ws"; // required in browser context

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

const testPatient = {
  id: "PT-1001",
  chartId: "CH-5001",
  treatmentNotes: {
    procedure: "Botox",
    areasTreated: ["Forehead", "Crow's Feet"],
    unitsUsed: 35,
    observations: "Mild redness post-procedure...",
    providerRecommendations: "Consider adding glabellar lines in next session.",
  },
  preProcedureCheck: {
    medications: ["Vitamin C"],
    consentSigned: true,
    allergyCheck: "No contraindications",
  },
  postProcedureCare: {
    instructionsProvided: true,
    followUpRecommended: "2025-06-10",
    productsRecommended: ["Arnica Gel"],
  },
  nextTreatment: "Glabellar lines",
  followUpDate: "2025-06-10",
  alerts: [],
  medspaId: testMedSpa.medspaId,
  providerSpecialty: "Botox",
  treatmentOutcome: "Positive",
};

const ChatClient = () => {
  const [messages, setMessages] = useState<
    { sender: "user" | "ai"; text: string }[]
  >([]);
  const [streamBuffer, setStreamBuffer] = useState("");
  const socketRef = useRef<WebSocket | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const conversationId = useRef(`conv_${Date.now()}`);
  const [connected, setConnected] = useState(false);

  const formik = useFormik({
    initialValues: { message: "" },
    onSubmit: ({ message }, { resetForm }) => {
      console.log({ message });

      if (!connected || !socketRef.current) return;
      setMessages((prev) => [...prev, { sender: "user", text: message }]);

      socketRef.current.send(
        JSON.stringify({
          type: "chat",
          nurseId: testNurse.id,
          message,
          conversationId: conversationId.current,
          patientInfo: testPatient,
          medSpaContext: testMedSpa,
          streaming: true,
        })
      );

      resetForm();
    },
  });

  useEffect(() => {
    const connectWebSocket = async () => {
      const res = await fetch("/api/token");
      const { token } = await res.json();

      const socket = new WebSocket(
        `ws://${process.env.NEXT_PUBLIC_WS_HOST || "localhost"}:${
          process.env.NEXT_PUBLIC_WS_PORT || "5003"
        }/ws`
      );
      socketRef.current = socket;

      socket.onopen = () => {
        setConnected(true);
        socket.send(JSON.stringify({ type: "auth", token }));
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          switch (message.type) {
            case "auth_success":
              console.log("✅ Authenticated with WebSocket server");
              break;

            case "chat_stream_start":
              setStreamBuffer("");
              break;

            case "chat_stream_chunk": {
              const content = extractChunk(message.chunk);
              if (content) {
                setStreamBuffer((prev) => prev + content);
              }
              break;
            }

            case "chat_stream_complete": {
              const finalContent =
                typeof message.response?.content === "string"
                  ? message.response.content
                  : JSON.stringify(message.response?.content || {});
              setMessages((prev) => [
                ...prev,
                { sender: "ai", text: finalContent },
              ]);
              setStreamBuffer("");
              break;
            }

            case "chat_response": {
              const content =
                typeof message.response?.content === "string"
                  ? message.response.content
                  : JSON.stringify(message.response?.content || {});
              setMessages((prev) => [...prev, { sender: "ai", text: content }]);
              break;
            }

            case "chat_stream_error":
            case "error":
              console.error("❌ WebSocket error:", message.error);
              break;

            default:
              console.warn("⚠️ Unknown WebSocket message:", message);
          }
        } catch (err) {
          console.error("Failed to parse WS message:", err);
        }
      };

      socket.onerror = (err) => {
        console.error("WebSocket error:", err);
      };

      socket.onclose = () => {
        setConnected(false);
        console.log("WebSocket closed");
      };
    };

    connectWebSocket();
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, streamBuffer]);

  const extractChunk = (chunk: any): string => {
    if (typeof chunk === "string") return chunk;
    if (chunk?.type === "content" && typeof chunk.content === "string") {
      console.log({ chunk: chunk.content });

      return chunk.content;
    }
    if (chunk?.content?.chunk) {
      return typeof chunk.content.chunk === "string"
        ? chunk.content.chunk
        : chunk.content.chunk.text || "";
    }
    return "";
  };

  return (
    <div className="flex flex-col h-screen w-full max-w-4xl mx-auto bg-white border rounded shadow-lg">
      <div
        className="flex-grow overflow-y-auto p-4 space-y-2"
        ref={chatContainerRef}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-[75%] px-4 py-2 rounded-lg ${
              msg.sender === "user"
                ? "bg-blue-100 self-end text-right"
                : "bg-gray-100 self-start"
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

      <form onSubmit={formik.handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <input
            name="message"
            type="text"
            value={formik.values.message}
            onChange={formik.handleChange}
            placeholder="Type your message..."
            className="flex-grow px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={!formik.values.message.trim()}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatClient;
