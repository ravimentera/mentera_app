import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeMarkdown(content: string): string {
  // 1. Trim
  let text = content.trim();

  // 2. If internal messages are present, keep only after 'Bot:' and drop that marker
  const botMarker = "Bot:";
  const botIndex = text.indexOf(botMarker);
  if (botIndex !== -1) {
    text = text.substring(botIndex + botMarker.length).trim();
  }

  // 3. Cleanup Markdown formatting
  return (
    text
      // Collapse 3+ line breaks → 2
      .replace(/\n{3,}/g, "\n\n")

      // Remove trailing spaces on each line
      .split("\n")
      .map((line) => line.trimEnd())
      .join("\n")

      // Remove blank lines between list items
      .replace(/-\s+(.+)\n\s*\n(?=-\s)/g, "- $1\n")

      // Normalize multiple blank lines after lists
      .replace(/(\n\s*[-*]\s[^\n]+)+\n{2,}/g, (match) => match.trimEnd() + "\n\n")
  );
}
