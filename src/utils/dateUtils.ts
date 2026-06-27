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
 * Check if a date string is in the future (after today)
 */
export const isFutureDate = (dateString: string): boolean => {
  if (!dateString) return false;
  const target = toDateOnlyString(dateString);
  const today = toDateOnlyString(new Date().toISOString());
  return target > today;
};

/**
 * Check if a date string is in the past (before today)
 */
export const isPastDate = (dateString: string): boolean => {
  if (!dateString) return false;
  const target = toDateOnlyString(dateString);
  const today = toDateOnlyString(new Date().toISOString());
  return target < today;
};

/**
 * Calculate the next recurrence date
 */
const WEEKDAY_INDEX: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

export const getNextRecurrenceDate = (
  currentDate: string,
  recurrence: "daily" | "weekly" | "monthly",
  weeklyDays?: string[]
): string => {
  const date = new Date(currentDate);
  switch (recurrence) {
    case "daily":
      date.setDate(date.getDate() + 1);
      break;
    case "weekly": {
      const selectedDays = (weeklyDays ?? [])
        .map((day) => WEEKDAY_INDEX[day.toLowerCase()] ?? -1)
        .filter((dayIndex) => dayIndex >= 0)
        .sort((a, b) => a - b);

      if (selectedDays.length > 0) {
        const currentDay = date.getDay();
        const nextDay = selectedDays.find((day) => day > currentDay) ?? selectedDays[0];
        let delta = (nextDay - currentDay + 7) % 7;
        if (delta === 0) delta = 7;
        date.setDate(date.getDate() + delta);
      } else {
        date.setDate(date.getDate() + 7);
      }
      break;
    }
    case "monthly":
      date.setMonth(date.getMonth() + 1);
      break;
  }
  return date.toISOString();
};
