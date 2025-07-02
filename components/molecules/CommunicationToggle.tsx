import { cn } from "@/lib/utils";
import { Mail, MessageSquare } from "lucide-react";

interface CommunicationToggleProps {
  activeMethod: "chat" | "email";
  onMethodChange: (method: "chat" | "email") => void;
  className?: string;
}

export function CommunicationToggle({
  activeMethod,
  onMethodChange,
  className,
}: CommunicationToggleProps) {
  return (
    <div className={cn("bg-ui-background-gray rounded-lg p-1 flex gap-1", className)}>
      <button
        type="button"
        onClick={() => onMethodChange("chat")}
        className={cn(
          "p-2 rounded-md transition-colors",
          activeMethod === "chat"
            ? "bg-brand-blue-light text-brand-blue border border-brand-blue"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <MessageSquare className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => onMethodChange("email")}
        className={cn(
          "p-2 rounded-md transition-colors",
          activeMethod === "email"
            ? "bg-brand-blue-light text-brand-blue border border-brand-blue"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Mail className="w-4 h-4" />
      </button>
    </div>
  );
}
