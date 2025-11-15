export interface PredefinedColor {
  name: string;
  code: string;
}

export const normalizeColorName = (value: string): string => {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "");
};

export const PREDEFINED_COLORS: PredefinedColor[] = [
  { name: "Rojo", code: "#e23c3c" },
  { name: "Naranja", code: "#ff8c00" },
  { name: "Amarillo", code: "#ffec3d" },
  { name: "Oro", code: "#ffd700" },
  { name: "Verde", code: "#8bd741" },
  { name: "Verde Manzana", code: "#8db600" },
  { name: "Celeste", code: "#87ceeb" },
  { name: "Azul", code: "#274c9a" },
  { name: "Violeta", code: "#8a2be2" },
  { name: "Fucsia", code: "#ff00ff" },
  { name: "Rosa", code: "#ff69b4" },
  { name: "Rosa Pastel", code: "#ffb6c1" },
  { name: "Rosa Oro", code: "#e8b4b8" },
  { name: "Azul Pastel", code: "#a8d5e2" },
  { name: "Verde Pastel", code: "#98fb98" },
  { name: "Violeta Pastel", code: "#dda0dd" },
  { name: "Marrón Claro", code: "#d2691e" },
  { name: "Marrón Oscuro", code: "#654321" },
  { name: "Gris", code: "#808080" },
  { name: "Crema", code: "#fffdd0" },
  { name: "Cristal", code: "#f0f8ff" },
  { name: "Blanco", code: "#ffffff" },
  { name: "Negro", code: "#121212" },
];

export const getColorByCode = (code: string): PredefinedColor | undefined => {
  return PREDEFINED_COLORS.find((color) => color.code === code);
};

export const getColorByName = (name: string): PredefinedColor | undefined => {
  const normalizedTarget = normalizeColorName(name);
  return PREDEFINED_COLORS.find(
    (color) => normalizeColorName(color.name) === normalizedTarget
  );
};
