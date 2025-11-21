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

export const toSlug = (value: string): string => {
  if (!value) {
    return "";
  }

  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

