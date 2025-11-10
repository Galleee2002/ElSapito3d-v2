import { Product, ColorWithName } from "@/types";
import { storageService } from "./storage.service";

const STORAGE_KEY = "elsa_products";
const PRODUCTS_CHANGED_EVENT = "products-changed";

const dispatchProductsChanged = (): void => {
  window.dispatchEvent(new CustomEvent(PRODUCTS_CHANGED_EVENT));
};

type LegacyProduct = Omit<Product, "description" | "availableColors" | "image"> & {
  description?: string;
  availableColors?: unknown;
  image?: string | string[];
  badge?: string;
};

const normalizeStock = (value: unknown): number => {
  const numericValue = Number(value);
  if (Number.isNaN(numericValue) || numericValue < 0) {
    return 0;
  }
  return Math.floor(numericValue);
};

const normalizeImage = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      .map((item) => item.trim());
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return [value.trim()];
  }
  return [];
};

const normalizeAvailableColors = (value: unknown): ColorWithName[] => {
  if (Array.isArray(value)) {
    return value
      .map((item): ColorWithName | null => {
        if (typeof item === "object" && item !== null && "code" in item && "name" in item) {
          const color = item as { 
            code: unknown; 
            name: unknown; 
            image?: unknown;
            imageIndex?: unknown;
          };
          if (
            typeof color.code === "string" &&
            typeof color.name === "string" &&
            color.code.trim().length > 0 &&
            color.name.trim().length > 0
          ) {
            const normalizedColor: ColorWithName = { 
              code: color.code.trim(), 
              name: color.name.trim() 
            };
            
            if (typeof color.image === "string" && color.image.trim().length > 0) {
              normalizedColor.image = color.image.trim();
            }
            
            if (typeof color.imageIndex === "number" && color.imageIndex >= 0) {
              normalizedColor.imageIndex = color.imageIndex;
            }
            
            return normalizedColor;
          }
        }
        if (typeof item === "string" && item.trim().length > 0) {
          return { code: item.trim(), name: item.trim() };
        }
        return null;
      })
      .filter((color): color is ColorWithName => color !== null);
  }
  return [];
};

const normalizeProduct = (product: LegacyProduct): Product => {
  const {
    badge: _legacyBadge,
    availableColors,
    description,
    stock,
    image,
    ...rest
  } = product;

  const normalizedDescription =
    description && description.trim().length > 0
      ? description.trim()
      : product.alt ?? product.name;

  return {
    ...rest,
    image: normalizeImage(image),
    description: normalizedDescription,
    availableColors: normalizeAvailableColors(availableColors),
    stock: normalizeStock(stock),
  };
};

const normalizeProducts = (products: LegacyProduct[]): Product[] =>
  products.map((product) => normalizeProduct(product));

const saveProducts = (products: Product[]): void => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(normalizeProducts(products))
  );
};

const getStoredProducts = (): Product[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return normalizeProducts(parsed as LegacyProduct[]);
      }
    }
  } catch {
    return [];
  }
  return [];
};

export const productsService = {
  getAll: (): Product[] => {
    return getStoredProducts();
  },

  add: (product: Omit<Product, "id">): Product => {
    const products = getStoredProducts();
    const newId = String(Date.now());
    const newProduct: Product = {
      ...product,
      id: newId,
      image: normalizeImage(product.image),
      stock: normalizeStock(product.stock),
      availableColors: normalizeAvailableColors(product.availableColors),
      description: product.description.trim(),
    };
    products.push(newProduct);
    saveProducts(products);
    dispatchProductsChanged();
    return newProduct;
  },

  update: (
    id: string,
    updates: Partial<Omit<Product, "id">>
  ): Product | null => {
    const products = getStoredProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const currentProduct = products[index];

    const updatedProduct: Product = {
      ...currentProduct,
      ...updates,
      image: updates.image !== undefined
        ? normalizeImage(updates.image)
        : currentProduct.image,
      description: updates.description
        ? updates.description.trim()
        : currentProduct.description,
      availableColors: updates.availableColors
        ? normalizeAvailableColors(updates.availableColors)
        : currentProduct.availableColors,
      stock:
        updates.stock !== undefined
          ? normalizeStock(updates.stock)
          : currentProduct.stock,
    };

    products[index] = updatedProduct;
    saveProducts(products);
    dispatchProductsChanged();
    return updatedProduct;
  },

  delete: async (id: string): Promise<boolean> => {
    const products = getStoredProducts();
    const productToDelete = products.find((p) => p.id === id);
    
    if (!productToDelete) return false;

    const filtered = products.filter((p) => p.id !== id);
    if (filtered.length === products.length) return false;

    const hasSupabaseImages = productToDelete.image.some((url) => {
      try {
        const urlObj = new URL(url);
        return urlObj.hostname.includes("supabase.co") || urlObj.hostname.includes("supabase");
      } catch {
        return false;
      }
    });

    if (hasSupabaseImages) {
      await storageService.deleteProductImages(id);
    }

    saveProducts(filtered);
    dispatchProductsChanged();
    return true;
  },

  onProductsChanged: (callback: () => void): (() => void) => {
    const handler = () => callback();
    window.addEventListener(PRODUCTS_CHANGED_EVENT, handler);
    return () => window.removeEventListener(PRODUCTS_CHANGED_EVENT, handler);
  },
};
