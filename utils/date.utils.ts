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
 * Check if we need to show a date header between messages
 */
export function shouldShowDateHeader(
  currentMessageDate: Date,
  previousMessageDate: Date | null,
): boolean {
  if (!previousMessageDate) return true;
  return !isSameDay(currentMessageDate, previousMessageDate);
}
