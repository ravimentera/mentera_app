import { cn } from "@/lib/utils";
import { SendHorizonalIcon, Wand2 } from "lucide-react";
import { KeyboardEvent } from "react";
import { Button } from "../atoms/Button";
import { GradientIcon, SVG_MASKS } from "../atoms/GradientIcon";

interface ChatInputProps {
  message: string;
  onMessageChange: (message: string) => void;
  onSend: () => void;
  onKeyUp?: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  onGenerateAIMessage?: (onMessageGenerated?: (message: string, subject?: string) => void) => void;
  showPrompts?: boolean;
  customBorderClassName?: string;
  placeholder?: string;
  isLoading?: boolean;
  disabled?: boolean;
  isGeneratingAI?: boolean;
  onMessageGenerated?: (message: string, subject?: string) => void;
}

export function ChatInput({
  message,
  onMessageChange,
  onSend,
  onKeyUp,
  onGenerateAIMessage,
  showPrompts = true,
  customBorderClassName,
  placeholder = "Ask anything",
  isLoading = false,
  disabled = false,
  isGeneratingAI = false,
  onMessageGenerated,
}: ChatInputProps) {
  const handleGenerateAI = () => {
    if (onGenerateAIMessage && onMessageGenerated) {
      onGenerateAIMessage(onMessageGenerated);
    }
  };

  return (
    <div
      className={cn(
        "relative bg-white  rounded-2xl overflow-hidden shadow-md",
        customBorderClassName ? customBorderClassName : " border border-gradient-blue",
      )}
    >
      <div className="p-3 max-h-56 overflow-y-auto">
        <textarea
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          onKeyUp={onKeyUp}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={cn(
            "w-full border-0 text-gray-800 placeholder:text-gray-400 bg-transparent focus:ring-0 resize-none outline-none min-h-[24px] max-h-28 overflow-y-auto",
            disabled && "opacity-50 cursor-not-allowed",
          )}
          style={{
            boxShadow: "none",
            height: "auto",
            minHeight: "44px",
          }}
        />
      </div>

      {/* Bottom toolbar */}
      <div className="flex items-center justify-between px-4 pb-3">
        <div className="flex items-center gap-4">
          {onGenerateAIMessage && (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleGenerateAI}
              disabled={isGeneratingAI || disabled}
              className="rounded-lg hover:bg-gray-200 text-gray-700 h-9 p-2 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingAI ? (
                <div className="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />
              ) : (
                <GradientIcon icon={Wand2} size="w-4 h-4" svgMask={SVG_MASKS.WAND2} />
              )}
            </Button>
          )}
          {showPrompts && (
            <>
              <div className="w-px h-6 bg-gray-200" />
              <span className="text-sm text-text-muted font-medium cursor-pointer">
                Explore Prompts
              </span>
            </>
          )}
        </div>

        <div
          onClick={disabled ? undefined : onSend}
          className={cn(
            "bg-transparent rounded-lg p-2",
            disabled ? "text-gray-400 cursor-not-allowed" : "text-brand-blue cursor-pointer",
          )}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
          ) : (
            <SendHorizonalIcon className="h-5 w-5" />
          )}
        </div>
      </div>
    </div>
  );
}
