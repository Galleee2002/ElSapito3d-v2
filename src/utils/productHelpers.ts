import type { Product } from "@/types";
import { AVAILABLE_COLORS } from "@/constants/colors";

export const getProductImages = (product: Product | undefined): string[] => {
  if (!product) return [];
  return product.images || [product.image];
};

export const createColorVariants = (baseImages: string[]) => {
  return AVAILABLE_COLORS.map((colorOption, index) => ({
    color: colorOption.color,
    name: colorOption.name,
    images:
      baseImages.length > 1
        ? [baseImages[index % baseImages.length], ...baseImages]
        : baseImages,
  }));
};

export const findProductById = (
  productId: string | undefined,
  products: Product[]
): Product | undefined => {
  return products.find((p) => p.id === productId);
};

