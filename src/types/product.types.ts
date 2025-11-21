import { ColorWithName, ColorSection } from "./color.types";

export type ColorMode = "default" | "sections";

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string[];
  description: string;
  alt?: string;
  plasticType?: string;
  printTime?: string;
  availableColors: ColorWithName[];
  /**
   * Modo de visualización de colores:
   * - "default": muestra todos los colores disponibles (availableColors)
   * - "sections": muestra colores por secciones del producto (colorSections)
   */
  colorMode?: ColorMode;
  /**
   * Definición de colores por secciones del producto.
   * El front de la tienda debe usar este arreglo para aplicar estilos lógicos
   * (ej: techo, base, detalles) en lugar de depender solo de availableColors.
   * Solo se usa cuando colorMode === "sections".
   */
  colorSections?: ColorSection[];
  stock: number;
  isFeatured?: boolean;
  categoryId?: string;
  model3DUrl?: string;
  model3DGridPosition?: number;
  model3DPath?: string;
  videoUrl?: string;
  videoPath?: string;
}
