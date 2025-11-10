export interface PredefinedColor {
  name: string;
  displayName: string;
  code: string;
}

export const PREDEFINED_COLORS: PredefinedColor[] = [
  { name: "rojo", displayName: "Rojo", code: "#e23c3c" },
  { name: "naranja", displayName: "Naranja", code: "#ff8c00" },
  { name: "amarillo", displayName: "Amarillo", code: "#ffec3d" },
  { name: "oro", displayName: "Oro", code: "#ffd700" },
  { name: "verde", displayName: "Verde", code: "#8bd741" },
  { name: "verdemanzana", displayName: "Verde manzana", code: "#8db600" },
  { name: "celeste", displayName: "Celeste", code: "#87ceeb" },
  { name: "azul", displayName: "Azul", code: "#274c9a" },
  { name: "violeta", displayName: "Violeta", code: "#8a2be2" },
  { name: "fucsia", displayName: "Fucsia", code: "#ff00ff" },
  { name: "rosa", displayName: "Rosa", code: "#ff69b4" },
  { name: "rosapastel", displayName: "Rosa pastel", code: "#ffb6c1" },
  { name: "rosaoro", displayName: "Rosa oro", code: "#e8b4b8" },
  { name: "azulpastel", displayName: "Azul pastel", code: "#a8d5e2" },
  { name: "verdepastel", displayName: "Verde pastel", code: "#98fb98" },
  { name: "violetapastel", displayName: "Violeta pastel", code: "#dda0dd" },
  { name: "marronclaro", displayName: "Marrón claro", code: "#d2691e" },
  { name: "marronoscuro", displayName: "Marrón oscuro", code: "#654321" },
  { name: "gris", displayName: "Gris", code: "#808080" },
  { name: "crema", displayName: "Crema", code: "#fffdd0" },
  { name: "cristal", displayName: "Cristal", code: "#f0f8ff" },
  { name: "blanco", displayName: "Blanco", code: "#ffffff" },
  { name: "negro", displayName: "Negro", code: "#121212" },
];

export const getColorByCode = (code: string): PredefinedColor | undefined => {
  return PREDEFINED_COLORS.find((color) => color.code === code);
};

export const getColorByName = (name: string): PredefinedColor | undefined => {
  return PREDEFINED_COLORS.find(
    (color) => color.name.toLowerCase() === name.toLowerCase()
  );
};
