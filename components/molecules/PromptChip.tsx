"use client";

import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface PromptChipProps extends HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  emoji?: string;
  onSelect?: () => void;
}

export function PromptChip({ children, emoji, onSelect, className, ...props }: PromptChipProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-full hover:bg-gray-100 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        className,
      )}
      {...props}
    >
      {emoji && <span>{emoji}</span>}
      <span>{children}</span>
    </button>
  );
}
