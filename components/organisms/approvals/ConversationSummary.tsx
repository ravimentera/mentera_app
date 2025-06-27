import { Button } from "@/components/atoms";
import { Maximize2, Sparkles } from "lucide-react";

interface ConversationSummaryProps {
  conversationSummary: string;
  onViewConversation?: () => void;
  className?: string;
}

export function ConversationSummary({
  conversationSummary,
  onViewConversation,
  className,
}: ConversationSummaryProps) {
  return (
    <div className={className}>
      <div className="bg-gradient-to-r from-brand-blue-hover to-blue-950 p-px rounded-lg relative">
        <div className="bg-white rounded-lg p-6 space-y-4">
          <div className="absolute -top-4 left-3">
            <div className="inline-flex items-center gap-1 bg-gradient-to-r from-brand-blue-hover to-blue-950 text-white px-2 py-1 rounded-md text-sm font-semibold">
              <Sparkles className="w-3 h-3" />
              Tera Suggest
            </div>
          </div>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-brand-blue-hover to-blue-950 bg-clip-text text-transparent">
              Conversation Summary
            </h3>
            <Button
              variant="outline-ghost"
              size="sm"
              className="p-0 h-auto"
              onClick={onViewConversation}
            >
              View Conversation
              <Maximize2 className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <p className="text-foreground leading-relaxed">{conversationSummary}</p>
        </div>
      </div>
    </div>
  );
}
