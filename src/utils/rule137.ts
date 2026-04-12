import { toDateOnlyString } from "./dateUtils";

/**
 * 137 Rule Utility
 *
 * The 1-3-7 Rule is an exponentially scaled spaced repetition technique:
 * - Day 1: Initial learning
 * - Day 3: First review (2 days after Day 1)
 * - Day 7: Second review (6 days after Day 1)
 *
 * This reinforces memory retention through exponentially increasing intervals.
 */

/** The interval offsets (in days) from the base date */
export const RULE_137_OFFSETS = [0, 2, 6] as const;

/** Labels for each occurrence in the series */
export const RULE_137_LABELS = ["Day 1", "Day 3", "Day 7"] as const;

/**
 * Generate the three series dates from a base date using the 1-3-7 rule.
 * @param baseDate - The starting date (Day 1)
 * @returns An array of three ISO date strings
 */
export const generate137Dates = (baseDate: Date): string[] => {
  return RULE_137_OFFSETS.map((offset) => {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + offset);
    return d.toISOString();
  });
};

/**
 * Get a human-readable label for the current position in a 137 series.
 * @param seriesDates - The array of series date strings
 * @param currentDate - The current scheduled date string
 * @returns A label like "Day 1", "Day 4", "Day 7", or "Series"
 */
export const get137Label = (
  seriesDates: string[],
  currentDate: string
): string => {
  const currentOnly = toDateOnlyString(currentDate);
  const idx = seriesDates.findIndex(
    (d) => toDateOnlyString(d) === currentOnly
  );
  return RULE_137_LABELS[idx] ?? "Series";
};

/**
 * Check if a 137 series is on its final occurrence.
 * @param seriesDates - The array of series date strings
 * @param currentDate - The current scheduled date string
 */
export const isLastInSeries = (
  seriesDates: string[],
  currentDate: string
): boolean => {
  const currentOnly = toDateOnlyString(currentDate);
  const normalized = seriesDates.map((d) => toDateOnlyString(d));
  const idx = normalized.indexOf(currentOnly);
  return idx === normalized.length - 1;
};

/**
 * Get the next date in the series after the current one.
 * @returns The next ISO date string, or null if at the end.
 */
export const getNextSeriesDate = (
  seriesDates: string[],
  currentDate: string
): string | null => {
  const currentOnly = toDateOnlyString(currentDate);
  const normalized = seriesDates.map((d) => toDateOnlyString(d));
  const idx = normalized.indexOf(currentOnly);
  if (idx >= 0 && idx < normalized.length - 1) {
    return seriesDates[idx + 1];
  }
  return null;
};
