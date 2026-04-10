/**
 * Check if a date string is today's date
 */
export const isTodayDate = (dateString: string): boolean => {
  if (!dateString) return false;
  const target = toDateOnlyString(dateString);
  const now = toDateOnlyString(new Date().toISOString());
  return target === now;
};

/**
 * Strips time from an ISO date string
 */
export const toDateOnlyString = (dateString: string): string => {
  if (!dateString) return "";
  return new Date(dateString).toISOString().split("T")[0];
};

/**
 * Format date for display
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Calculate the next recurrence date
 */
export const getNextRecurrenceDate = (currentDate: string, recurrence: "daily" | "weekly" | "monthly"): string => {
  const date = new Date(currentDate);
  switch (recurrence) {
    case "daily":
      date.setDate(date.getDate() + 1);
      break;
    case "weekly":
      date.setDate(date.getDate() + 7);
      break;
    case "monthly":
      date.setMonth(date.getMonth() + 1);
      break;
  }
  return date.toISOString();
};
