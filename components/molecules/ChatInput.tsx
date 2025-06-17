import { PaperclipIcon, SendHorizonalIcon } from "lucide-react";
import { ChangeEvent, KeyboardEvent } from "react";
import { Input } from "../atoms/Input";

interface ChatInputProps {
  message: string;
  onMessageChange: (message: string) => void;
  onSend: () => void;
  onKeyUp?: (e: KeyboardEvent<HTMLInputElement>) => void;
}

export function ChatInput({ message, onMessageChange, onSend, onKeyUp }: ChatInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onMessageChange(e.target.value);
  };

  return (
    <div className="relative bg-white border border-gradient-purple rounded-2xl overflow-hidden">
      <div className="py-3">
        <Input
          value={message}
          onChange={handleChange}
          onKeyUp={onKeyUp}
          placeholder="Ask anything to mentera..."
          className="w-full border-0 text-gray-800 placeholder:text-gray-400 bg-transparent focus:ring-0 resize-none"
          style={{ boxShadow: "none" }}
        />
      </div>

      {/* Bottom toolbar */}
      <div className="flex items-center justify-between px-4 pb-3">
        <div className="flex items-center gap-4">
          <PaperclipIcon className="w-4 h-4" />
          <div className="w-px h-6 bg-gray-200" />
          <span className="text-sm text-text-muted font-medium cursor-pointer">
            Explore Prompts
          </span>
        </div>

        <div
          onClick={onSend}
          className="text-brand-purple cursor-pointer bg-transparent rounded-lg p-2"
        >
          <SendHorizonalIcon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
