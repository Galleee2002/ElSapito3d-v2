export const toTitleCase = (value: string): string => {
  if (!value) {
    return "";
  }

  return value
    .trim()
    .replace(/[_-]+/g, " ")
    .split(/\s+/)
    .map((word) =>
      word ? `${word[0].toUpperCase()}${word.slice(1).toLowerCase()}` : ""
    )
    .join(" ")
    .trim();
};

