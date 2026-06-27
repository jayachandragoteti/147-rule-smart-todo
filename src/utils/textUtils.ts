export const toTitleCase = (value: string): string => {
  return value
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) =>
      word
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("-")
    )
    .join(" ");
};
