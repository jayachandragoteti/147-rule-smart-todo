/**
 * Check if a date string is today's date
 */
export const isTodayDate = (dateString: string): boolean => {
  const d = new Date(dateString);
  const today = new Date();

  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
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
