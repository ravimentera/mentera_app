import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeMarkdown(content: string): string {
  return (
    content
      .trim()
      // Collapse 3+ line breaks → 2
      .replace(/\n{3,}/g, "\n\n")

      // Remove trailing spaces from each line
      .split("\n")
      .map((line) => line.trimEnd())
      .join("\n")

      // Remove blank lines between list items (bullet spacing)
      .replace(/-\s+(.+)\n\s*\n(?=-\s)/g, "- $1\n") // removes single blank lines between `- item` list

      // Optional: normalize multiple blank lines after lists
      .replace(/(\n\s*[-*]\s[^\n]+)+\n{2,}/g, (match) => match.trimEnd() + "\n\n")
  );
}
