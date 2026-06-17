/**
 * Theme Utility Classes
 * 
 * This module provides semantic CSS class names for consistent theme styling
 * across the application. Uses the global theme variables defined in index.css.
 * 
 * Dark mode palette (spec):
 *   bg:         #0F1117
 *   secondary:  #171A22
 *   card:       #1E2230
 *   primary:    #4F8CFF
 *   success:    #22C55E
 *   warning:    #F59E0B
 *   danger:     #EF4444
 *   text:       #FFFFFF / #A0A6B5
 */

export const THEME_CLASSES = {
  /* Surface Classes */
  surface: {
    base:      "bg-white dark:bg-[#0f1117] transition-colors duration-300",
    card:      "bg-white dark:bg-[#1e2230] transition-colors duration-300",
    secondary: "bg-gray-50 dark:bg-[#171a22] transition-colors duration-300",
    hover:     "hover:bg-gray-50 dark:hover:bg-[#1e2230] transition-colors duration-300",
    navbar:    "bg-white/90 dark:bg-[#0f1117]/90 transition-colors duration-300",
    active:    "bg-gray-100 dark:bg-[#1e2230] transition-colors duration-300",
    code:      "bg-gray-50 dark:bg-[#171a22] transition-colors duration-300",
  },

  /* Border Classes */
  border: {
    base:      "border-gray-200 dark:border-[#ffffff0f] transition-colors duration-300",
    default:   "border-gray-200 dark:border-[#ffffff0f] transition-colors duration-300",
    secondary: "border-gray-300 dark:border-[#ffffff1a] transition-colors duration-300",
  },

  /* Text Classes */
  text: {
    primary:   "text-gray-900 dark:text-white transition-colors duration-300",
    secondary: "text-gray-600 dark:text-[#a0a6b5] transition-colors duration-300",
    tertiary:  "text-gray-400 dark:text-[#606878] transition-colors duration-300",
    link:      "text-[#4f8cff] hover:text-blue-400 cursor-pointer transition-colors duration-300",
  },

  /* Input Classes */
  input: {
    base: "border border-gray-200 dark:border-[#ffffff0f] bg-white dark:bg-[#171a22] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#606878] focus:outline-none focus:ring-2 focus:ring-[#4f8cff]/30 transition-colors duration-300",
  },

  /* Button Classes */
  button: {
    primary:   "bg-[#4f8cff] hover:bg-[#3c7cf0] text-white shadow-[0_0_20px_rgba(79,140,255,0.25)] transition-all duration-200",
    secondary: "bg-gray-100 dark:bg-[#1e2230] hover:bg-gray-200 dark:hover:bg-[#252b3d] text-gray-900 dark:text-white border border-gray-200 dark:border-[#ffffff0f] transition-all duration-200",
    hover:     "hover:bg-gray-100 dark:hover:bg-[#1e2230] transition-colors duration-200",
    ghost:     "text-gray-600 dark:text-[#a0a6b5] hover:text-gray-900 dark:hover:text-white transition-colors duration-200",
    danger:    "bg-red-500 hover:bg-red-600 text-white transition-all duration-200",
  },

  /* Divider Classes */
  divider: {
    base:    "border-gray-200 dark:border-[#ffffff0f] transition-colors duration-300",
    default: "border-gray-200 dark:border-[#ffffff0f] transition-colors duration-300",
  },

  /* Functional / Status Classes */
  status: {
    active:    "bg-[#4f8cff]/10 text-[#4f8cff]",
    todo:      "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-[#a0a6b5]",
    inprogress:"bg-amber-50 dark:bg-[#f59e0b]/10 text-amber-600 dark:text-[#f59e0b]",
    success:   "bg-emerald-50 dark:bg-[#22c55e]/10 text-emerald-600 dark:text-[#22c55e]",
    warning:   "bg-amber-50 dark:bg-[#f59e0b]/10 text-amber-600 dark:text-[#f59e0b]",
    danger:    "bg-red-50 dark:bg-[#ef4444]/10 text-red-600 dark:text-[#ef4444]",
  },

  /* Priority Classes */
  priority: {
    low:    "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-[#a0a6b5]",
    medium: "bg-blue-50 dark:bg-[#4f8cff]/10 text-blue-600 dark:text-[#4f8cff]",
    high:   "bg-orange-50 dark:bg-orange-400/10 text-orange-600 dark:text-orange-400",
    urgent: "bg-red-50 dark:bg-[#ef4444]/10 text-red-600 dark:text-[#ef4444]",
  },

  /* Brand Classes */
  brand: {
    primary:  "bg-[#4f8cff]",
    gradient: "bg-gradient-to-r from-[#4f8cff] to-[#818cf8]",
    glow:     "shadow-[0_0_20px_rgba(79,140,255,0.3)]",
  }
} as const;

/**
 * Helper function to combine theme classes
 */
export const combineThemeClasses = (classes: (string | null | undefined)[]): string => {
  return classes.filter(Boolean).join(" ");
};

export const getBgClass = (variant: keyof typeof THEME_CLASSES.surface = "base"): string =>
  THEME_CLASSES.surface[variant] || THEME_CLASSES.surface.base;

export const getTextClass = (variant: keyof typeof THEME_CLASSES.text = "primary"): string =>
  THEME_CLASSES.text[variant] || THEME_CLASSES.text.primary;

export const getBorderClass = (variant: keyof typeof THEME_CLASSES.border = "base"): string =>
  THEME_CLASSES.border[variant] || THEME_CLASSES.border.base;

