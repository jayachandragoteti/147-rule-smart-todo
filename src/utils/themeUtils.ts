/**
 * Theme Utility Classes
 * 
 * This module provides semantic CSS class names for consistent theme styling
 * across the application. Uses the global theme variables defined in index.css
 * 
 * All classes automatically support light/dark mode transitions
 */

export const THEME_CLASSES = {
  /* Surface Classes */
  surface: {
    base: "bg-white dark:bg-[#111827] transition-colors duration-300",
    card: "bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f2937] transition-colors duration-300",
    secondary: "bg-gray-50 dark:bg-[#0f172a] transition-colors duration-300",
    hover: "hover:bg-gray-50 dark:hover:bg-[#0f172a] transition-colors duration-300",
    navbar: "bg-white dark:bg-[#111827] transition-colors duration-300",
    active: "bg-gray-200 dark:bg-[#1f2937] transition-colors duration-300",
    code: "bg-gray-50 dark:bg-[#0f172a] transition-colors duration-300",
  },

  /* Border Classes */
  border: {
    base: "border-gray-200 dark:border-[#1f2937] transition-colors duration-300",
    default: "border-gray-200 dark:border-[#1f2937] transition-colors duration-300",
    secondary: "border-gray-300 dark:border-[#374151] transition-colors duration-300",
  },

  /* Text Classes */
  text: {
    primary: "text-gray-900 dark:text-gray-100 transition-colors duration-300",
    secondary: "text-gray-600 dark:text-gray-400 transition-colors duration-300",
    tertiary: "text-gray-500 dark:text-gray-500 transition-colors duration-300",
    link: "text-blue-600 dark:text-blue-400 hover:underline cursor-pointer transition-colors duration-300",
  },

  /* Input Classes */
  input: {
    base: "border border-gray-300 dark:border-[#1f2937] bg-white dark:bg-[#0f172a] text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-300",
  },

  /* Button Classes */
  button: {
    primary: "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white transition-colors duration-300",
    secondary: "bg-gray-200 dark:bg-[#374151] hover:bg-gray-300 dark:hover:bg-[#4b5563] text-gray-900 dark:text-gray-100 transition-colors duration-300",
    hover: "hover:bg-gray-100 dark:hover:bg-[#1f2937] transition-colors duration-300",
  },

  /* Divider Classes */
  divider: {
    base: "border-gray-200 dark:border-[#1f2937] transition-colors duration-300",
    default: "border-gray-200 dark:border-[#1f2937] transition-colors duration-300",
  },

  /* Functional / Status Classes */
  status: {
    active: "bg-blue-600 text-white shadow-blue-500/20",
    success: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
    warning: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
    danger: "bg-red-100 dark:bg-red-900/30 text-red-600",
  },

  /* Brand Classes */
  brand: {
    primary: "bg-blue-600 dark:bg-blue-600",
    gradient: "bg-gradient-to-r from-blue-600 to-indigo-700",
    glow: "shadow-[0_0_15px_rgba(37,99,235,0.4)]",
  }
} as const;

/**
 * Helper function to combine theme classes
 * @param classes - Array of class strings
 * @returns Combined class string
 */
export const combineThemeClasses = (classes: (string | null | undefined)[]): string => {
  return classes.filter(Boolean).join(" ");
};

/**
 * Get theme-aware background color class
 * @param variant - surface, secondary, or hover
 * @returns CSS class string
 */
export const getBgClass = (variant: keyof typeof THEME_CLASSES.surface = "base"): string => {
  return THEME_CLASSES.surface[variant] || THEME_CLASSES.surface.base;
};

/**
 * Get theme-aware text color class
 * @param variant - primary, secondary, or tertiary
 * @returns CSS class string
 */
export const getTextClass = (variant: keyof typeof THEME_CLASSES.text = "primary"): string => {
  return THEME_CLASSES.text[variant] || THEME_CLASSES.text.primary;
};

/**
 * Get theme-aware border color class
 * @param variant - base or secondary
 * @returns CSS class string
 */
export const getBorderClass = (variant: keyof typeof THEME_CLASSES.border = "base"): string => {
  return THEME_CLASSES.border[variant] || THEME_CLASSES.border.base;
};
