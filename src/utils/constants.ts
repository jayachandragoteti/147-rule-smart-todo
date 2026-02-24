/* ----------------------------
   Validation Patterns
---------------------------- */
export const VALIDATION = {
  URL_PATTERN: /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_.+~#?&//=]*)$/,
  TITLE_MIN_LENGTH: 3,
  LINK_TITLE_MIN_LENGTH: 2,
  IMAGE_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  IMAGE_ALLOWED_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"],
} as const;

/* ----------------------------
   Form Messages
---------------------------- */
export const FORM_MESSAGES = {
  REQUIRED_TITLE: "Title is required",
  MIN_TITLE: `Title must be at least ${VALIDATION.TITLE_MIN_LENGTH} characters`,
  REQUIRED_DATE: "Task Date is required",
  INVALID_URL: "Please enter a valid URL",
  MIN_LINK_TITLE: `Title must be at least ${VALIDATION.LINK_TITLE_MIN_LENGTH} characters`,
  INVALID_IMAGE_TYPE: "Please upload a valid image (JPEG, PNG, WebP, or GIF)",
  IMAGE_TOO_LARGE: "Image must be less than 5MB",
} as const;
