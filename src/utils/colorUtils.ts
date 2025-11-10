export const isValidColor = (color: string): boolean => {
  if (!color || typeof color !== "string") {
    return false;
  }

  const trimmedColor = color.trim();

  if (trimmedColor.length === 0) {
    return false;
  }

  const s = new Option().style;
  s.color = trimmedColor;

  return s.color !== "";
};

export const normalizeColor = (color: string): string => {
  if (!isValidColor(color)) {
    return color;
  }

  const trimmedColor = color.trim();

  const s = new Option().style;
  s.color = trimmedColor;

  const normalized = s.color;

  if (normalized.startsWith("rgb")) {
    return normalized;
  }

  const hexMatch = normalized.match(/^#([a-f\d]{3}|[a-f\d]{6})$/i);
  if (hexMatch) {
    return normalized.toLowerCase();
  }

  return normalized;
};

const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
};

export const getDisplayColor = (color: string): string => {
  if (!isValidColor(color)) {
    return color;
  }

  const trimmedColor = color.trim();

  if (trimmedColor.startsWith("#")) {
    if (trimmedColor.length === 4) {
      const r = trimmedColor[1];
      const g = trimmedColor[2];
      const b = trimmedColor[3];
      return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
    }
    if (trimmedColor.length === 7) {
      return trimmedColor.toLowerCase();
    }
  }

  if (typeof window === "undefined" || !document.body) {
    return trimmedColor;
  }

  try {
    const tempElement = document.createElement("div");
    tempElement.style.color = trimmedColor;
    tempElement.style.position = "absolute";
    tempElement.style.visibility = "hidden";
    tempElement.style.pointerEvents = "none";
    document.body.appendChild(tempElement);

    const computedColor = window.getComputedStyle(tempElement).color;
    document.body.removeChild(tempElement);

    if (!computedColor || computedColor === "rgba(0, 0, 0, 0)") {
      return trimmedColor;
    }

    const rgbMatch = computedColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1], 10);
      const g = parseInt(rgbMatch[2], 10);
      const b = parseInt(rgbMatch[3], 10);
      return rgbToHex(r, g, b);
    }

    const rgbaMatch = computedColor.match(
      /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/
    );
    if (rgbaMatch) {
      const r = parseInt(rgbaMatch[1], 10);
      const g = parseInt(rgbaMatch[2], 10);
      const b = parseInt(rgbaMatch[3], 10);
      return rgbToHex(r, g, b);
    }
  } catch {
    return trimmedColor;
  }

  return trimmedColor;
};

