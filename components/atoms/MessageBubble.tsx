import { cn } from "@/lib/utils";

export interface MessageBubbleProps {
  text: string;
  isOutbound: boolean;
  className?: string;
}

export function MessageBubble({ text, isOutbound, className }: MessageBubbleProps) {
  console.log({ text, isOutbound, className });
  return (
    <div
      className={cn(
        "max-w-[80%] rounded-lg px-4 py-2 text-sm",
        isOutbound
          ? "mr-auto bg-brand-blue-light text-gray-900 rounded-tl-none"
          : "ml-auto bg-white border border-gray-200 text-gray-900 rounded-tr-none",
        className,
      )}
    >
      <p className="whitespace-pre-wrap break-words">{text}</p>
    </div>
  );
}
