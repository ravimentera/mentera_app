import { ChatMessageSkeleton } from "@/components/atoms";
import clsx from "clsx";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatMessage } from "./types";

interface ChatMessageListProps {
  messages: ChatMessage[];
  streamBuffer: string;
  loading: boolean;
  chatContainerRef: React.RefObject<HTMLDivElement>;
}

export function ChatMessageList({
  messages,
  streamBuffer,
  loading,
  chatContainerRef,
}: ChatMessageListProps) {
  return (
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
              "rounded-xl px-4 py-3 max-w-[85%] prose prose-sm",
              msg.sender === "user"
                ? "bg-blue-400 text-black font-medium shadow-sm"
                : "bg-gray-100 text-gray-900 shadow border border-gray-200",
            )}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
          </div>
        </div>
      ))}
      {loading && <ChatMessageSkeleton />}
      {streamBuffer && (
        <div className="flex items-start">
          <div className="bg-gray-100 px-4 py-3 rounded-xl max-w-[85%] text-gray-700 animate-pulse prose prose-sm whitespace-pre-wrap">
            {streamBuffer}
          </div>
        </div>
      )}
    </div>
  );
}
