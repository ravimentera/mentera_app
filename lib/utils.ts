import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate initials from a full name
 * @param name - Full name string
 * @param maxInitials - Maximum number of initials to return (default: 2)
 * @returns Initials string in uppercase
 */
export function getInitials(name: string, maxInitials = 2): string {
  if (!name || typeof name !== "string") return "";

  return name
    .trim()
    .split(" ")
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, maxInitials)
    .join("");
}

/**
 * Get full name from first and last name parts
 * @param firstName - First name
 * @param lastName - Last name
 * @returns Full name string, properly trimmed
 */
export function getFullName(firstName: string, lastName: string): string {
  return `${firstName || ""} ${lastName || ""}`.trim();
}

/**
 * Extract first and last name from a full name string
 * @param fullName - Full name string
 * @returns Object with firstName and lastName
 */
export function parseFullName(fullName: string): { firstName: string; lastName: string } {
  if (!fullName || typeof fullName !== "string") {
    return { firstName: "", lastName: "" };
  }

  const parts = fullName
    .trim()
    .split(" ")
    .filter((part) => part.length > 0);
  const firstName = parts[0] || "";
  const lastName = parts.slice(1).join(" ") || "";

  return { firstName, lastName };
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
