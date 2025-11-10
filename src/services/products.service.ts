import { Product, ColorWithName } from "@/types";
import { allProducts } from "@/constants/products";

const STORAGE_KEY = "elsa_products";

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
          const color = item as { code: unknown; name: unknown };
          if (
            typeof color.code === "string" &&
            typeof color.name === "string" &&
            color.code.trim().length > 0 &&
            color.name.trim().length > 0
          ) {
            return { code: color.code.trim(), name: color.name.trim() };
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
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return normalizeProducts(parsed as LegacyProduct[]);
      }
    }
  } catch {
    // Si hay error, usar productos por defecto
  }
  // Si no hay productos guardados, usar por defecto normalizados
  const normalizedDefaults = normalizeProducts(allProducts as LegacyProduct[]);
  saveProducts(normalizedDefaults);
  return normalizedDefaults;
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
    return updatedProduct;
  },

  delete: (id: string): boolean => {
    const products = getStoredProducts();
    const filtered = products.filter((p) => p.id !== id);
    if (filtered.length === products.length) return false;

    saveProducts(filtered);
    return true;
  },
};
