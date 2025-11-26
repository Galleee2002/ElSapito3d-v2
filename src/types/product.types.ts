import { ColorWithName, ColorSection } from "./color.types";

export type ColorMode = "default" | "sections";

export interface Accessory {
  name: string;
  price?: number;
}

export interface ProductDimensions {
  width?: number;
  length?: number;
  diameter?: number;
}

export interface BulkPricingRule {
  /**
   * Cantidad mínima de unidades para aplicar este precio.
   * Debe ser un entero mayor o igual a 2.
   */
  minQuantity: number;
  /**
   * Precio final por unidad cuando se alcanza la cantidad mínima.
   * No incluye accesorios.
   */
  unitPrice: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  /**
   * Reglas de precios por cantidad (descuentos por volumen).
   * Ej: a partir de 3 unidades, cada una sale $5000.
   * Se aplica solo al producto principal, no a los accesorios.
   */
  bulkPricingRules?: BulkPricingRule[];
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
  /** @deprecated Usar accessories en su lugar */
  accessory?: Accessory;
  accessories?: Accessory[];
  dimensions?: ProductDimensions;
}
