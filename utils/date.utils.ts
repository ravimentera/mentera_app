/**
 * Check if two dates are on the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.toDateString() === date2.toDateString();
}

/**
 * Format a date for chat messages display
 * Returns "Today", "Yesterday", or the date in "DD MMM YYYY" format
 */
export function formatMessageDate(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date, today)) {
    return "Today";
  }

  if (isSameDay(date, yesterday)) {
    return "Yesterday";
  }

  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format a timestamp for approvals display
 * Returns "Today, 9:30 AM", "Yesterday, 9:30 AM", or "22nd July, 8:30 AM" format
 */
export function formatApprovalTimestamp(date: Date | string): string {
  const parsedDate = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Format time consistently
  const timeString = parsedDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (isSameDay(parsedDate, today)) {
    return `Today, ${timeString}`;
  }

  if (isSameDay(parsedDate, yesterday)) {
    return `Yesterday, ${timeString}`;
  }

  // For other dates, format as "22nd July, 8:30 AM"
  const day = parsedDate.getDate();
  const suffix = getDaySuffix(day);
  const monthName = parsedDate.toLocaleDateString("en-US", { month: "long" });

  return `${day}${suffix} ${monthName}, ${timeString}`;
}

/**
 * Get the suffix for day numbers (1st, 2nd, 3rd, 4th, etc.)
 */
function getDaySuffix(day: number): string {
  if (day >= 11 && day <= 13) {
    return "th";
  }
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

/**
 * Check if we need to show a date header between messages
 */
export function shouldShowDateHeader(
  currentMessageDate: Date,
  previousMessageDate: Date | null,
): boolean {
  if (!previousMessageDate) return true;
  return !isSameDay(currentMessageDate, previousMessageDate);
}
