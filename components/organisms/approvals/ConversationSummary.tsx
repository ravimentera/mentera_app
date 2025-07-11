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
        <div className="bg-white rounded-lg p-4 space-y-4">
          <div className="absolute -top-4 left-3">
            <div className="inline-flex items-center gap-1 text-text bg-gradient-to-r from-gradient-light-start to-gradient-light-end px-2 py-1 rounded-md text-sm font-semibold">
              <Sparkles className="w-3 h-3" />
              <span className="text-sm font-medium bg-gradient-to-r from-gradient-dark-start to-gradient-dark-end bg-clip-text text-transparent">
                Tera Suggest
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-foreground">Conversation Summary</h3>
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
