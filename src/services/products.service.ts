import { Product } from "@/types";
import { allProducts } from "@/constants/products";

const STORAGE_KEY = "elsa_products";

type LegacyProduct = Omit<Product, "description" | "availableColors"> & {
  description?: string;
  availableColors?: unknown;
  badge?: string;
};

const normalizeStock = (value: unknown): number => {
  const numericValue = Number(value);
  if (Number.isNaN(numericValue) || numericValue < 0) {
    return 0;
  }
  return Math.floor(numericValue);
};

const normalizeAvailableColors = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter(
      (color): color is string =>
        typeof color === "string" && color.trim().length > 0
    );
  }
  return [];
};

const normalizeProduct = (product: LegacyProduct): Product => {
  const {
    badge: _legacyBadge,
    availableColors,
    description,
    stock,
    ...rest
  } = product;

  const normalizedDescription =
    description && description.trim().length > 0
      ? description.trim()
      : product.alt ?? product.name;

  return {
    ...rest,
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
