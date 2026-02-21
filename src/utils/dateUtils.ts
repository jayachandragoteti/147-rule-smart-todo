/**
 * Check if a date string is today's date
 */
export const isTodayDate = (dateString: string): boolean => {
  const todoDate = new Date(dateString);
  const today = new Date();
  
  return (
    todoDate.getFullYear() === today.getFullYear() &&
    todoDate.getMonth() === today.getMonth() &&
    todoDate.getDate() === today.getDate()
  );
};

/**
 * Format date for display
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
